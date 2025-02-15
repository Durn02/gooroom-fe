// KnockListModal.tsx
'use client';
import { acceptKnock, rejectKnock } from '@/src/lib/api/knock.api';
import { KnockEdge } from '@/src/types/landingPage.type';
import { clearStore } from '@/src/utils/indexedDB';
import React, { useEffect, useState, useCallback } from 'react';

interface KnockListModalProps {
  isOpen: boolean;
  onClose: () => void;
  knocks?: KnockEdge[];
}

const KnockListModal: React.FC<KnockListModalProps> = ({ isOpen, onClose, knocks }) => {
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

  const accept_knock = async (knockId: string) => {
    const select = window.confirm('노크를 수락하시겠습니까?');
    if (!select) return;
    const data = await acceptKnock(knockId);
    Promise.all([clearStore('roommates'), clearStore('neighbors')]);
    window.location.reload();
    if (!data) {
      console.error('Failed to accept knock');
      alert('노크 수락을 실패했습니다');
    } else {
      alert('노크를 수락했습니다');
    }
    onClose();
  };

  const reject_knock = async (knockId: string) => {
    const select = window.confirm('노크를 거절하시겠습니까?');
    if (!select) return;
    const data = await rejectKnock(knockId);
    if (!data) {
      console.error('Failed to reject knock');
      alert('노크 거절을 실패했습니다');
    } else {
      alert('노크를 거절했습니다');
    }
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
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
        <h2 className="text-2xl font-bold mb-4">Knock List</h2>
        {knocks && knocks.length > 0 ? (
          <ul className="space-y-4">
            {knocks.map((knock, i) => (
              <li key={i} className="border-b pb-2 flex items-center justify-between hover:bg-gray-100">
                <p className="text-lg mb-1">{knock.nickname}</p>
                <div>
                  <button
                    onClick={() => accept_knock(knock.edge_id)}
                    className="text-green-500 hover:text-green-700 mr-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button onClick={() => reject_knock(knock.edge_id)} className="text-red-500 hover:text-red-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lg text-center">No knocks received</p>
        )}
      </div>
    </div>
  );
};

export default KnockListModal;
