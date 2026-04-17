import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Droplet, Bell, FlaskConical, Plus, X } from 'lucide-react';
import { Card, Header } from '../../components';
import { ScreenName } from '../../types';
import withObservables from '@nozbe/with-observables';
import { database } from '../../database';
import Transfusion from '../../database/models/Transfusion';
import Reminder from '../../database/models/Reminder';

interface CalendarScreenProps {
    transfusions: Transfusion[];
    reminders: Reminder[];
    onNavigate: (s: ScreenName, options?: { date?: string }) => void;
    onEdit: (type: 'transfusion' | 'analysis' | 'reminder', item: any, date?: string) => void;
}

// Generate recurring reminder dates for a given month
const getRecurringDatesForMonth = (reminder: Reminder, year: number, month: number): string[] => {
    const repeat = reminder.repeat;
    if (!repeat || repeat === 'Никогда') return [];

    const originDate = new Date(reminder.date);
    const originYear = originDate.getFullYear();
    const originMonth = originDate.getMonth();
    const originDay = originDate.getDate();
    const endDate = reminder.repeatEndDate ? new Date(reminder.repeatEndDate) : null;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates: string[] = [];

    if (repeat === 'Ежедневно') {
        for (let d = 1; d <= daysInMonth; d++) {
            const current = new Date(year, month, d);
            if (current >= originDate) {
                if (endDate && current > endDate) continue;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                if (dateStr !== reminder.date) {
                    dates.push(dateStr);
                }
            }
        }
    } else if (repeat === 'Еженедельно') {
        const originDayOfWeek = originDate.getDay();
        for (let d = 1; d <= daysInMonth; d++) {
            const current = new Date(year, month, d);
            if (current > originDate && current.getDay() === originDayOfWeek) {
                if (endDate && current > endDate) continue;
                dates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
            }
        }
    } else if (repeat === 'Ежемесячно') {
        if (year > originYear || (year === originYear && month > originMonth)) {
            const dayToUse = Math.min(originDay, daysInMonth);
            const current = new Date(year, month, dayToUse);
            if (!endDate || current <= endDate) {
                dates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(dayToUse).padStart(2, '0')}`);
            }
        }
    }

    return dates;
};

// Check if a recurring reminder should fire on a specific date
const isReminderActiveOnDate = (reminder: Reminder, dateStr: string): boolean => {
    // Check cancelled dates
    if (reminder.cancelledDates) {
        const cancelled = reminder.cancelledDates.split(',');
        if (cancelled.includes(dateStr)) return false;
    }

    // Exact match - always show
    if (reminder.date === dateStr) return true;

    const repeat = reminder.repeat;
    if (!repeat || repeat === 'Никогда') return false;

    const targetDate = new Date(dateStr);
    const originDate = new Date(reminder.date);

    // Don't show before the original date
    if (targetDate <= originDate) return false;

    // Don't show after end date
    if (reminder.repeatEndDate) {
        const endDate = new Date(reminder.repeatEndDate);
        if (targetDate > endDate) return false;
    }

    if (repeat === 'Ежедневно') return true;

    if (repeat === 'Еженедельно') {
        return targetDate.getDay() === originDate.getDay();
    }

    if (repeat === 'Ежемесячно') {
        return targetDate.getDate() === originDate.getDate();
    }

    return false;
};

const CalendarScreenComponent: React.FC<CalendarScreenProps> = ({ transfusions, reminders, onNavigate, onEdit }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [hideReminders, setHideReminders] = useState(false);
    const [dayMenuDate, setDayMenuDate] = useState<string | null>(null);
    const dayMenuRef = useRef<HTMLDivElement>(null);

    // Close day menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dayMenuRef.current && !dayMenuRef.current.contains(event.target as Node)) {
                setDayMenuDate(null);
            }
        };
        if (dayMenuDate) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [dayMenuDate]);

    const daysSince = useMemo(() => {
        if (transfusions.length === 0) return 0;
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

    // Build a set of all dates that have recurring reminders for the current month
    const recurringReminderDates = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const dateSet = new Set<string>();

        reminders.forEach(r => {
            if (r.repeat && r.repeat !== 'Никогда') {
                const dates = getRecurringDatesForMonth(r, year, month);
                dates.forEach(d => dateSet.add(d));
            }
            // Also add the original date
            dateSet.add(r.date);
        });

        return dateSet;
    }, [reminders, currentDate]);

    const handleDateClick = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        setDayMenuDate(dateStr);
    };

    // Get events for a given date string
    const getEventsForDate = (dateStr: string) => {
        const transfusionsOnDate = transfusions
            .filter(t => t.date === dateStr)
            .sort((a, b) => b.createdAt - a.createdAt);

        const remindersOnDate = reminders.filter(r => isReminderActiveOnDate(r, dateStr));

        return { transfusionsOnDate, remindersOnDate };
    };

    const formatDateRu = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    // Recent transfusions - keep full objects for click handling
    const recentTransfusions = useMemo(() => {
        if (transfusions.length === 0) return [];
        const sorted = [...transfusions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return sorted.slice(0, 5);
    }, [transfusions]);

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Today's reminders including recurring
    const todayReminders = useMemo(() => {
        return reminders.filter(r => isReminderActiveOnDate(r, todayStr));
    }, [reminders, todayStr]);

    return (
        <div className="pb-24 md:pb-8">
            <Header title="Календарь" />

            <div className="px-4 mb-6 mt-2">
                <Card className="flex flex-col items-start py-6 px-5 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Дней с последнего переливания</h3>
                        <p className="text-sm text-gray-500 mb-4">Последнее: {recentTransfusions.length > 0
                            ? new Date(recentTransfusions[0].date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
                            : 'Нет данных'}</p>
                        <div className="text-6xl font-bold text-red-500">{daysSince}</div>
                    </div>
                    <Droplet className="absolute -right-6 -bottom-6 text-red-50 opacity-50 w-48 h-48 rotate-12 pointer-events-none" fill="currentColor" />
                </Card>
            </div>

            {/* Today's Reminders Widget */}
            {!hideReminders && todayReminders.length > 0 && (
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
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-sm text-gray-500">{reminder.time}</p>
                                                {reminder.repeat && reminder.repeat !== 'Никогда' && (
                                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">{reminder.repeat}</span>
                                                )}
                                            </div>
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
            )}

            {/* Show reminders button when hidden */}
            {hideReminders && todayReminders.length > 0 && (
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
                            const hasReminder = recurringReminderDates.has(dateStr);
                            const isToday = todayStr === dateStr;

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

            {/* Day Action Menu (popup) */}
            {dayMenuDate && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center animate-in fade-in duration-200" onClick={() => setDayMenuDate(null)}>
                    <div
                        ref={dayMenuRef}
                        className="bg-white rounded-t-3xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900">{formatDateRu(dayMenuDate)}</h3>
                            <button onClick={() => setDayMenuDate(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Existing events on this date */}
                        {(() => {
                            const { transfusionsOnDate, remindersOnDate } = getEventsForDate(dayMenuDate);
                            const hasEvents = transfusionsOnDate.length > 0 || remindersOnDate.length > 0;

                            return hasEvents ? (
                                <div className="p-4 space-y-2 border-b border-gray-100">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">События</p>
                                    {transfusionsOnDate.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => { setDayMenuDate(null); onEdit('transfusion', t); }}
                                            className="w-full flex items-center gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors text-left"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0">
                                                <Droplet size={18} fill="currentColor" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 text-sm">{t.component || 'Переливание'}</p>
                                                <p className="text-xs text-gray-500">V: {t.volume} мл · Hb: {t.hbBefore}→{t.hbAfter}</p>
                                            </div>
                                        </button>
                                    ))}
                                    {remindersOnDate.map(r => (
                                        <button
                                            key={r.id}
                                            onClick={() => { const d = dayMenuDate; setDayMenuDate(null); onEdit('reminder', r, d!); }}
                                            className="w-full flex items-center gap-3 p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors text-left"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
                                                <Bell size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 text-sm">{r.title}</p>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-xs text-gray-500">{r.time}</p>
                                                    {r.repeat && r.repeat !== 'Никогда' && (
                                                        <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">{r.repeat}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : null;
                        })()}

                        {/* Add actions */}
                        <div className="p-4 space-y-2">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Добавить</p>
                            <button
                                onClick={() => { const d = dayMenuDate; setDayMenuDate(null); onNavigate('ADD_TRANSFUSION', { date: d! }); }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-500 group-hover:bg-red-200 transition-colors">
                                    <Droplet size={18} />
                                </div>
                                <span className="font-medium text-gray-900 text-sm">Переливание</span>
                                <Plus size={16} className="ml-auto text-gray-300" />
                            </button>
                            <button
                                onClick={() => { const d = dayMenuDate; setDayMenuDate(null); onNavigate('ADD_ANALYSIS', { date: d! }); }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 group-hover:bg-blue-200 transition-colors">
                                    <FlaskConical size={18} />
                                </div>
                                <span className="font-medium text-gray-900 text-sm">Анализы</span>
                                <Plus size={16} className="ml-auto text-gray-300" />
                            </button>
                            <button
                                onClick={() => { const d = dayMenuDate; setDayMenuDate(null); onNavigate('ADD_REMINDER', { date: d! }); }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-200 transition-colors">
                                    <Bell size={18} />
                                </div>
                                <span className="font-medium text-gray-900 text-sm">Напоминание</span>
                                <Plus size={16} className="ml-auto text-gray-300" />
                            </button>
                        </div>

                        {/* Bottom safe area */}
                        <div className="h-4" />
                    </div>
                </div>
            )}

            {/* Quick add buttons */}
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

            {/* Recent transfusions - clickable */}
            <div className="px-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-900">История переливаний</h2>
                    <button onClick={() => onNavigate('DATA')} className="text-blue-500 text-sm font-medium">Показать все</button>
                </div>
                {recentTransfusions.length > 0 ? (
                    <div className="space-y-2">
                        {recentTransfusions.map((t) => (
                            <Card
                                key={t.id}
                                onClick={() => onEdit('transfusion', t)}
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                        <Droplet size={20} fill="currentColor" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 capitalize">
                                            {new Date(t.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                        <div className="flex gap-2 text-sm text-gray-500">
                                            <span>{t.component || 'Гемоглобин'}</span>
                                            <span>·</span>
                                            <span>Hb: {t.hbAfter} г/л</span>
                                            {t.chelatorDosage && (
                                                <>
                                                    <span>·</span>
                                                    <span>{t.chelator} {t.chelatorDosage}мг</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-gray-300" />
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
    transfusions: database.get<Transfusion>('transfusions').query().observe(),
    reminders: database.get<Reminder>('reminders').query().observe(),
}));

export default enhance(CalendarScreenComponent);
