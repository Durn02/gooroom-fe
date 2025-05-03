import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import loading_circle from '@/src/assets/gif/loading_circle.gif';

interface SendKnockModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  userGroups: string[];
  onSendKnock: (nodeId: string, group?: string) => Promise<void>;
}

const SendKnockModal: React.FC<SendKnockModalProps> = ({ isOpen, onClose, nodeId, userGroups, onSendKnock }) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [customGroup, setCustomGroup] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (userGroups.length > 0) {
        setSelectedGroup(userGroups[0]);
        setIsCustom(false);
      } else {
        setIsCustom(true);
      }
      setCustomGroup('');
    }
  }, [isOpen, userGroups]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const finalGroup = isCustom || userGroups.length === 0 ? customGroup : selectedGroup;
      await onSendKnock(nodeId, finalGroup);
      onClose();
    } catch (error) {
      console.error('Error sending knock:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm relative">
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded-lg">
            <Image src={loading_circle} alt="Loading" width={50} height={50} />
            <p className="text-white mt-2">처리 중...</p>
          </div>
        )}

        <h2 className="text-xl font-bold mb-4">친구 추가</h2>
        <p className="text-gray-600 mb-4">이 사용자를 어떤 그룹에 추가하시겠습니까?</p>

        {/* 그룹이 있는 경우에만 드롭다운 표시 */}
        {userGroups.length > 0 ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">그룹 선택</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={isCustom ? 'custom' : selectedGroup}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustom(true);
                } else {
                  setIsCustom(false);
                  setSelectedGroup(e.target.value);
                }
              }}
              disabled={loading}
            >
              {userGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
              <option value="custom">직접 입력</option>
            </select>
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-sm text-yellow-600 mb-2">등록된 그룹이 없습니다. 새 그룹을 만들어주세요.</p>
          </div>
        )}

        {/* 직접 입력 모드이거나 그룹이 없는 경우 입력 필드 표시 */}
        {(isCustom || userGroups.length === 0) && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">새 그룹 이름</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="새 그룹 이름을 입력하세요"
              value={customGroup}
              onChange={(e) => setCustomGroup(e.target.value)}
              disabled={loading}
              autoFocus={userGroups.length === 0}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading || ((isCustom || userGroups.length === 0) && !customGroup.trim())}
          >
            친구 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendKnockModal;
