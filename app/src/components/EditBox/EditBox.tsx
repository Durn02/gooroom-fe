import { API_URL } from '@/src/lib/config';
import { decrypt } from '@/src/utils/crypto';
import { useState, useEffect, useRef } from 'react';
import { FaPencilAlt, FaCheck } from 'react-icons/fa';

export const EditBox = ({ currentMemo, setRoommateMemo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newMemo, setNewMemo] = useState(currentMemo);
  const [isHovered, setIsHovered] = useState(false);
  const [isMemoChanged, setIsMemoChanged] = useState(false);
  // const selectedUserId = localStorage.getItem('selectedUserId');
  const textareaRef = useRef(null);

  useEffect(() => {
    setIsMemoChanged(newMemo !== currentMemo);
  }, [newMemo, currentMemo]);

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
      alert('Failed to save memo. Please try again.');
    }
  };

  const handleSave = () => {
    handleSaveRoommateMemo();
    setIsEditing(false);
  };

  return (
    <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="w-full p-4 mb-4 text-gray-700 border border-gray-400 rounded"
          value={newMemo}
          onChange={(e) => setNewMemo(e.target.value)}
          placeholder={currentMemo ? currentMemo : '친구에 대한 메모를 작성해보세요'}
        />
      ) : (
        <p className="mb-4 text-gray-700 whitespace-pre-wrap border border-gray-400 rounded p-4">
          {currentMemo || '친구에 대한 메모를 작성해보세요'}
        </p>
      )}
      {(isHovered || isEditing) && (
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={isEditing ? handleSave : handleEdit}
        >
          {isEditing ? <FaCheck /> : <FaPencilAlt />}
        </button>
      )}
    </div>
  );
};
