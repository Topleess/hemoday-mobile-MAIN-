/**
 * Yandex Metrika analytics wrapper for HemoDay
 *
 * IMPORTANT: Replace COUNTER_ID with your actual Yandex Metrika counter ID
 * Also update the counter ID in index.html
 */

const COUNTER_ID = 106264847; // TODO: Replace with real counter ID

declare global {
    interface Window {
        ym: (...args: any[]) => void;
    }
}

/**
 * Track a virtual page view (for SPA navigation)
 */
export function trackPageView(screenName: string): void {
    try {
        if (window.ym) {
            window.ym(COUNTER_ID, 'hit', `/${screenName.toLowerCase()}`, {
                title: screenName
            });
        }
    } catch (e) {
        // Silently fail - analytics should never break the app
    }
}

/**
 * Track a custom event/goal
 */
export function trackEvent(eventName: string, params?: Record<string, any>): void {
    try {
        if (window.ym) {
            window.ym(COUNTER_ID, 'reachGoal', eventName, params);
        }
    } catch (e) {
        // Silently fail
    }
}

/**
 * Track user parameters
 */
export function setUserParams(params: Record<string, any>): void {
    try {
        if (window.ym) {
            window.ym(COUNTER_ID, 'userParams', params);
        }
    } catch (e) {
        // Silently fail
    }
}

// Pre-defined event names for consistency
export const AnalyticsEvents = {
    // Auth
    LOGIN: 'login',
    REGISTER: 'register',
    LOGOUT: 'logout',

    // Transfusions
    ADD_TRANSFUSION: 'add_transfusion',
    EDIT_TRANSFUSION: 'edit_transfusion',
    DELETE_TRANSFUSION: 'delete_transfusion',

    // Analyses
    ADD_ANALYSIS: 'add_analysis',
    DELETE_ANALYSIS: 'delete_analysis',

    // Reminders
    ADD_REMINDER: 'add_reminder',
    DELETE_REMINDER: 'delete_reminder',
    ENABLE_NOTIFICATIONS: 'enable_notifications',
    DISABLE_NOTIFICATIONS: 'disable_notifications',

    // Navigation
    VIEW_CHART: 'view_chart',
    SHARE_DATA: 'share_data',

    // Sync
    SYNC_SUCCESS: 'sync_success',
    SYNC_FAIL: 'sync_fail',
};
