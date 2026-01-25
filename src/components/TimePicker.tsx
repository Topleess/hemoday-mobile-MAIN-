import React, { useState } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
    label?: string;
    value: string; // HH:MM format
    onChange: (value: string) => void;
    className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({ label, value, onChange, className = '' }) => {
    const [showPicker, setShowPicker] = useState(false);

    // Parse current value
    const [hours, minutes] = value.split(':').map(Number);

    // Generate hours (0-23)
    const hourOptions = Array.from({ length: 24 }, (_, i) => i);
    // Generate minutes (0, 5, 10, 15, ..., 55)
    const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);

    const handleHourChange = (hour: number) => {
        const newTime = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        onChange(newTime);
    };

    const handleMinuteChange = (minute: number) => {
        const newTime = `${String(hours).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        onChange(newTime);
    };

    const formatTime = (time: string) => {
        return time; // Already in HH:MM format
    };

    return (
        <div className={`relative ${className}`}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

            <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="w-full bg-gray-100 rounded-xl px-4 py-3.5 flex items-center justify-between hover:bg-gray-200 transition-colors"
            >
                <span className="text-gray-900 font-medium">{formatTime(value)}</span>
                <Clock size={20} className="text-red-500" />
            </button>

            {showPicker && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowPicker(false)}
                    />
                    <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="flex divide-x divide-gray-200">
                            {/* Hours */}
                            <div className="flex-1">
                                <div className="text-center text-xs font-semibold text-gray-500 py-2 bg-gray-50">
                                    Часы
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {hourOptions.map(hour => (
                                        <button
                                            key={hour}
                                            type="button"
                                            onClick={() => {
                                                handleHourChange(hour);
                                            }}
                                            className={`w-full px-4 py-2.5 text-center hover:bg-red-50 transition-colors ${hour === hours ? 'bg-red-500 text-white hover:bg-red-600' : 'text-gray-700'
                                                }`}
                                        >
                                            {String(hour).padStart(2, '0')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Minutes */}
                            <div className="flex-1">
                                <div className="text-center text-xs font-semibold text-gray-500 py-2 bg-gray-50">
                                    Минуты
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {minuteOptions.map(minute => (
                                        <button
                                            key={minute}
                                            type="button"
                                            onClick={() => {
                                                handleMinuteChange(minute);
                                            }}
                                            className={`w-full px-4 py-2.5 text-center hover:bg-red-50 transition-colors ${minute === minutes ? 'bg-red-500 text-white hover:bg-red-600' : 'text-gray-700'
                                                }`}
                                        >
                                            {String(minute).padStart(2, '0')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
