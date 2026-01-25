import React, { useState } from 'react';
import { Droplet } from 'lucide-react';
import { Button, Input } from '../../components';
import { ScreenName } from '../../types';
import { authService } from '../../services/auth';
import { useNotification } from '../../context/NotificationContext';

interface AuthScreenProps {
    mode: 'login' | 'register' | 'forgot';
    setMode: (m: 'login' | 'register' | 'forgot') => void;
    onLogin: () => void;
    onSkip: () => void;
    onNavigate?: (screen: ScreenName) => void;
    onRegister?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ mode, setMode, onLogin, onSkip, onNavigate, onRegister }) => {
    const { showAlert, setLoading } = useNotification();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setInternalLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);
        setLoading(true);
        setInternalLoading(true);

        try {
            if (mode === 'login') {
                if (!email || !password) throw new Error('Заполните все поля');
                await authService.login({ email, password });
                onLogin();
            } else if (mode === 'register') {
                if (!email || !password || !confirmPassword) throw new Error('Заполните все поля');
                if (password !== confirmPassword) throw new Error('Пароли не совпадают');
                await authService.register({ email, password });
                if (onRegister) onRegister();
                else onLogin();
            } else if (mode === 'forgot') {
                if (!email) throw new Error('Введите email');
                await authService.requestPasswordReset(email);
                showAlert('Сброс пароля', 'Если аккаунт существует, мы отправили письмо для сброса пароля.', 'success');
                setMode('login');
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Произошла ошибка. Проверьте соединение.');
            }
        } finally {
            setLoading(false);
            setInternalLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen p-6 justify-center max-w-md mx-auto bg-gray-50 relative">
            <div className="absolute top-6 right-6 z-10">
                <button onClick={onSkip} className="text-gray-400 hover:text-gray-600 font-medium transition-colors">
                    Пропустить
                </button>
            </div>

            <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                    <Droplet size={40} fill="currentColor" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {mode === 'login' ? 'С возвращением' : mode === 'register' ? 'Создать аккаунт' : 'Восстановление'}
                </h1>
                <p className="text-gray-500 text-center">
                    {mode === 'login' ? 'Войдите, чтобы продолжить' : mode === 'register' ? 'Начните вести свой дневник переливаний' : 'Введите email для сброса пароля'}
                </p>
            </div>

            <div className="space-y-2">
                <Input
                    placeholder="Ваш email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {mode !== 'forgot' && (
                    <Input
                        placeholder="Пароль"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                )}
                {mode === 'register' && (
                    <Input
                        placeholder="Повторите пароль"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                )}
            </div>

            {error && (
                <div className="text-red-500 text-sm text-center mt-2">
                    {error}
                </div>
            )}

            {mode === 'login' && (
                <div className="flex justify-end mb-6 mt-2">
                    <button onClick={() => setMode('forgot')} className="text-sm text-gray-500 hover:text-red-500">Забыли пароль?</button>
                </div>
            )}

            <div className="mt-6 space-y-4">
                <Button fullWidth onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Загрузка...' : (mode === 'login' ? 'Войти' : mode === 'register' ? 'Создать аккаунт' : 'Отправить ссылку')}
                </Button>

                <div className="text-center">
                    {mode === 'login' ? (
                        <p className="text-gray-500">Нет аккаунта? <button onClick={() => setMode('register')} className="text-red-500 font-medium">Создать</button></p>
                    ) : (
                        <p className="text-gray-500">Уже есть аккаунт? <button onClick={() => setMode('login')} className="text-red-500 font-medium">Войти</button></p>
                    )}
                </div>
            </div>

            {mode === 'register' && (
                <p className="text-xs text-gray-400 text-center mt-8">
                    Продолжая вы соглашаетесь с{' '}
                    <span
                        onClick={() => onNavigate?.('LEGAL_TERMS')}
                        className="underline cursor-pointer text-red-400 hover:text-red-500"
                    >
                        Условиями сервиса
                    </span>{' '}
                    и{' '}
                    <span
                        onClick={() => onNavigate?.('LEGAL_PRIVACY')}
                        className="underline cursor-pointer text-red-400 hover:text-red-500"
                    >
                        Политикой конфиденциальности
                    </span>.
                </p>
            )}
        </div>
    );
};
