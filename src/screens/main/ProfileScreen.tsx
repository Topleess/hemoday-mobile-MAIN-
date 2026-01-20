import React from 'react';
import { User as UserIcon, Folder, ChevronRight, Bell, Lock, FileCheck, FileText, LogOut, CheckCircle2, Share2 } from 'lucide-react';
import { Header, Card, Button, Toggle } from '../../components';
import { ScreenName } from '../../types';

interface ProfileScreenProps {
    onLogout: () => void;
    onNavigate: (s: ScreenName) => void;
    notificationsEnabled: boolean;
    onToggleNotifications: () => void;
    onTestNotification: () => void;
    isGuest: boolean;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
    onLogout,
    onNavigate,
    notificationsEnabled,
    onToggleNotifications,
    onTestNotification,
    isGuest
}) => (
    <div className="pb-24">
        <Header title="Профиль" />

        {/* Guest Warning */}
        {isGuest && (
            <div className="px-4 mt-4 mb-6">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="text-orange-500 text-2xl">⚠️</div>
                        <div>
                            <p className="text-sm font-semibold text-orange-900">Гостевой режим</p>
                            <p className="text-xs text-orange-700 mt-1">
                                Вы просматриваете приложение в гостевом режиме. Ваши данные не сохраняются и синхронизация недоступна.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="px-4 mb-6">
            <Card className="flex items-center gap-4 p-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isGuest ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <UserIcon size={24} className={isGuest ? "text-orange-500" : "text-gray-400"} />
                </div>
                <div>
                    <p className="font-bold text-gray-900 text-lg">
                        {isGuest ? 'Гость' : 'user@example.com'}
                    </p>
                    <p className="text-gray-500">
                        {isGuest ? 'Ограниченный доступ' : 'Пользователь'}
                    </p>
                </div>
            </Card>
        </div>

        {/* Auth buttons for guests */}
        {isGuest ? (
            <div className="px-4 space-y-3 mb-6">
                <Button variant="primary" fullWidth onClick={onLogout} className="justify-center">
                    Войти
                </Button>
                <Button variant="secondary" fullWidth onClick={onLogout} className="justify-center">
                    Зарегистрироваться
                </Button>
            </div>
        ) : (
            <div className="px-4 mb-6 space-y-3">
                <Button variant="secondary" fullWidth onClick={() => onNavigate('MY_DATA')} className="justify-between group">
                    <span className="flex items-center gap-2">
                        <Folder size={20} />
                        Мои данные
                    </span>
                    <ChevronRight size={20} className="opacity-50 group-hover:opacity-100" />
                </Button>

                <Button variant="secondary" fullWidth onClick={() => onNavigate('SHARE_DATA')} className="justify-between group">
                    <span className="flex items-center gap-2">
                        <Share2 size={20} />
                        Делиться данными
                    </span>
                    <ChevronRight size={20} className="opacity-50 group-hover:opacity-100" />
                </Button>
            </div>
        )}

        <div className="px-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase ml-1 mb-2">Настройки</h3>
            <div className="space-y-3">
                <Card className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 text-gray-700">
                        <Bell size={20} className="text-indigo-500" />
                        <div>
                            <p className="font-medium text-gray-900">Push-уведомления</p>
                            <p className="text-xs text-gray-500">Напоминания об анализах</p>
                        </div>
                    </div>
                    <Toggle checked={notificationsEnabled} onChange={onToggleNotifications} />
                </Card>

                {notificationsEnabled && (
                    <Button variant="outline" className="text-xs py-2 !border-indigo-100 !text-indigo-500 w-full" onClick={onTestNotification}>
                        <CheckCircle2 size={14} /> Проверить уведомления
                    </Button>
                )}
            </div>
        </div>

        <div className="px-4 mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase ml-1 mb-2">Аккаунт</h3>
            <div className="space-y-3">
                {!isGuest && (
                    <Card onClick={() => onNavigate('CHANGE_PASSWORD')} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center gap-3 text-gray-700">
                            <Lock size={20} className="text-blue-500" />
                            <span>Сменить пароль</span>
                        </div>
                        <ChevronRight className="text-gray-300" />
                    </Card>
                )}

                <Card onClick={() => onNavigate('LEGAL_PRIVACY')} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3 text-gray-700">
                        <FileCheck size={20} className="text-gray-500" />
                        <span>Политика конфиденциальности</span>
                    </div>
                    <ChevronRight className="text-gray-300" />
                </Card>

                <Card onClick={() => onNavigate('LEGAL_TERMS')} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3 text-gray-700">
                        <FileText size={20} className="text-gray-500" />
                        <span>Условия сервиса</span>
                    </div>
                    <ChevronRight className="text-gray-300" />
                </Card>
            </div>
        </div>

        {!isGuest && (
            <div className="px-4 mt-6">
                <Button onClick={onLogout} variant="outline" fullWidth className="!text-red-500 !border-red-100 hover:!bg-red-50">
                    <LogOut size={20} />
                    Выйти
                </Button>
            </div>
        )}
    </div>
);

export const LegalScreen: React.FC<{ type: 'terms' | 'privacy'; onBack: () => void }> = ({ type, onBack }) => {
    const title = type === 'terms' ? 'Условия сервиса' : 'Конфиденциальность';

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <Header title={title} onBack={onBack} />
            <div className="p-6 overflow-y-auto pb-24">
                <div className="space-y-4 text-gray-600">
                    <p className="font-medium text-gray-900">Последнее обновление: 12 сентября 2025</p>

                    <p>
                        Это демонстрационный текст. В реальном приложении здесь будет располагаться юридически значимая информация, касающаяся {type === 'terms' ? 'правил использования сервиса' : 'обработки персональных данных'}.
                    </p>

                    <h3 className="text-lg font-bold text-gray-900 mt-6">1. Общие положения</h3>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>

                    <h3 className="text-lg font-bold text-gray-900 mt-6">2. {type === 'terms' ? 'Права и обязанности' : 'Сбор данных'}</h3>
                    <p>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>

                    <h3 className="text-lg font-bold text-gray-900 mt-6">3. {type === 'terms' ? 'Отказ от ответственности' : 'Хранение и защита'}</h3>
                    <p>
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                    </p>
                </div>
            </div>
        </div>
    );
};
