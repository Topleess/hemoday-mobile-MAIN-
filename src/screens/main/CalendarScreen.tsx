import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Droplet, Bell, FlaskConical } from 'lucide-react';
import { Card, Header } from '../../components';
import { ScreenName } from '../../types';
import withObservables from '@nozbe/with-observables';
import { database } from '../../database';
import Transfusion from '../../database/models/Transfusion';
import Reminder from '../../database/models/Reminder';

interface CalendarScreenProps {
    transfusions: Transfusion[];
    reminders: Reminder[];
    onNavigate: (s: ScreenName) => void;
    onEdit: (type: 'transfusion' | 'analysis' | 'reminder', item: any) => void;
}

const CalendarScreenComponent: React.FC<CalendarScreenProps> = ({ transfusions, reminders, onNavigate, onEdit }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [hideReminders, setHideReminders] = useState(false);

    const daysSince = useMemo(() => {
        if (transfusions.length === 0) return 0;
        // Ascending or Descending? Query default sort or sort here. 
        // Assuming we want the LATEST transfusion. 
        // We should probably sort transfusions by date descending to get the last one easily.
        // Or if the query is sorted. WatermelonDB queries are not sorted by default unless requested.
        // Let's sort in JS for now or assume query does it? 
        // JS sort:
        const sorted = [...transfusions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastTransfusion = new Date(sorted[0].date);
        const diffTime = Math.abs(new Date().getTime() - lastTransfusion.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }, [transfusions]);

    const monthNames = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const days = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const numDays = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const padding = firstDay;

        const daysArray = [];
        for (let i = 0; i < padding; i++) {
            daysArray.push(null);
        }
        for (let i = 1; i <= numDays; i++) {
            daysArray.push(new Date(year, month, i));
        }
        return daysArray;
    }, [currentDate]);

    const handleDateClick = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Get all transfusions for this date, sorted by creation time (newest first)
        const transfusionsOnDate = transfusions
            .filter(t => t.date === dateStr)
            .sort((a, b) => b.createdAt - a.createdAt);

        if (transfusionsOnDate.length > 0) {
            // If there are transfusions, edit the most recent one
            onEdit('transfusion', transfusionsOnDate[0]);
            return;
        }

        // Check for reminders on this date
        const reminder = reminders.find(r => r.date === dateStr);
        if (reminder) {
            onEdit('reminder', reminder);
            return;
        }

        // If no transfusions or reminders, open add transfusion screen
        // TODO: We need a way to pass the selected date to the add screen
        // For now, just navigate to add transfusion 
        onNavigate('ADD_TRANSFUSION');
    };

    const recentTransfusions = useMemo(() => {
        if (transfusions.length === 0) return [];
        const sorted = [...transfusions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return sorted.slice(0, 5).map(t => ({
            id: t.id,
            date: new Date(t.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
            hb: t.hbAfter,
            type: t.component || 'Гемоглобин' // Fallback
        }));
    }, [transfusions]);


    return (
        <div className="pb-24">
            <Header title="Календарь" />

            <div className="px-4 mb-6 mt-2">
                <Card className="flex flex-col items-start py-6 px-5 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Дней с последнего переливания</h3>
                        <p className="text-sm text-gray-500 mb-4">Последнее: {recentTransfusions.length > 0 ? recentTransfusions[0].date : 'Нет данных'}</p>
                        <div className="text-6xl font-bold text-red-500">{daysSince}</div>
                    </div>
                    <Droplet className="absolute -right-6 -bottom-6 text-red-50 opacity-50 w-48 h-48 rotate-12 pointer-events-none" fill="currentColor" />
                </Card>
            </div>

            {/* Today's Reminders Widget */}
            {!hideReminders && (() => {
                // Get today's date in YYYY-MM-DD format
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                // Filter reminders for today
                const todayReminders = reminders.filter(r => r.date === todayStr);

                if (todayReminders.length === 0) return null;

                return (
                    <div className="px-4 mb-6">
                        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Bell size={20} className="text-yellow-600" />
                                    <h3 className="font-bold text-gray-900">Напоминания на сегодня</h3>
                                </div>
                                <button
                                    onClick={() => setHideReminders(true)}
                                    className="text-gray-400 hover:text-gray-600 text-sm"
                                >
                                    Скрыть
                                </button>
                            </div>
                            <div className="space-y-2">
                                {todayReminders.map(reminder => (
                                    <button
                                        key={reminder.id}
                                        onClick={() => onEdit('reminder', reminder)}
                                        className="w-full text-left bg-white rounded-lg p-3 hover:bg-yellow-50 transition-colors border border-yellow-100"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{reminder.title}</p>
                                                <p className="text-sm text-gray-500 mt-1">{reminder.time}</p>
                                            </div>
                                            {reminder.note && (
                                                <p className="text-xs text-gray-400 ml-2 max-w-[150px] truncate">{reminder.note}</p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </div>
                );
            })()}

            {/* Show reminders button when hidden */}
            {hideReminders && reminders.some(r => {
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                return r.date === todayStr;
            }) && (
                    <div className="px-4 mb-6">
                        <button
                            onClick={() => setHideReminders(false)}
                            className="w-full py-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center justify-center gap-2"
                        >
                            <Bell size={16} />
                            Показать напоминания
                        </button>
                    </div>
                )}

            <div className="px-4 mb-6">
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="font-bold text-lg capitalize">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 text-gray-400 font-medium">
                        <div>ВС</div><div>ПН</div><div>ВТ</div><div>СР</div><div>ЧТ</div><div>ПТ</div><div>СБ</div>
                    </div>
                    <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-sm font-medium text-gray-700">
                        {days.map((date, index) => {
                            if (!date) return <div key={`empty-${index}`} />;

                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const dateStr = `${year}-${month}-${day}`;
                            const hasTransfusion = transfusions.some(t => t.date === dateStr);
                            const hasReminder = reminders.some(r => r.date === dateStr);
                            const isToday = new Date().toDateString() === date.toDateString();

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleDateClick(date)}
                                    className={`relative h-10 w-full flex items-center justify-center rounded-lg transition-colors
                    ${isToday ? 'bg-red-500 text-white font-bold' : 'hover:bg-gray-50'}
                    ${(hasTransfusion || hasReminder) ? 'font-bold' : ''}
                  `}
                                >
                                    {date.getDate()}
                                    <div className="absolute bottom-1 flex gap-0.5 justify-center w-full">
                                        {hasTransfusion && (
                                            <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-red-500'}`} />
                                        )}
                                        {hasReminder && (
                                            <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-indigo-500'}`} />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </Card>
            </div>

            <div className="px-4 space-y-3 mb-6">
                <Card onClick={() => onNavigate('ADD_TRANSFUSION')} className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 group-hover:bg-red-200 transition-colors">
                        <Droplet size={20} />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-red-500 transition-colors">Добавить переливание</span>
                </Card>
                <Card onClick={() => onNavigate('ADD_ANALYSIS')} className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 group-hover:bg-blue-200 transition-colors">
                        <FlaskConical size={20} />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-blue-500 transition-colors">Добавить анализы</span>
                </Card>
                <Card onClick={() => onNavigate('ADD_REMINDER')} className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-200 transition-colors">
                        <Bell size={20} />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-indigo-500 transition-colors">Добавить напоминание</span>
                </Card>
            </div>

            <div className="px-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-900">История переливаний</h2>
                    <button onClick={() => onNavigate('DATA')} className="text-blue-500 text-sm font-medium">Показать все</button>
                </div>
                {recentTransfusions.length > 0 ? (
                    <div className="space-y-2">
                        {recentTransfusions.map((item) => (
                            <Card key={item.id} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                        <Droplet size={20} fill="currentColor" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 capitalize">{item.date}</p>
                                        <div className="flex gap-2 text-sm text-gray-500">
                                            <span>{item.type}</span>
                                            <span>•</span>
                                            <span>Hb: {item.hb} г/л</span>
                                        </div>
                                    </div>
                                </div>
                                {/* We can't easily edit from here without loading the full object or passing ID to edit. 
                                    The original code just showed info. Let's keep it read-only or just info for now 
                                    since the user just asked to "display" them. 
                                    However, the original code had a ChevronRight, implying navigation.
                                    The handleDateClick handles editing. Let's redirect to data screen or edit?
                                    The onEdit prop requires the item object. 
                                    We only mapped a subset. 
                                    Let's just show the list for now as requested.
                                */}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">Нет данных</p>
                )}
            </div>
        </div>
    );
};

const enhance = withObservables([], () => ({
    transfusions: database.get<Transfusion>('transfusions').query().observe(), // observe all transfusions
    reminders: database.get<Reminder>('reminders').query().observe(),
}));

export default enhance(CalendarScreenComponent);
