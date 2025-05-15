'use client';

import React, { useState, useEffect } from 'react';
import styles from './RoommateModal.module.css';
import { friendApi } from '@/src/lib/api';

interface RoommateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userNodeId: string | null; // 사용자의 노드 ID
}

const RoommateModal: React.FC<RoommateModalProps> = ({ isOpen, onClose, userNodeId }) => {
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [roommateData, setRoommateData] = useState({
    nickname: '',
    username: '',
    tags: [] as string[],
    memo: '',
  });

  useEffect(() => {
    if (userNodeId && isOpen) {
      fetchRoommateData();
    }
  }, [userNodeId, isOpen]);

  const fetchRoommateData = async () => {
    try {
      const data = await friendApi.fetchFriendInfo({ userNodeId });

      setRoommateData({
        nickname: data.friend.nickname,
        username: data.friend.username,
        tags: data.friend.tags,
        memo: data.roommateEdge.memo,
      });
    } catch (error) {
      console.error('에러가 발생했습니다.', error);
      setResponseMessage('An error occurred while fetching memo.');
    }
  };

  const handleMemoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoommateData((prevState) => ({ ...prevState, memo: event.target.value }));
  };

  const handleMemoSave = async () => {
    try {
      await friendApi.modifyMemo({
        userNodeId: userNodeId,
        newMemo: roommateData.memo,
      });

      setResponseMessage(`Memo updated: ${roommateData.memo}`);
      alert('메모가 성공적으로 저장되었습니다.');
      fetchRoommateData();
    } catch (error) {
      console.error('메모 저장 중 오류:', error);
      alert('메모 저장에 실패했습니다.');
      setResponseMessage('An error occurred while saving memo.');
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <button className={styles.modalClose} onClick={onClose}>
          X
        </button>
        <h2>Roommate Page</h2>
        <div>Nickname:</div>
        <input
          readOnly={true}
          type="text"
          value={roommateData.nickname}
          placeholder="nickname"
          className={styles.modalInput}
        />
        <div>Username:</div>
        <input
          readOnly={true}
          type="text"
          value={roommateData.username}
          placeholder="nickname"
          className={styles.modalInput}
        />
        <div>Tags:</div>
        <input
          readOnly={true}
          type="text"
          value={roommateData.tags}
          placeholder="nickname"
          className={styles.modalInput}
        />
        <div>Memo:</div>
        <input
          type="text"
          value={roommateData.memo}
          onChange={handleMemoChange}
          className={styles.modalInput}
          placeholder="Edit your memo here..."
        />
        <button onClick={handleMemoSave} className={styles.modalSaveButton}>
          ✔️
        </button>
        {responseMessage && <p className={styles.modalResponse}>{responseMessage}</p>}
      </div>
    </div>
  );
};

export default RoommateModal;
