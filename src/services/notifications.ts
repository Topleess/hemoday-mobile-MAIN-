/**
 * Notification service for HemoDay
 * Supports both Web (browser/PWA) and Native (Capacitor Android/iOS) push notifications
 */
import { Capacitor } from '@capacitor/core';
import api from '../utils/api';

// Dynamic import for Capacitor Push - only available in native builds
let PushNotifications: any = null;

const loadCapacitorPush = async () => {
    if (Capacitor.isNativePlatform()) {
        try {
            const module = await import('@capacitor/push-notifications');
            PushNotifications = module.PushNotifications;
        } catch (e) {
            console.warn('Push notifications plugin not available:', e);
        }
    }
};

class NotificationService {
    private swRegistration: ServiceWorkerRegistration | null = null;
    private permissionGranted = false;
    private fcmToken: string | null = null;
    private isNative = Capacitor.isNativePlatform();

    /**
     * Check if notifications are supported
     */
    isSupported(): boolean {
        if (this.isNative) return true;
        return 'Notification' in window && 'serviceWorker' in navigator;
    }

    /**
     * Get current permission status
     */
    getPermission(): NotificationPermission | 'unsupported' {
        if (this.isNative) {
            return this.permissionGranted ? 'granted' : 'default';
        }
        if (!('Notification' in window)) return 'unsupported';
        return Notification.permission;
    }

    /**
     * Request notification permission and register for push
     * Returns true if permission was granted
     */
    async requestPermission(): Promise<boolean> {
        if (this.isNative) {
            return this.requestNativePermission();
        }
        return this.requestWebPermission();
    }

    /**
     * Native (Capacitor) permission + FCM registration
     */
    private async requestNativePermission(): Promise<boolean> {
        await loadCapacitorPush();
        if (!PushNotifications) {
            console.warn('Push notifications not available on this platform');
            return false;
        }

        try {
            const permResult = await PushNotifications.requestPermissions();
            if (permResult.receive !== 'granted') {
                console.warn('Push permission denied:', permResult.receive);
                return false;
            }

            // Register with FCM/APNs
            await PushNotifications.register();

            // Listen for registration success
            return new Promise<boolean>((resolve) => {
                PushNotifications.addListener('registration', async (token: { value: string }) => {
                    console.log('FCM Token:', token.value);
                    this.fcmToken = token.value;
                    this.permissionGranted = true;

                    // Send token to backend
                    await this.registerTokenOnBackend(token.value, Capacitor.getPlatform());
                    resolve(true);
                });

                PushNotifications.addListener('registrationError', (error: any) => {
                    console.error('Push registration error:', error);
                    resolve(false);
                });

                // Handle incoming notifications while app is open
                PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
                    console.log('Push received:', notification);
                    // The notification is shown automatically by the OS on Android/iOS
                });

                // Handle notification tap
                PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
                    console.log('Push action:', action);
                    // Navigate to relevant screen if needed
                });

                // Timeout after 10 seconds
                setTimeout(() => resolve(false), 10000);
            });
        } catch (error) {
            console.error('Failed to setup native push:', error);
            return false;
        }
    }

    /**
     * Web/PWA permission + Service Worker registration
     */
    private async requestWebPermission(): Promise<boolean> {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            console.warn('Web notifications not supported');
            return false;
        }

        try {
            // Register service worker
            this.swRegistration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            // Request permission
            const permission = await Notification.requestPermission();
            this.permissionGranted = permission === 'granted';

            if (this.permissionGranted) {
                // Register a "web" token for backend tracking
                await this.registerTokenOnBackend(`web-${Date.now()}-${Math.random().toString(36).slice(2)}`, 'web');
            }

            return this.permissionGranted;
        } catch (error) {
            console.error('Failed to setup web push:', error);
            return false;
        }
    }

    /**
     * Register FCM token on backend
     */
    private async registerTokenOnBackend(token: string, platform: string): Promise<void> {
        try {
            await api.post('/notifications/register-token', { token, platform });
            console.log('Token registered on backend');
        } catch (error) {
            console.error('Failed to register token on backend:', error);
        }
    }

    /**
     * Unregister token from backend (e.g., on logout)
     */
    async unregisterToken(): Promise<void> {
        if (this.fcmToken) {
            try {
                await api.delete('/notifications/unregister-token', {
                    data: { token: this.fcmToken }
                });
            } catch (e) {
                console.error('Failed to unregister token:', e);
            }
        }
    }

    /**
     * Show an immediate notification (web only — native notifications come from backend)
     */
    async showNotification(title: string, body: string, tag?: string): Promise<void> {
        if (this.isNative) {
            // On native, send via backend which pushes through FCM
            try {
                await api.post('/notifications/test');
            } catch (e) {
                console.error('Failed to send test notification:', e);
            }
            return;
        }

        // Web notification
        if (Notification.permission !== 'granted') return;

        if (!this.swRegistration) {
            try {
                this.swRegistration = await navigator.serviceWorker.ready;
            } catch {
                new Notification(title, { body, icon: '/web-app-manifest-192x192.png' });
                return;
            }
        }

        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_NOTIFICATION',
                title,
                body,
                tag: tag || 'hemoday-' + Date.now()
            });
        } else {
            this.swRegistration.showNotification(title, {
                body,
                icon: '/web-app-manifest-192x192.png',
                badge: '/favicon-96x96.png',
                tag: tag || 'hemoday-' + Date.now(),
                vibrate: [200, 100, 200]
            });
        }
    }

    /**
     * Schedule a notification for a specific time today (web only)
     * On native, backend handles scheduling via FCM
     */
    async scheduleForToday(title: string, body: string, timeStr: string, tag?: string): Promise<boolean> {
        // On native, backend cron handles this — no need to schedule locally
        if (this.isNative) return true;

        if (Notification.permission !== 'granted') return false;

        const [hours, minutes] = timeStr.split(':').map(Number);
        const now = new Date();
        const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);

        const delay = target.getTime() - now.getTime();
        if (delay <= 0) return false;

        if (!this.swRegistration) {
            this.swRegistration = await navigator.serviceWorker.ready;
        }

        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SCHEDULE_NOTIFICATION',
                title,
                body,
                delay,
                tag: tag || `hemoday-scheduled-${Date.now()}`
            });
            return true;
        }

        setTimeout(() => {
            this.showNotification(title, body, tag);
        }, delay);
        return true;
    }

    /**
     * Schedule notifications for today's reminders (web only)
     */
    async scheduleReminders(reminders: Array<{
        id: string;
        title: string;
        time: string;
        note?: string;
        date: string;
        repeat: string;
        repeatEndDate?: string;
        cancelledDates?: string;
    }>): Promise<number> {
        // On native, backend cron handles this
        if (this.isNative) return 0;

        if (Notification.permission !== 'granted') return 0;

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        let scheduled = 0;

        for (const reminder of reminders) {
            const isActiveToday = this.isReminderActiveOnDate(reminder, todayStr);
            if (!isActiveToday) continue;

            const success = await this.scheduleForToday(
                reminder.title,
                reminder.note || 'Напоминание из HemoDay',
                reminder.time,
                `reminder-${reminder.id}-${todayStr}`
            );

            if (success) scheduled++;
        }

        return scheduled;
    }

    private isReminderActiveOnDate(reminder: {
        date: string;
        repeat: string;
        repeatEndDate?: string;
        cancelledDates?: string;
    }, dateStr: string): boolean {
        // Check cancelled dates
        if (reminder.cancelledDates) {
            const cancelled = reminder.cancelledDates.split(',');
            if (cancelled.includes(dateStr)) return false;
        }

        if (reminder.date === dateStr) return true;

        const repeat = reminder.repeat;
        if (!repeat || repeat === 'Никогда') return false;

        const targetDate = new Date(dateStr);
        const originDate = new Date(reminder.date);

        if (targetDate <= originDate) return false;

        if (reminder.repeatEndDate) {
            const endDate = new Date(reminder.repeatEndDate);
            if (targetDate > endDate) return false;
        }

        if (repeat === 'Ежедневно') return true;
        if (repeat === 'Еженедельно') return targetDate.getDay() === originDate.getDay();
        if (repeat === 'Ежемесячно') return targetDate.getDate() === originDate.getDate();

        return false;
    }

    /**
     * Disable notifications
     */
    async disable(): Promise<void> {
        this.permissionGranted = false;
        await this.unregisterToken();
    }
}

export const notificationService = new NotificationService();
