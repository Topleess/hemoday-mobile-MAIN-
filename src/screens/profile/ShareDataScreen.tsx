import React, { useState } from 'react';
import { Share2, CheckCircle2, Copy, Users, UserMinus, LogOut } from 'lucide-react';
import { Header, Card, Button, Input } from '../../components';
import { authService } from '../../services/auth';
import { UserResponse } from '../../types';
import { sync } from '../../database/sync';
import { seedDefaultData } from '../../database/seedDefaultData';
import { useNotification } from '../../context/NotificationContext';

interface ShareDataScreenProps {
    onBack: () => void;
}

export const ShareDataScreen: React.FC<ShareDataScreenProps> = ({ onBack }) => {
    const { showToast, showConfirm, showAlert, setLoading } = useNotification();
    const [inviteCode, setInviteCode] = useState('...');
    const [inputCode, setInputCode] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [loading, setInternalLoading] = useState(false);
    const [familyMembers, setFamilyMembers] = useState<UserResponse[]>([]);
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
    const [familyOwnerId, setFamilyOwnerId] = useState<string | null>(null);

    const loadData = async () => {
        try {
            const me = await authService.getMe();
            setCurrentUser(me);

            const details = await authService.getFamilyDetails();
            setFamilyMembers(details.members || []);
            setFamilyOwnerId(details.owner_id);
            setInviteCode(details.invite_code);
        } catch (error) {
            console.error('Error loading family data:', error);
        }
    };

    const isHost = Boolean(currentUser && familyOwnerId &&
        String(familyOwnerId).toLowerCase() === String(currentUser.id).toLowerCase());
    const hasOtherMembers = familyMembers.length > 1;

    React.useEffect(() => {
        loadData();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteCode);
        setIsCopied(true);
        showToast({ message: 'Код скопирован', type: 'success' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleJoinFamily = async () => {
        if (!inputCode) return;
        setLoading(true);
        setInternalLoading(true);
        try {
            await authService.joinFamilyAfterAuth(inputCode);
            await seedDefaultData();
            await sync();

            showAlert('Семья', 'Вы успешно присоединились к семье!', 'success', () => {
                window.location.reload();
            });
            setInputCode('');
        } catch (error: any) {
            const msg = error.response?.data?.detail || 'Ошибка при входе в семью';
            showAlert('Ошибка', msg, 'error');
        } finally {
            setLoading(false);
            setInternalLoading(false);
        }
    };

    const handleLeaveFamily = async () => {
        const confirmMsg = isHost
            ? 'Вы уверены? Как владелец, вы создадите новую пустую семью. Если в текущей есть участники, сначала удалите их.'
            : 'Вы уверены, что хотите выйти из текущей семьи? Вы больше не будете видеть общие данные.';

        showConfirm('Выход из семьи', confirmMsg, async () => {
            setLoading(true);
            setInternalLoading(true);
            try {
                await authService.leaveFamily();
                await seedDefaultData();
                await sync();

                showAlert('Выполнено', 'Вы вышли из семьи.', 'success', () => {
                    window.location.reload();
                });
            } catch (error: any) {
                const msg = error.response?.data?.detail || 'Ошибка при выходе из семьи';
                showAlert('Ошибка', msg, 'error');
            } finally {
                setLoading(false);
                setInternalLoading(false);
            }
        });
    };

    const handleRemoveMember = async (userId: string, email: string) => {
        showConfirm('Удаление участника', `Вы уверены, что хотите закрыть доступ для ${email}?`, async () => {
            setLoading(true);
            setInternalLoading(true);
            try {
                await authService.removeFamilyMember(userId);
                await sync();
                showAlert('Доступ закрыт', `Участник ${email} удален из семьи.`, 'success', () => {
                    loadData();
                });
            } catch (error) {
                showAlert('Ошибка', 'Ошибка при удалении участника.', 'error');
            } finally {
                setLoading(false);
                setInternalLoading(false);
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto">
            <Header title="Делиться данными" onBack={onBack} />

            <div className="p-4 space-y-6 pb-10">
                {isHost && (
                    <Card className="flex flex-col items-center p-6 text-center shadow-sm border-0">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
                            <Share2 size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Пригласить в семью</h2>
                        <p className="text-gray-500 text-sm mb-6 max-w-xs">
                            Отправьте этот код члену семьи или доктору, чтобы они могли видеть ваши данные.
                        </p>

                        <div className="w-full bg-white rounded-xl p-4 flex items-center justify-between mb-4 border border-gray-100 shadow-inner">
                            <span className="font-mono text-2xl font-bold text-gray-800 tracking-widest">{inviteCode}</span>
                            <button onClick={handleCopy} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                {isCopied ? <CheckCircle2 size={24} className="text-green-500" /> : <Copy size={24} />}
                            </button>
                        </div>
                        <Button variant="outline" className="text-sm border-gray-200" onClick={handleCopy}>
                            {isCopied ? 'Скопировано!' : 'Скопировать код'}
                        </Button>
                    </Card>
                )}

                {!isHost && (
                    <Card className="p-6 bg-indigo-50 border-0 shadow-sm text-center">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-3">
                            <Users size={24} />
                        </div>
                        <h3 className="font-bold text-indigo-900 mb-1">Вы присоединились</h3>
                        <p className="text-sm text-indigo-700">
                            Вы просматриваете данные этой семьи. Ваши данные также доступны остальным участникам.
                        </p>
                    </Card>
                )}

                <Card className="p-6 shadow-sm border-0">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Участники семьи</h3>
                            <p className="text-xs text-gray-400">Кто имеет доступ к данным</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {familyMembers.map((member) => {
                            const isMe = currentUser && String(currentUser.id).toLowerCase() === String(member.id).toLowerCase();
                            const isMemberHost = familyOwnerId && String(familyOwnerId).toLowerCase() === String(member.id).toLowerCase();

                            return (
                                <div key={member.id} className={`flex items-center justify-between p-4 rounded-xl border ${isMe ? 'bg-red-50/30 border-red-100' : 'bg-white border-gray-50 shadow-sm'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isMemberHost ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {member.email[0].toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-800">
                                                {member.email}
                                                {isMe && <span className="text-red-500 ml-1">(Вы)</span>}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                                                {isMemberHost ? 'Владелец' : 'Участник'}
                                            </span>
                                        </div>
                                    </div>

                                    {isHost && !isMe && (
                                        <button
                                            onClick={() => handleRemoveMember(member.id, member.email)}
                                            className="p-2 text-gray-300 hover:text-red-500 transition-colors bg-gray-50 rounded-lg"
                                            title="Закрыть доступ"
                                        >
                                            <UserMinus size={18} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}

                        {!isHost && (
                            <Button
                                variant="outline"
                                fullWidth
                                className="mt-6 border-red-100 text-red-500 hover:bg-red-50 py-3"
                                onClick={handleLeaveFamily}
                                disabled={loading}
                            >
                                <LogOut size={18} className="mr-2" />
                                Покинуть семью
                            </Button>
                        )}

                        {isHost && hasOtherMembers && (
                            <p className="text-[10px] text-center text-gray-400 mt-2">
                                Чтобы выйти, сначала закройте доступ всем участникам
                            </p>
                        )}
                    </div>
                </Card>

                {isHost && !hasOtherMembers && (
                    <Card className="p-6 shadow-sm border-0">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                <Users size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Присоединиться</h3>
                                <p className="text-xs text-gray-400">Введите код приглашения</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Input
                                placeholder="XXXXXX"
                                className="font-mono uppercase text-center text-lg tracking-widest h-14"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                            />
                            <Button fullWidth onClick={handleJoinFamily} disabled={loading || !inputCode} className="h-12 shadow-md">
                                {loading ? 'Отправка...' : 'Присоединиться к семье'}
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};
