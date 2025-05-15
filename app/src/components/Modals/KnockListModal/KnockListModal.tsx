// KnockListModal.tsx
'use client';
import { acceptKnock, rejectKnock } from '@/src/lib/api/knock.api';
import { KnockEdge } from '@/src/types/landingPage.type';
import React, { useEffect, useState, useCallback } from 'react';
import { User } from '@/src/types/landingPage.type';
import { useRouter } from 'next/navigation';

interface KnockListModalProps {
  isOpen: boolean;
  onClose: () => void;
  knocks?: KnockEdge[];
  addRoommate: (newRoommate: User, newNeighbors: User[]) => void;
  loggedInUserInfo: User;
}

const KnockListModal: React.FC<KnockListModalProps> = ({ isOpen, onClose, knocks, addRoommate, loggedInUserInfo }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const parseUserGroups = () => {
    try {
      if (!loggedInUserInfo?.groups) return [];
      const rawGroups = loggedInUserInfo.groups as unknown as string;

      if (Array.isArray(rawGroups)) {
        return rawGroups.filter((g) => g && g.trim() !== '');
      }

      const parsed = JSON.parse(rawGroups.replace(/'/g, '"'));
      return Array.isArray(parsed) ? parsed.filter((g) => g && g.trim() !== '') : [];
    } catch (e) {
      console.error('그룹 파싱 실패:', e);
      return [];
    }
  };

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
    const validGroups = parseUserGroups();

    if (validGroups.length === 0) {
      const create = window.confirm('그룹이 없습니다. 프로필 페이지에서 새 그룹을 생성하시겠습니까?');
      if (create) {
        onClose();
        router.push('/myprofile');
      }
      return;
    }

    const selectedGroup = selectedGroups[knockId];
    if (!selectedGroup) {
      alert('그룹을 선택해주세요');
      return;
    }
    const confirm = window.confirm(`[${selectedGroup}] 그룹으로 수락하시겠습니까?`);
    if (!confirm) return;

    const select = window.confirm('노크를 수락하시겠습니까?');
    if (!select) return;
    const data = await acceptKnock(knockId, selectedGroup);
    console.log('knockData in acceptknock func : ', data);
    console.log('addRoommate in acceptknock func : ', addRoommate);
    addRoommate(data.newRoommate, data.newNeighbors);
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
              <li key={i} className="border-b pb-2 flex flex-col gap-2 hover:bg-gray-100 p-2">
                <div className="flex justify-between items-center">
                  <p className="text-lg">{knock.nickname}</p>
                  <div className="flex gap-2 items-center">
                    {parseUserGroups().length > 0 ? (
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={selectedGroups[knock.edge_id] || ''}
                        onChange={(e) =>
                          setSelectedGroups((prev) => ({
                            ...prev,
                            [knock.edge_id]: e.target.value,
                          }))
                        }
                      >
                        <option value="" disabled>
                          그룹 선택
                        </option>
                        {parseUserGroups().map((groupName, index) => (
                          <option key={index} value={groupName}>
                            {groupName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button className="text-blue-500 text-sm underline" onClick={() => router.push('/myprofile')}>
                        그룹 생성 필요
                      </button>
                    )}
                    <div className="flex gap-1">
                      <button onClick={() => accept_knock(knock.edge_id)}>✅</button>
                      <button onClick={() => reject_knock(knock.edge_id)}>❌</button>
                    </div>
                  </div>
                </div>
                {!selectedGroups[knock.edge_id] && <p className="text-red-500 text-sm">그룹을 선택하십시오</p>}
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
