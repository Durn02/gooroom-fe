'use client';

import React from 'react';

interface props {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onClick: () => void;
}

const VerifyInput = ({ placeholder, value, onChange, onClick }: props) => {
  return (
    <div className="relative w-full">
      {/* Input Field */}
      <input
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {/* Button */}
      <button
        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg font-semibold transition-colors"
        type="button"
        onClick={onClick}
      >
        인증하기
      </button>
    </div>
  );
};

export default VerifyInput;
