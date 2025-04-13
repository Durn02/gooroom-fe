import React, { useState } from 'react';
import DefaultButton from '../Button/DefaultButton';
import { userApi } from '../../lib/api';

interface LandingPageSideBarProps {
  onClose: () => void;
  width: number;
  handleMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export const LandingPageSideBar: React.FC<LandingPageSideBarProps> = ({ onClose, width, handleMouseDown }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div
      className="h-full bg-white shadow-lg p-4 flex flex-col relative overflow-auto group"
      style={{ width: `${width}vw` }}
    >
      {/* Close Button with SVG */}
      <button
        onClick={onClose}
        className="self-end text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 19.5L15.75 12L8.25 4.5" />
        </svg>
      </button>

      <h2 className="text-xl font-bold mb-4">My Selection</h2>
      <input
        type="text"
        placeholder="Enter something..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <DefaultButton
        placeholder="Sign Out"
        onClick={() => userApi.onSignoutButtonClickHandler()}
        className="bg-red-500 hover:bg-red-600 text-gray-500 w-full py-2 rounded-lg"
      />
      {/* Resize Handle - 왼쪽에 배치 */}
      <div
        className="absolute top-0 left-0 w-1 h-full bg-transparent hover:bg-gray-300 cursor-ew-resize z-10"
        onMouseDown={handleMouseDown}
      ></div>
    </div>
  );
};
