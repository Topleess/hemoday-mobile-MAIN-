import React, { useState } from 'react';
import { Share2, CheckCircle2, Copy, Users } from 'lucide-react';
import { Header, Card, Button, Input } from '../../components';

interface ShareDataScreenProps {
    onBack: () => void;
}

export const ShareDataScreen: React.FC<ShareDataScreenProps> = ({ onBack }) => {
    const [inviteCode] = useState('HEMO-8392-XM');
    const [inputCode, setInputCode] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto">
            <Header title="Делиться данными" onBack={onBack} />

            <div className="p-4 space-y-6">
                <Card className="flex flex-col items-center p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                        <Share2 size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Пригласить в семью</h2>
                    <p className="text-gray-500 text-sm mb-6 max-w-xs">
                        Отправьте этот код члену семьи или доктору, чтобы они могли видеть ваши данные.
                    </p>

                    <div className="w-full bg-gray-100 rounded-xl p-4 flex items-center justify-between mb-4 border border-gray-200">
                        <span className="font-mono text-lg font-bold text-gray-800 tracking-wider">{inviteCode}</span>
                        <button onClick={handleCopy} className="text-gray-500 hover:text-red-500 transition-colors">
                            {isCopied ? <CheckCircle2 size={24} className="text-green-500" /> : <Copy size={24} />}
                        </button>
                    </div>
                    <Button variant="outline" className="text-sm" onClick={handleCopy}>
                        {isCopied ? 'Скопировано!' : 'Скопировать код'}
                    </Button>
                </Card>

                <div className="flex items-center gap-4 py-2">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-gray-400 text-sm font-medium">ИЛИ</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Присоединиться</h3>
                            <p className="text-xs text-gray-500">Введите код приглашения</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Input
                            placeholder="XXXX-XXXX-XX"
                            className="font-mono uppercase"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                        />
                        <Button fullWidth onClick={() => alert('Запрос отправлен!')}>
                            Отправить запрос
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
