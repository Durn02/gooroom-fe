'use client';

import React, { useState } from 'react';

interface props {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
}

const PwInput = ({ placeholder, value, onChange, onEnter }: props) => {
  const [showPassword, setShowPassword] = useState(false);

  const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onEnter && e.key === 'Enter') {
      onEnter();
    }
  };

  return (
    <div className="relative w-full">
      <input
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handlePressEnter}
      />

      <button
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700 transition-colors"
        type="button"
        onMouseDown={() => setShowPassword(true)}
        onMouseUp={() => setShowPassword(false)}
      >
        Show
      </button>
    </div>
  );
};

export default PwInput;
