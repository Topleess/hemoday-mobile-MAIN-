import React from 'react';
import { X, ChevronRight, Calendar as CalendarIcon, History, Trash2 } from 'lucide-react';
import { Card, Button } from '../../components';
import { Reminder } from '../../types';
import { Input } from '../../components';

interface AddReminderScreenProps {
    onClose: () => void;
    initialData?: Reminder;
}

const AddReminderScreen: React.FC<AddReminderScreenProps> = ({ onClose, initialData }) => {
    const isEdit = !!initialData;

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-bottom duration-300 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 bg-white shadow-sm sticky top-0 z-10">
                <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <X size={20} className="text-gray-600" />
                </button>
                <h2 className="text-lg font-bold">{isEdit ? "Редактирование" : "Новое напоминание"}</h2>
                <button onClick={onClose} className="text-red-500 font-medium hover:text-red-600">Сохранить</button>
            </div>

            <div className="p-4 space-y-4">
                <Card>
                    <Input label="Название напоминания" placeholder="Пример: принять лекарство" value={initialData?.title} />
                </Card>

                <Card className="space-y-0 divide-y divide-gray-100">
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <CalendarIcon size={20} className="text-gray-500" />
                            <span className="font-medium">Дата</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <span>{initialData?.date || "Сегодня"}</span>
                            <ChevronRight size={18} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <History size={20} className="text-gray-500" />
                            <span className="font-medium">Время</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <span>{initialData?.time || "9:00"}</span>
                            <ChevronRight size={18} />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-3">
                            <History size={20} className="text-gray-500" />
                            <span className="font-medium">Повторения</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <span>{initialData?.repeat || "Ежедневно"}</span>
                            <ChevronRight size={18} />
                        </div>
                    </div>
                </Card>

                <Card>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Напоминание</label>
                    <textarea
                        className="w-full bg-gray-100 rounded-xl p-3 h-32 resize-none focus:outline-none"
                        placeholder="Добавьте какую-нибудь информацию"
                        defaultValue={initialData?.note}
                    ></textarea>
                </Card>

                {isEdit && (
                    <Button variant="danger" fullWidth onClick={onClose} className="mt-4">
                        <Trash2 size={20} />
                        Удалить напоминание
                    </Button>
                )}
            </div>
        </div>
    );
}

export default AddReminderScreen;
