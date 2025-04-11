'use client';

import React from 'react';

interface props {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
}

const Input = ({ placeholder, value, onChange, onEnter }: props) => {
  const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onEnter && e.key === 'Enter') {
      onEnter();
    }
  };

  return (
    <input
      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handlePressEnter}
    />
  );
};

export default Input;
