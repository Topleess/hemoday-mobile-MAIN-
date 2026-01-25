import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
    title: string;
    onBack?: () => void;
    rightAction?: React.ReactNode;
    className?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction, className = '' }) => (
    <div className={`flex items-center gap-2 px-4 py-3 bg-[#f3f4f6]/85 backdrop-blur-md sticky top-0 z-30 border-b border-transparent ${className}`}>
        {/* Left Side: Back button */}
        <div className="w-16 flex-shrink-0 flex items-center">
            {onBack && (
                <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors -ml-2 text-red-500 font-medium flex items-center gap-0.5 text-sm">
                    <ChevronLeft size={16} />
                    Назад
                </button>
            )}
        </div>

        {/* Center: Title (Flexible & Wrapped) */}
        <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 text-[15px] leading-tight text-center break-words">
                {title}
            </h1>
        </div>

        {/* Right Side: Action button */}
        <div className="w-16 flex-shrink-0 flex items-center justify-end">
            <div className="text-sm">
                {rightAction}
            </div>
        </div>
    </div>
);
