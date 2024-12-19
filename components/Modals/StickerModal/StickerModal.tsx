'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Sticker } from '@/lib/types/profilePage.type';

interface StickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sticker: Sticker;
}

const StickerModal: React.FC<StickerModalProps> = ({ isOpen, onClose, sticker }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg p-6 w-96 max-w-full relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-4">Sticker Details</h2>
        <p className="text-lg mb-4">{sticker.content}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {sticker.image_url.map((url, index) => (
            <Image
              key={index}
              src={url}
              alt={`Sticker image ${index + 1}`}
              width={100}
              height={100}
              className="rounded-md object-cover"
            />
          ))}
        </div>
        <p className="text-sm text-gray-500">Created at: {new Date(sticker.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default StickerModal;
