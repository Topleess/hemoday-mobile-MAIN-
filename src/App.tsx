import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, BarChart3, User as UserIcon } from 'lucide-react';
import { seedDefaultData } from './database/seedDefaultData';

// Import screens
import { AuthScreen, ChangePasswordScreen } from './screens/auth';
import { CalendarScreen, DataScreen, ProfileScreen, LegalScreen } from './screens/main';
import { AddTransfusionScreen } from './screens/transfusions';
import { AddAnalysisScreen, AddAnalysisTemplateScreen } from './screens/analyses';
import { AddReminderScreen } from './screens/reminders';
import { ShareDataScreen, MyDataScreen } from './screens/profile';
import { Onboarding, NotificationOverlay } from './components';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

// Import types and data
import { ScreenName } from './types';
import { MOCK_TRANSFUSIONS, MOCK_ANALYSES, MOCK_REMINDERS } from './data/mockData';
import AnalysisTemplate from './database/models/AnalysisTemplate';
import { authService } from './services/auth';
import { sync } from './database/sync';

export default function App() {
    return (
        <NotificationProvider>
            <AppContent />
        </NotificationProvider>
    );
}

function AppContent() {
    const { showToast, setLoading } = useNotification();
    const [returnScreen, setReturnScreen] = useState<ScreenName>('PROFILE');

    const [currentScreen, setCurrentScreen] = useState<ScreenName>('AUTH_LOGIN');
    const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [editingTemplate, setEditingTemplate] = useState<AnalysisTemplate | null>(null);

    // Seed default data on mount and check auth
    useEffect(() => {
        const initArgs = async () => {
            await seedDefaultData();
            if (authService.isAuthenticated()) {
                setIsLoggedIn(true);
                setCurrentScreen('CALENDAR');
                try {
                    await sync();
                } catch (e) {
                    console.error('Initial sync failed', e);
                }
            }
        };
        initArgs().catch(console.error);
    }, []);

    const handleLogin = async () => {
        setIsLoggedIn(true);
        setCurrentScreen('CALENDAR');
        try {
            await sync();
        } catch (e) {
            console.error('Sync after login failed', e);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await sync();
        } catch (e) {
            console.error('Logout sync failed', e);
        }
        await authService.logout();
        setLoading(false);
        setIsLoggedIn(false);
        setIsGuest(false);
        setCurrentScreen('AUTH_LOGIN');
    };

    const handleGuestLogin = () => {
        setIsGuest(true);
        setIsLoggedIn(true);
        setCurrentScreen('PROFILE');
    };

    const handleNotificationToggle = () => {
        const newState = !notificationsEnabled;
        setNotificationsEnabled(newState);
        if (newState) {
            showToast({ message: "Уведомления включены", type: 'success' });
        }
    };

    const sendTestNotification = () => {
        showToast({ message: "Тестовое уведомление отправлено!", type: 'info' });
    };

    const [dataTab, setDataTab] = useState<'transfusions' | 'analyses' | 'reminders' | 'chart'>('transfusions');

    const handleTabChange = async (screen: ScreenName) => {
        setCurrentScreen(screen);
        try {
            await sync();
        } catch (e) {
            console.error('Tab sync failed', e);
        }
    };

    const handleNavigate = (screen: ScreenName) => {
        if (['ADD_TRANSFUSION', 'ADD_ANALYSIS', 'ADD_REMINDER'].includes(screen)) {
            setReturnScreen(currentScreen);
            setEditingItem(null); // CRITICAL: Clear editing state when adding new item
        }
        setCurrentScreen(screen);
    };

    const handleEditItem = (type: 'transfusion' | 'analysis' | 'reminder', item: any) => {
        setEditingItem(item);
        setReturnScreen(currentScreen);
        if (type === 'transfusion') setCurrentScreen('ADD_TRANSFUSION');
        else if (type === 'analysis') setCurrentScreen('ADD_ANALYSIS');
        else if (type === 'reminder') setCurrentScreen('ADD_REMINDER');
    };

    const handleEditTemplate = (template: AnalysisTemplate | null) => {
        setEditingTemplate(template);
        setReturnScreen('MY_DATA');
        setCurrentScreen('ADD_ANALYSIS_TEMPLATE');
    };

    // Unified fast transition variants
    const transitionVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.15, ease: "easeOut" }
    };

    // Main screen rendering
    const renderScreen = () => {
        let displayScreen = currentScreen;
        const overlays = ['LEGAL_TERMS', 'LEGAL_PRIVACY', 'CHANGE_PASSWORD', 'SHARE_DATA', 'MY_DATA'];

        // If an overlay is active, keep showing the previous screen underneath
        if (overlays.includes(currentScreen)) {
            displayScreen = returnScreen;
        }

        let content = null;
        switch (displayScreen) {
            case 'AUTH_LOGIN':
            case 'AUTH_REGISTER':
            case 'AUTH_FORGOT':
                content = <AuthScreen
                    mode={authMode}
                    setMode={setAuthMode}
                    onLogin={handleLogin}
                    onSkip={handleGuestLogin}
                    onNavigate={(screen) => {
                        if (screen === 'LEGAL_TERMS' || screen === 'LEGAL_PRIVACY') {
                            setReturnScreen(currentScreen);
                        }
                        setCurrentScreen(screen);
                    }}
                    onRegister={() => {
                        setIsLoggedIn(true);
                        setCurrentScreen('ONBOARDING');
                    }}
                />;
                break;

            case 'ONBOARDING':
                content = <Onboarding
                    onComplete={() => setCurrentScreen('CALENDAR')}
                    onSkip={() => setCurrentScreen('CALENDAR')}
                />;
                break;

            case 'LEGAL_TERMS':
            case 'LEGAL_PRIVACY':
                // Should not happen with displayScreen logic above, but for safety:
                return null;

            case 'CALENDAR':
                content = <CalendarScreen transfusions={MOCK_TRANSFUSIONS} reminders={MOCK_REMINDERS} onNavigate={handleNavigate} onEdit={handleEditItem} />;
                break;

            case 'DATA':
                content = <DataScreen
                    transfusions={MOCK_TRANSFUSIONS}
                    analyses={MOCK_ANALYSES}
                    reminders={MOCK_REMINDERS}
                    activeTab={dataTab}
                    onTabChange={setDataTab}
                    onNavigate={handleNavigate}
                    onEdit={handleEditItem}
                />;
                break;

            case 'ADD_TRANSFUSION':
                content = <AddTransfusionScreen onClose={() => setCurrentScreen(returnScreen)} initialData={editingItem} />;
                break;

            case 'ADD_ANALYSIS':
                content = <AddAnalysisScreen onClose={() => setCurrentScreen(returnScreen)} initialData={editingItem} />;
                break;

            case 'ADD_REMINDER':
                content = <AddReminderScreen onClose={() => setCurrentScreen(returnScreen)} initialData={editingItem} />;
                break;

            case 'ADD_ANALYSIS_TEMPLATE':
                content = <AddAnalysisTemplateScreen onClose={() => setCurrentScreen('MY_DATA')} initialData={editingTemplate || undefined} />;
                break;

            case 'PROFILE':
                content = <ProfileScreen
                    onLogout={handleLogout}
                    onNavigate={(screen) => {
                        if (['LEGAL_TERMS', 'LEGAL_PRIVACY'].includes(screen)) {
                            setReturnScreen('PROFILE');
                        }
                        setCurrentScreen(screen);
                    }}
                    notificationsEnabled={notificationsEnabled}
                    onToggleNotifications={handleNotificationToggle}
                    onTestNotification={sendTestNotification}
                    isGuest={isGuest}
                />;
                break;

            default:
                if (!isLoggedIn) return null; // Let effect handle it
                content = <CalendarScreen transfusions={MOCK_TRANSFUSIONS} reminders={MOCK_REMINDERS} onNavigate={handleNavigate} onEdit={handleEditItem} />;
        }

        return (
            <motion.div
                key={displayScreen}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={transitionVariants}
                className="w-full absolute inset-0 overflow-y-auto overflow-x-hidden pb-24"
            >
                {content}
            </motion.div>
        );
    };

    // Overlay/Modal screens
    const renderOverlays = () => {
        let content = null;
        let key = "none";

        switch (currentScreen) {
            case 'LEGAL_TERMS':
                key = 'LEGAL_TERMS';
                content = <LegalScreen type="terms" onBack={() => setCurrentScreen(returnScreen)} />;
                break;
            case 'LEGAL_PRIVACY':
                key = 'LEGAL_PRIVACY';
                content = <LegalScreen type="privacy" onBack={() => setCurrentScreen(returnScreen)} />;
                break;
            case 'CHANGE_PASSWORD':
                key = 'CHANGE_PASSWORD';
                content = <ChangePasswordScreen onBack={() => setCurrentScreen('PROFILE')} initialEmail="" />;
                break;
            case 'SHARE_DATA':
                key = 'SHARE_DATA';
                content = <ShareDataScreen onBack={() => setCurrentScreen('PROFILE')} />;
                break;
            case 'MY_DATA':
                key = 'MY_DATA';
                content = <MyDataScreen
                    onBack={() => setCurrentScreen('PROFILE')}
                    onEditTemplate={handleEditTemplate}
                />;
                break;
            default:
                return null;
        }

        return (
            <motion.div
                key={key}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={transitionVariants}
                className="fixed inset-0 z-50 bg-white overflow-y-auto overflow-x-hidden"
            >
                {content}
            </motion.div>
        );
    };

    const showBottomNav = isLoggedIn && ['CALENDAR', 'DATA', 'PROFILE'].includes(currentScreen);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-red-100 max-w-md mx-auto shadow-2xl relative border-x border-gray-200">

            <main className="min-h-screen relative overflow-hidden">
                <AnimatePresence>
                    {renderScreen()}
                </AnimatePresence>
                <AnimatePresence>
                    {renderOverlays()}
                </AnimatePresence>
            </main>

            {showBottomNav && (
                <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around items-center py-3 pb-6 z-40">
                    <button onClick={() => handleTabChange('CALENDAR')} className={`flex flex-col items-center gap-1 ${currentScreen === 'CALENDAR' ? 'text-red-500' : 'text-gray-400'}`}>
                        <CalendarIcon size={24} />
                        <span className="text-[10px] font-medium">Календарь</span>
                    </button>
                    <button onClick={() => handleTabChange('DATA')} className={`flex flex-col items-center gap-1 ${currentScreen === 'DATA' ? 'text-red-500' : 'text-gray-400'}`}>
                        <BarChart3 size={24} />
                        <span className="text-[10px] font-medium">Данные</span>
                    </button>
                    <button onClick={() => handleTabChange('PROFILE')} className={`flex flex-col items-center gap-1 ${currentScreen === 'PROFILE' ? 'text-red-500' : 'text-gray-400'}`}>
                        <UserIcon size={24} />
                        <span className="text-[10px] font-medium">Профиль</span>
                    </button>
                </div>
            )}

            <NotificationOverlay />
        </div>
    );
}
