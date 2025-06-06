import React, { useState, useEffect, useCallback } from 'react';
import { createCast } from '@/src/lib/api/cast.api';
import Image from 'next/image';
import loadingCircle from '@/src/assets/gif/loadingCircle.gif';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  roommatesInfo: { nickname: string; nodeId: string }[];
  neighborsInfo: { nickname: string; nodeId: string }[];
}

const CastModal = ({ isOpen, onClose, roommatesInfo, neighborsInfo }: ModalProps) => {
  const [castMessage, setCastMessage] = useState('');
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [friends, setFriends] = useState<{ nickname: string; nodeId: string; selected: boolean }[]>([]);
  const allSelected = friends.length > 0 && friends.every((f) => f.selected);

  const toggleAllSelection = () => {
    const newState = !allSelected;
    setFriends(friends.map((friend) => ({ ...friend, selected: newState })));
  };

  useEffect(() => {
    if (isOpen) {
      setFriends([
        ...roommatesInfo.map((r) => ({ ...r, selected: true })),
        ...neighborsInfo.map((n) => ({ ...n, selected: false })),
      ]);
      setIsVisible(true);
      setTimeout(() => {
        const inputElement = document.getElementById('castMessage');
        inputElement?.focus();
      }, 0);
      document.addEventListener('keydown', handleKeyDown);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, roommatesInfo, neighborsInfo]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCast({
        friends: friends.filter((f) => f.selected).map((f) => f.nodeId),
        message: castMessage,
        duration,
      });
      alert('Cast created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating cast:', error);
      alert('Failed to create cast. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFriend = (nodeId: string) => {
    setFriends(
      friends.map((friend) => (friend.nodeId === nodeId ? { ...friend, selected: !friend.selected } : friend)),
    );
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (loading) return;
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-xl">
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50 rounded-lg">
            <div className="text-white text-lg mb-4">Creating Cast...</div>
            <Image src={loadingCircle} alt="Loading" width={50} height={50} />
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">캐스트 메시지</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="castMessage" className="block text-sm font-medium text-gray-700 mb-2">
              메시지
            </label>
            <input
              id="castMessage"
              type="text"
              value={castMessage}
              onChange={(e) => setCastMessage(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your message..."
              required
              autoFocus
            />
          </div>

          {/* 전송 대상 친구 목록 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">받는 사람</label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAllSelection}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">전체 선택</span>
              </label>
            </div>
            <div className="flex flex-wrap gap-2 max-h-[6.5rem] overflow-y-auto" style={{ alignContent: 'flex-start' }}>
              {friends.length === 0 && <span className="text-gray-400 text-sm">No recipients selected.</span>}
              {friends.map((friend) => (
                <button
                  type="button"
                  key={friend.nodeId}
                  onClick={() => toggleFriend(friend.nodeId)}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 transition-colors ${
                    friend.selected
                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {friend.nickname}
                  <span className="text-lg">{friend.selected ? '-' : '+'}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              메시지 지속 시간 (분)
            </label>
            <input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter duration"
              min="1"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              disabled={loading || !friends.some((f) => f.selected)}
            >
              {loading ? '생성 중...' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CastModal;
