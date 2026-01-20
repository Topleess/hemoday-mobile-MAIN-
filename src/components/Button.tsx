import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  className?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  variant = 'primary', 
  className = '', 
  children, 
  fullWidth = false 
}) => {
  const baseStyles = "px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200",
    secondary: "bg-red-50 text-red-500 hover:bg-red-100",
    outline: "border-2 border-gray-200 text-gray-700 hover:bg-gray-50",
    ghost: "text-red-500 hover:bg-red-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
  };
  
  return (
    <button 
      onClick={onClick} 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};
