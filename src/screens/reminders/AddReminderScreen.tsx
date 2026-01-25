import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, Button, Header, Input, DatePicker, DropdownSelect, TimePicker } from '../../components';
import { database } from '../../database';
import Reminder from '../../database/models/Reminder';
import { sync } from '../../database/sync';

interface AddReminderScreenProps {
    onClose: () => void;
    initialData?: Reminder;
}

const AddReminderScreen: React.FC<AddReminderScreenProps> = ({ onClose, initialData }) => {
    const isEdit = !!initialData;
    const [title, setTitle] = useState(initialData?.title || '');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(initialData?.time || '09:00');
    const [repeat, setRepeat] = useState(initialData?.repeat || 'Ежедневно');
    const [note, setNote] = useState(initialData?.note || '');

    const handleSave = async () => {
        try {
            await database.write(async () => {
                if (isEdit && initialData) {
                    await initialData.update(r => {
                        r.title = title;
                        r.date = date;
                        r.time = time;
                        r.repeat = repeat;
                        r.note = note;
                    });
                } else {
                    await database.get<Reminder>('reminders').create(r => {
                        r.title = title;
                        r.date = date;
                        r.time = time;
                        r.repeat = repeat;
                        r.note = note;
                    });
                }
            });
            sync().catch(e => console.error('Reminder sync failed', e));
            onClose();
        } catch (error) {
            console.error("Error saving reminder", error);
            alert("Ошибка сохранения");
        }
    };

    const handleDelete = async () => {
        if (isEdit && initialData) {
            try {
                await database.write(async () => {
                    await initialData.markAsDeleted();
                    await initialData.destroyPermanently();
                });
                sync().catch(e => console.error('Reminder delete sync failed', e));
                onClose();
            } catch (error) {
                console.error("Error deleting", error);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-bottom duration-300 overflow-y-auto">
            <Header
                title={isEdit ? "Редактирование напоминания" : "Добавление напоминания"}
                onBack={onClose}
                rightAction={
                    <button onClick={handleSave} className="text-red-500 font-medium hover:text-red-600">Сохранить</button>
                }
            />

            <div className="p-4 space-y-4">
                <Card>
                    <Input
                        label="Название напоминания"
                        placeholder="Пример: принять лекарство"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </Card>

                <Card className="space-y-4">
                    <DatePicker
                        label="Дата"
                        value={date}
                        onChange={setDate}
                        allowFuture={true}
                    />
                    <TimePicker
                        label="Время"
                        value={time}
                        onChange={setTime}
                    />
                </Card>

                <Card>
                    <DropdownSelect
                        label="Повторения"
                        value={repeat}
                        onChange={setRepeat}
                        options={[
                            { value: 'Ежедневно', label: 'Ежедневно' },
                            { value: 'Еженедельно', label: 'Еженедельно' },
                            { value: 'Ежемесячно', label: 'Ежемесячно' },
                            { value: 'Никогда', label: 'Никогда' }
                        ]}
                    />
                </Card>

                <Card>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Напоминание</label>
                    <textarea
                        className="w-full bg-gray-100 rounded-xl p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-red-200"
                        placeholder="Добавьте какую-нибудь информацию"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    ></textarea>
                </Card>

                {isEdit && (
                    <Button variant="danger" fullWidth onClick={handleDelete} className="mt-4">
                        <Trash2 size={20} />
                        Удалить напоминание
                    </Button>
                )}
                <div className="h-6" />
            </div>
        </div>
    );
}

export default AddReminderScreen;
