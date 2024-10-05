'use client';

import React, { useState, useEffect } from 'react';
import styles from './RoommateModal.module.css';
import { API_URL } from '@/lib/utils/config';

interface RoommateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userNodeId: string | null; // 사용자의 노드 ID
}

const APIURL = API_URL;

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
      const response = await fetch(`${APIURL}/domain/friend/get-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_node_id: userNodeId }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setRoommateData({
          nickname: data.friend.nickname,
          username: data.friend.username,
          tags: data.friend.tags,
          memo: data.roommate_edge.memo,
        });
      } else {
        console.error('에러가 발생했습니다.');
        setResponseMessage('Failed to load memo.');
      }
    } catch (error) {
      setResponseMessage('An error occurred while fetching memo.');
      console.error(error);
    }
  };

  const handleMemoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoommateData((prevState) => ({ ...prevState, memo: event.target.value }));
  };

  const handleMemoSave = async () => {
    try {
      const response = await fetch(`${APIURL}/domain/friend/memo/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_node_id: userNodeId, new_memo: roommateData.memo }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setResponseMessage(`Memo updated: ${data.memo}`);
        fetchRoommateData();
      } else {
        setResponseMessage('Failed to update memo.');
      }
    } catch (error) {
      setResponseMessage('An error occurred while saving memo.');
      console.error(error);
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
          onChange={handleMemoChange}
          placeholder="nickname"
          className={styles.modalInput}
        />
        <div>Username:</div>
        <input
          readOnly={true}
          type="text"
          value={roommateData.username}
          onChange={handleMemoChange}
          placeholder="nickname"
          className={styles.modalInput}
        />
        <div>Tags:</div>
        <input
          readOnly={true}
          type="text"
          value={roommateData.tags}
          onChange={handleMemoChange}
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
