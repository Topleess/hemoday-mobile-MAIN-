import React from 'react';

interface ToggleProps {
    checked: boolean;
    onChange: () => void;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange }) => (
    <button
        onClick={onChange}
        className={`w-12 h-7 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-red-500' : 'bg-gray-300'}`}
    >
        <div
            className={`w-5 h-5 bg-white rounded-full shadow absolute top-1 transition-transform duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
    </button>
);
