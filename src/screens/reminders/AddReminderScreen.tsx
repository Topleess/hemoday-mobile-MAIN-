import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, Button, Header, Input, DatePicker, DropdownSelect, TimePicker } from '../../components';
import { database } from '../../database';
import Reminder from '../../database/models/Reminder';
import { sync } from '../../database/sync';
import { useNotification } from '../../context/NotificationContext';

interface AddReminderScreenProps {
    onClose: () => void;
    initialData?: Reminder;
    preselectedDate?: string | null;
    viewingDate?: string | null;
}

const AddReminderScreen: React.FC<AddReminderScreenProps> = ({ onClose, initialData, preselectedDate, viewingDate }) => {
    const { showConfirm, showAlert } = useNotification();
    const isEdit = !!initialData;
    const [title, setTitle] = useState(initialData?.title || '');
    const [date, setDate] = useState(initialData?.date || preselectedDate || (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })());
    const [time, setTime] = useState(initialData?.time || '09:00');
    const [repeat, setRepeat] = useState(initialData?.repeat || 'Никогда');
    const [note, setNote] = useState(initialData?.note || '');
    const [showDeleteMenu, setShowDeleteMenu] = useState(false);

    const isRecurring = initialData?.repeat && initialData.repeat !== 'Никогда';

    // The date the user was viewing when they clicked on this reminder
    // Priority: explicitly passed viewingDate > current date field value > original date > today
    const contextDate = viewingDate || date || initialData?.date || (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

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
            showAlert('Ошибка', 'Не удалось сохранить напоминание.', 'error');
        }
    };

    // Delete only this specific occurrence (add to cancelled_dates)
    const handleDeleteThisOne = async () => {
        if (!isEdit || !initialData) return;

        try {
            await database.write(async () => {
                const existing = initialData.cancelledDates || '';
                const cancelledList = existing ? existing.split(',') : [];
                if (!cancelledList.includes(contextDate)) {
                    cancelledList.push(contextDate);
                }
                await initialData.update(r => {
                    r.cancelledDates = cancelledList.join(',');
                });
            });
            sync().catch(e => console.error('Reminder update sync failed', e));
            onClose();
        } catch (error) {
            console.error("Error cancelling occurrence", error);
            showAlert('Ошибка', 'Не удалось обновить напоминание.', 'error');
        }
    };

    // Delete this and all future occurrences (set repeat_end_date)
    const handleDeleteThisAndFuture = async () => {
        if (!isEdit || !initialData) return;

        // If the context date is the original date, delete completely
        if (contextDate <= initialData.date) {
            handleDeleteCompletely();
            return;
        }

        try {
            // Set end date to the day before the viewing date
            const viewDate = new Date(contextDate);
            viewDate.setDate(viewDate.getDate() - 1);
            const endDateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(viewDate.getDate()).padStart(2, '0')}`;

            await database.write(async () => {
                await initialData.update(r => {
                    r.repeatEndDate = endDateStr;
                });
            });
            sync().catch(e => console.error('Reminder update sync failed', e));
            onClose();
        } catch (error) {
            console.error("Error stopping future repetitions", error);
            showAlert('Ошибка', 'Не удалось обновить напоминание.', 'error');
        }
    };

    // Delete completely (for non-recurring or full deletion)
    const handleDeleteCompletely = async () => {
        if (!isEdit || !initialData) return;

        showConfirm('Удаление', 'Удалить напоминание полностью?', async () => {
            try {
                await database.write(async () => {
                    await initialData.markAsDeleted();
                });
                sync().catch(e => console.error('Reminder delete sync failed', e));
                onClose();
            } catch (error) {
                console.error("Error deleting", error);
                showAlert('Ошибка', 'Не удалось удалить напоминание.', 'error');
            }
        });
    };

    const formatDateShort = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom duration-300 overflow-y-auto">
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
                        className="w-full bg-white rounded-xl p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-red-200 border border-gray-200"
                        placeholder="Добавьте какую-нибудь информацию"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    ></textarea>
                </Card>

                {isEdit && !isRecurring && (
                    <Button variant="danger" fullWidth onClick={handleDeleteCompletely} className="mt-4">
                        <Trash2 size={20} />
                        Удалить напоминание
                    </Button>
                )}

                {isEdit && isRecurring && (
                    <div className="space-y-2 mt-4">
                        <Button variant="danger" fullWidth onClick={() => setShowDeleteMenu(true)}>
                            <Trash2 size={20} />
                            Удалить напоминание
                        </Button>
                    </div>
                )}

                <div className="h-6" />
            </div>

            {/* Delete options for recurring reminders */}
            {showDeleteMenu && (
                <div className="fixed inset-0 bg-black/40 z-[60] flex items-end justify-center animate-in fade-in duration-200" onClick={() => setShowDeleteMenu(false)}>
                    <div
                        className="bg-white rounded-t-3xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900 text-center">Удаление напоминания</h3>
                            <p className="text-sm text-gray-500 text-center mt-1">
                                {formatDateShort(contextDate)}
                            </p>
                        </div>

                        <div className="p-4 space-y-2">
                            <button
                                onClick={() => { setShowDeleteMenu(false); handleDeleteThisOne(); }}
                                className="w-full p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                            >
                                <p className="font-medium text-gray-900">Удалить только это</p>
                                <p className="text-sm text-gray-500 mt-0.5">Предыдущие и последующие напоминания сохранятся</p>
                            </button>

                            <button
                                onClick={() => { setShowDeleteMenu(false); handleDeleteThisAndFuture(); }}
                                className="w-full p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-left"
                            >
                                <p className="font-medium text-red-600">Удалить это и следующие</p>
                                <p className="text-sm text-gray-500 mt-0.5">Выбранное и все последующие будут удалены</p>
                            </button>

                            <button
                                onClick={() => setShowDeleteMenu(false)}
                                className="w-full p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-center"
                            >
                                <p className="font-medium text-gray-700">Отмена</p>
                            </button>
                        </div>

                        <div className="h-4" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddReminderScreen;
