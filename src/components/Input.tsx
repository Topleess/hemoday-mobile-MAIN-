import React from 'react';

interface InputProps {
    label?: string;
    type?: string;
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    rightIcon?: React.ReactNode;
    readOnly?: boolean;
    className?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    rightIcon,
    readOnly,
    className = ''
}) => (
    <div className={`w-full ${className}`}>
        {label && <label className="block text-sm font-medium text-gray-500 mb-1.5 ml-1">{label}</label>}
        <div className="relative">
            <input
                type={type}
                className={`w-full bg-gray-100 text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all ${readOnly ? 'cursor-default' : ''}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                readOnly={readOnly}
            />
            {rightIcon && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {rightIcon}
                </div>
            )}
        </div>
    </div>
);
