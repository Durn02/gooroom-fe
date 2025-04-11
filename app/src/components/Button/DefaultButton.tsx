'use client';

import React from 'react';

interface Props {
  onClick?: () => void;
  placeholder: string;
  className?: string;
}

const DefaultButton = ({ onClick, placeholder, className }: Props) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold transition-colors ${className}`}
    >
      {placeholder}
    </button>
  );
};

export default DefaultButton;
