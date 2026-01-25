import React, { useState } from 'react';
import { Lock, Mail, CheckCircle2 } from 'lucide-react';
import { Header, Button, Input } from '../../components';
import { authService } from '../../services/auth';

interface ChangePasswordScreenProps {
    onBack: () => void;
    initialEmail?: string;
}

export const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ onBack, initialEmail = '' }) => {
    const [email, setEmail] = useState(initialEmail);
    const [sent, setSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        const loadUserEmail = async () => {
            if (authService.isAuthenticated() && !initialEmail) {
                try {
                    const user = await authService.getMe();
                    if (user?.email) {
                        setEmail(user.email);
                    }
                } catch (e) {
                    console.error('Failed to load user email', e);
                }
            }
        };
        loadUserEmail();
    }, [initialEmail]);

    const handleSubmit = async () => {
        if (!email) {
            setError('Введите email');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            await authService.requestPasswordReset(email);
            setSent(true);
            setTimeout(() => {
                onBack();
            }, 3000);
        } catch (err: any) {
            console.error('Password reset error:', err);
            setError('Не удалось отправить запрос. Попробуйте позже.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <Header title="Смена пароля" onBack={onBack} />

            <div className="p-6 flex flex-col items-center pt-20">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6">
                    <Lock size={32} />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Сброс пароля</h2>
                <p className="text-gray-500 text-center mb-8 max-w-xs">
                    Введите ваш email, и мы отправим вам ссылку для создания нового пароля.
                </p>

                {!sent ? (
                    <div className="w-full space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}
                        <Input
                            placeholder="user@example.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            rightIcon={<Mail size={20} />}
                        />
                        <Button fullWidth onClick={handleSubmit} isLoading={isLoading}>
                            Отправить ссылку
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <div className="text-green-500 mb-2">
                            <CheckCircle2 size={48} />
                        </div>
                        <p className="text-lg font-medium text-gray-900">Письмо отправлено!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
