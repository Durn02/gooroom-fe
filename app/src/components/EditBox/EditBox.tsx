import { API_URL } from '@/src/lib/config';
import { useState, useEffect, useRef } from 'react';
import { FaPencilAlt } from 'react-icons/fa';

export const EditBox = ({ currentMemo, setRoommateMemo, selectedUserId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newMemo, setNewMemo] = useState(currentMemo);
  const [isMemoChanged, setIsMemoChanged] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setIsMemoChanged(newMemo !== currentMemo);
  }, [newMemo, currentMemo]);
  useEffect(() => {
    setNewMemo(currentMemo);
  }, [currentMemo]);
  const handleCancel = () => {
    setNewMemo(currentMemo); // 변경사항 초기화
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(newMemo.length, newMemo.length);
    }
  }, [isEditing, newMemo.length]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveRoommateMemo = async () => {
    if (!isMemoChanged) {
      setIsEditing(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/domain/friend/memo/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_node_id: selectedUserId,
          new_memo: newMemo,
        }),
      });
      if (response.ok) {
        setRoommateMemo(newMemo);
      } else {
        throw new Error('Failed to save memo');
      }
    } catch (error) {
      console.error('Error saving memo:', error);
      setNewMemo(currentMemo);
      alert('메모 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleSave = () => {
    handleSaveRoommateMemo();
    setIsEditing(false);
  };

  return (
    <div className="relative group">
      {isEditing ? (
        <div className="relative">
          <textarea
            ref={textareaRef}
            className="w-full p-4 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={newMemo}
            onChange={(e) => setNewMemo(e.target.value)}
            placeholder="친구에 대한 메모를 작성해보세요"
            rows={4}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={handleSave}
            >
              저장
            </button>
            <button
              className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={handleCancel} // 취소 버튼 핸들러 변경
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <p
            className={`p-4 text-gray-700 whitespace-pre-wrap rounded-lg border ${
              currentMemo
                ? 'border-gray-200 bg-gray-50'
                : 'border-dashed border-gray-300 bg-gray-50 italic text-gray-400'
            }`}
          >
            {currentMemo || '친구에 대한 메모를 작성해보세요'}
          </p>
          <button
            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-blue-500 bg-white rounded-full shadow-sm hover:shadow-md transition-all"
            onClick={handleEdit}
          >
            <FaPencilAlt className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
