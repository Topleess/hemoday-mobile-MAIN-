import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Droplet, Bell, FlaskConical } from 'lucide-react';
import { Card, Header } from '../../components';
import { Transfusion, Reminder, ScreenName } from '../../types';

interface CalendarScreenProps {
    transfusions: Transfusion[];
    reminders: Reminder[];
    onNavigate: (s: ScreenName) => void;
    onEdit: (type: 'transfusion' | 'analysis' | 'reminder', item: any) => void;
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ transfusions, reminders, onNavigate, onEdit }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysSince = useMemo(() => {
        if (transfusions.length === 0) return 0;
        const lastTransfusion = new Date(transfusions[0].date); // Assuming sorted
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
        const dateStr = date.toISOString().split('T')[0]; <br />
        const transfusion = transfusions.find(t => t.date === dateStr);
        if (transfusion) {
            onEdit('transfusion', transfusion);
            return;
        }

        const reminder = reminders.find(r => r.date === dateStr);
        if (reminder) {
            onEdit('reminder', reminder);
            return;
        }
    };

    return (
        <div className="pb-24">
            <Header title="Календарь" />

            <div className="px-4 mb-6 mt-2">
                <Card className="flex flex-col items-start py-6 px-5 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Дней с последнего переливания</h3>
                        <p className="text-sm text-gray-500 mb-4">Последнее: 11 сентября 2025</p>
                        <div className="text-6xl font-bold text-red-500">{daysSince}</div>
                    </div>
                    <Droplet className="absolute -right-6 -bottom-6 text-red-50 opacity-50 w-48 h-48 rotate-12 pointer-events-none" fill="currentColor" />
                </Card>
            </div>

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

                            const dateStr = date.toISOString().split('T')[0];
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
                <Card className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                            <Droplet size={20} fill="currentColor" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">11 сентября 2025</p>
                            <p className="text-sm text-gray-500">Hb: 100 г/л</p>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-300" />
                </Card>
            </div>
        </div>
    );
};

export default CalendarScreen;
