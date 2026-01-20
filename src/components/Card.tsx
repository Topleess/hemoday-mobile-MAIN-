import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
    <div onClick={onClick} className={`bg-white rounded-2xl p-4 shadow-sm ${className}`}>
        {children}
    </div>
);
