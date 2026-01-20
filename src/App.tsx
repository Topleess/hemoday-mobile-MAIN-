import React, { useState } from 'react';
import { Calendar as CalendarIcon, BarChart3, User as UserIcon } from 'lucide-react';

// Import screens
import { AuthScreen, ChangePasswordScreen } from './screens/auth';
import { CalendarScreen, DataScreen, ProfileScreen, LegalScreen } from './screens/main';
import { AddTransfusionScreen } from './screens/transfusions';
import { AddAnalysisScreen } from './screens/analyses';
import { AddReminderScreen } from './screens/reminders';
import { ShareDataScreen, MyDataScreen } from './screens/profile';

// Import types and data
import { ScreenName } from './types';
import { MOCK_TRANSFUSIONS, MOCK_ANALYSES, MOCK_REMINDERS } from './data/mockData';

export default function App() {
    const [currentScreen, setCurrentScreen] = useState<ScreenName>('AUTH_LOGIN');
    const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');

    // App state
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Auth handlers
    const handleLogin = () => {
        setIsLoggedIn(true);
        setIsGuest(false);
        setCurrentScreen('CALENDAR');
    };

    const handleGuestLogin = () => {
        setIsLoggedIn(true);
        setIsGuest(true);
        setCurrentScreen('CALENDAR');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsGuest(false);
        setCurrentScreen('AUTH_LOGIN');
        setAuthMode('login');
    };

    // Edit handlers
    const handleEditItem = (type: 'transfusion' | 'analysis' | 'reminder', item: any) => {
        setEditingItem(item);
        if (type === 'transfusion') setCurrentScreen('EDIT_TRANSFUSION');
        if (type === 'analysis') setCurrentScreen('EDIT_ANALYSIS');
        if (type === 'reminder') setCurrentScreen('EDIT_REMINDER');
    };

    const handleCloseOverlay = () => {
        setEditingItem(null);
        setCurrentScreen('DATA');
    };

    // Notification handlers
    const handleNotificationToggle = async () => {
        if (!notificationsEnabled) {
            if (!("Notification" in window)) {
                alert("Ваш браузер не поддерживает уведомления.");
                return;
            }

            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotificationsEnabled(true);
                new Notification("HemoDay", {
                    body: "Уведомления включены! Теперь вы не пропустите напоминания.",
                    icon: "/icon.png"
                });
            } else {
                alert("Пожалуйста, разрешите уведомления в настройках браузера.");
            }
        } else {
            setNotificationsEnabled(false);
        }
    };

    const sendTestNotification = () => {
        if (notificationsEnabled && Notification.permission === 'granted') {
            new Notification("Напоминание HemoDay", {
                body: "Время принять лекарство!",
            });
        } else {
            alert("Уведомления выключены или заблокированы.");
        }
    };

    // Main screen rendering
    const renderScreen = () => {
        switch (currentScreen) {
            case 'AUTH_LOGIN':
            case 'AUTH_REGISTER':
            case 'AUTH_FORGOT':
                return <AuthScreen mode={authMode} setMode={setAuthMode} onLogin={handleLogin} onSkip={handleGuestLogin} onNavigate={setCurrentScreen} />;

            case 'CALENDAR':
                return <CalendarScreen
                    transfusions={MOCK_TRANSFUSIONS}
                    reminders={MOCK_REMINDERS}
                    onNavigate={setCurrentScreen}
                    onEdit={handleEditItem}
                />;

            case 'DATA':
                return <DataScreen
                    transfusions={MOCK_TRANSFUSIONS}
                    analyses={MOCK_ANALYSES}
                    reminders={MOCK_REMINDERS}
                    onNavigate={setCurrentScreen}
                    onEdit={handleEditItem}
                />;

            case 'PROFILE':
                return <ProfileScreen
                    onLogout={handleLogout}
                    onNavigate={setCurrentScreen}
                    notificationsEnabled={notificationsEnabled}
                    onToggleNotifications={handleNotificationToggle}
                    onTestNotification={sendTestNotification}
                    isGuest={isGuest}
                />;

            default:
                return <CalendarScreen transfusions={MOCK_TRANSFUSIONS} reminders={MOCK_REMINDERS} onNavigate={setCurrentScreen} onEdit={handleEditItem} />;
        }
    };

    // Overlay/Modal screens
    const renderOverlays = () => {
        switch (currentScreen) {
            case 'ADD_TRANSFUSION':
                return <AddTransfusionScreen onClose={() => setCurrentScreen('CALENDAR')} />;
            case 'EDIT_TRANSFUSION':
                return <AddTransfusionScreen onClose={handleCloseOverlay} initialData={editingItem} />;

            case 'ADD_ANALYSIS':
                return <AddAnalysisScreen onClose={() => setCurrentScreen('CALENDAR')} />;
            case 'EDIT_ANALYSIS':
                return <AddAnalysisScreen onClose={handleCloseOverlay} initialData={editingItem} />;

            case 'ADD_REMINDER':
                return <AddReminderScreen onClose={() => setCurrentScreen('CALENDAR')} />;
            case 'EDIT_REMINDER':
                return <AddReminderScreen onClose={handleCloseOverlay} initialData={editingItem} />;

            case 'LEGAL_TERMS':
                return <LegalScreen type="terms" onBack={() => setCurrentScreen('PROFILE')} />;
            case 'LEGAL_PRIVACY':
                return <LegalScreen type="privacy" onBack={() => setCurrentScreen('PROFILE')} />;
            case 'CHANGE_PASSWORD':
                return <ChangePasswordScreen onBack={() => setCurrentScreen('PROFILE')} initialEmail={isGuest ? '' : 'user@example.com'} />;
            case 'SHARE_DATA':
                return <ShareDataScreen onBack={() => setCurrentScreen('PROFILE')} />;
            case 'MY_DATA':
                return <MyDataScreen onBack={() => setCurrentScreen('PROFILE')} />;
            default:
                return null;
        }
    };

    const showBottomNav = isLoggedIn && ['CALENDAR', 'DATA', 'PROFILE'].includes(currentScreen);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-red-100 max-w-md mx-auto shadow-2xl relative border-x border-gray-200">

            <main className="min-h-screen relative">
                {renderScreen()}
                {renderOverlays()}
            </main>

            {showBottomNav && (
                <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around items-center py-3 pb-6 z-40">
                    <button onClick={() => setCurrentScreen('CALENDAR')} className={`flex flex-col items-center gap-1 ${currentScreen === 'CALENDAR' ? 'text-red-500' : 'text-gray-400'}`}>
                        <CalendarIcon size={24} />
                        <span className="text-[10px] font-medium">Календарь</span>
                    </button>
                    <button onClick={() => setCurrentScreen('DATA')} className={`flex flex-col items-center gap-1 ${currentScreen === 'DATA' ? 'text-red-500' : 'text-gray-400'}`}>
                        <BarChart3 size={24} />
                        <span className="text-[10px] font-medium">Данные</span>
                    </button>
                    <button onClick={() => setCurrentScreen('PROFILE')} className={`flex flex-col items-center gap-1 ${currentScreen === 'PROFILE' ? 'text-red-500' : 'text-gray-400'}`}>
                        <UserIcon size={24} />
                        <span className="text-[10px] font-medium">Профиль</span>
                    </button>
                </div>
            )}
        </div>
    );
}
