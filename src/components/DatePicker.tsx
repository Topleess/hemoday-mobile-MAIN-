import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
    label?: string;
    value: string;
    onChange: (date: string) => void;
    className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(() => {
        const dateValue = value || new Date().toISOString().split('T')[0];
        return new Date(dateValue);
    });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Сегодня';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const handleDateSelect = (date: Date) => {
        onChange(date.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const today = new Date().toISOString().split('T')[0];
    const selectedDate = value || today;

    const monthNames = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const days = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
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
    }, [currentMonth]);

    return (
        <div className={`relative w-full ${className}`} ref={containerRef}>
            {label && <label className="block text-sm font-medium text-gray-500 mb-1.5 ml-1">{label}</label>}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-gray-100 text-gray-900 rounded-xl px-4 py-3.5 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-red-200 transition-all hover:bg-gray-200"
            >
                <span className="font-medium">{formatDate(selectedDate)}</span>
                <CalendarIcon size={20} className="text-red-500" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="font-bold text-lg capitalize">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </span>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-xs mb-2 text-gray-400 font-medium">
                        <div>ВС</div>
                        <div>ПН</div>
                        <div>ВТ</div>
                        <div>СР</div>
                        <div>ЧТ</div>
                        <div>ПТ</div>
                        <div>СБ</div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-700 mb-4">
                        {days.map((date, index) => {
                            if (!date) return <div key={`empty-${index}`} />;

                            const dateStr = date.toISOString().split('T')[0];
                            const isSelected = dateStr === selectedDate;
                            const isToday = dateStr === today;
                            const isFuture = date > new Date();

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => !isFuture && handleDateSelect(date)}
                                    disabled={isFuture}
                                    className={`relative h-10 w-full flex items-center justify-center rounded-lg transition-all
                                        ${isSelected ? 'bg-red-500 text-white font-bold shadow-lg scale-105' : ''}
                                        ${isToday && !isSelected ? 'bg-red-50 text-red-600 font-bold' : ''}
                                        ${!isSelected && !isToday && !isFuture ? 'hover:bg-gray-100' : ''}
                                        ${isFuture ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => {
                                onChange(today);
                                setIsOpen(false);
                            }}
                            className="flex-1 py-2.5 px-3 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-md"
                        >
                            Сегодня
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 py-2.5 px-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
