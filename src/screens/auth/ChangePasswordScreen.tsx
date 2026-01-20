import React, { useState } from 'react';
import { Lock, Mail, CheckCircle2 } from 'lucide-react';
import { Header, Button, Input } from '../../components';

interface ChangePasswordScreenProps {
    onBack: () => void;
    initialEmail?: string;
}

export const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ onBack, initialEmail = '' }) => {
    const [email, setEmail] = useState(initialEmail);
    const [sent, setSent] = useState(false);

    const handleSubmit = () => {
        // Mock API call
        setSent(true);
        setTimeout(() => {
            onBack();
        }, 2000);
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
                        <Input
                            placeholder="user@example.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            rightIcon={<Mail size={20} />}
                        />
                        <Button fullWidth onClick={handleSubmit}>
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
