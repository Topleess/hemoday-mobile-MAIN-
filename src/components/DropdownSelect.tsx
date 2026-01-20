import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';

interface DropdownSelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string; icon?: React.ReactNode }[];
    placeholder?: string;
}

export const DropdownSelect: React.FC<DropdownSelectProps> = ({
    label,
    value,
    onChange,
    options,
    placeholder
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className="mb-4 w-full relative" ref={containerRef}>
            {label && <label className="block text-sm font-medium text-gray-500 mb-1.5 ml-1">{label}</label>}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-gray-100 text-gray-900 rounded-xl px-4 py-3.5 flex items-center justify-between focus:outline-none transition-all ${isOpen ? 'ring-2 ring-red-200 bg-white' : ''}`}
            >
                <span className={!selectedOption ? "text-gray-400" : "flex items-center gap-2"}>
                    {selectedOption?.icon && <span className="text-red-500">{selectedOption.icon}</span>}
                    {selectedOption ? selectedOption.label : placeholder || "Выберите..."}
                </span>
                <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top">
                    <div className="max-h-60 overflow-y-auto">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-gray-50 ${value === opt.value ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700'
                                    }`}
                            >
                                {opt.icon && <span className={value === opt.value ? 'text-red-500' : 'text-gray-400'}>{opt.icon}</span>}
                                {opt.label}
                                {value === opt.value && <CheckCircle2 size={16} className="ml-auto text-red-500" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
