import React, { useState, useEffect, useCallback } from 'react';
import { createCast } from '@/src/lib/api/cast.api';
import Image from 'next/image';
import loading_circle from '@/src/assets/gif/loading_circle.gif';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  roommatesInfo: { nickname: string; node_id: string }[];
  neighborsInfo: { nickname: string; node_id: string }[];
}

const CastModal = ({ isOpen, onClose, roommatesInfo, neighborsInfo }: ModalProps) => {
  const [castMessage, setCastMessage] = useState('');
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [friends, setFriends] = useState<{ nickname: string; node_id: string; selected: boolean }[]>([]);

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
        friends: friends.filter((f) => f.selected).map((f) => f.node_id),
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

  const toggleFriend = (node_id: string) => {
    setFriends(
      friends.map((friend) => (friend.node_id === node_id ? { ...friend, selected: !friend.selected } : friend)),
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
            <Image src={loading_circle} alt="Loading" width={50} height={50} />
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Cast</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="castMessage" className="block text-sm font-medium text-gray-700 mb-2">
              Cast Message
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
            <div className="flex flex-wrap gap-2 max-h-[6.5rem] overflow-y-auto" style={{ alignContent: 'flex-start' }}>
              {friends.length === 0 && <span className="text-gray-400 text-sm">No recipients selected.</span>}
              {friends.map((friend) => (
                <button
                  type="button"
                  key={friend.node_id}
                  onClick={() => toggleFriend(friend.node_id)}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 transition-colors ${
                    friend.selected
                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {friend.nickname}
                  <span className="text-lg">{friend.selected ? 'x' : '+'}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
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
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              disabled={loading || !friends.some((f) => f.selected)}
            >
              {loading ? 'Creating...' : 'Create Cast'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CastModal;
