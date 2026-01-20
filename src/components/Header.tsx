import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
    title: string;
    onBack?: () => void;
    rightAction?: React.ReactNode;
    className?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction, className = '' }) => (
    <div className={`flex items-center justify-between px-4 py-4 bg-[#f3f4f6]/85 backdrop-blur-md sticky top-0 z-30 border-b border-transparent transition-all ${className}`}>
        <div className="flex items-center gap-3">
            {onBack && (
                <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors -ml-2 text-red-500 font-medium flex items-center gap-1">
                    <ChevronLeft size={20} />
                    Назад
                </button>
            )}
            {!onBack && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
        </div>
        {rightAction}
    </div>
);
