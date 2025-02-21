'use client';
import { BlockMuteList } from '@/src/types/landingPage.type';
import { unblockFriend, unmuteFriend } from '@/src/lib/api/friend/friend.api';
import React, { useEffect, useState, useCallback } from 'react';
import { clearStore } from '@/src/utils/indexedDB';

interface BlockMuteListModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockMuteList?: BlockMuteList;
}

const BlockMuteListModal: React.FC<BlockMuteListModalProps> = ({ isOpen, onClose, blockMuteList }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      console.log(blockMuteList);
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

  const unblock_friend = async (userId: string) => {
    const select = window.confirm('차단을 해제하시겠습니까?');
    if (!select) return;
    const data = await unblockFriend(userId);
    if (!data) {
      console.error('Failed to unblock friend');
      alert('차단 해제를 실패했습니다');
    } else {
      Promise.all([clearStore('roommates'), clearStore('neighbors')]);
      alert('차단을 해제했습니다');
      window.location.reload();
    }
  };

  const unmute_friend = async (userId: string) => {
    const select = window.confirm('음소거를 해제하시겠습니까?');
    if (!select) return;
    const data = await unmuteFriend(userId);
    if (!data) {
      console.error('Failed to unmute friend');
      alert('음소거 해제를 실패했습니다');
    } else {
      alert('음소거를 해제했습니다');
      window.location.reload();
    }
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
        <h2 className="text-2xl font-bold mb-4">Block and Mute List</h2>
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Block List</h3>
          {blockMuteList && blockMuteList.blockList.length > 0 ? (
            <ul className="space-y-2">
              {blockMuteList.blockList.map((block, i) => (
                <li key={i} className="flex items-center justify-between hover:bg-gray-100 p-2 rounded">
                  <span>{block.user_nickname}</span>
                  <button
                    onClick={() => unblock_friend(block.block_edge_id)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Unblock
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No blocked users</p>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Mute List</h3>
          {blockMuteList && blockMuteList.muteList.length > 0 ? (
            <ul className="space-y-2">
              {blockMuteList.muteList.map((mute, i) => (
                <li key={i} className="flex items-center justify-between hover:bg-gray-100 p-2 rounded">
                  <span>{mute.user_nickname}</span>
                  <button
                    onClick={() => unmute_friend(mute.mute_edge_id)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Unmute
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No muted users</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockMuteListModal;
