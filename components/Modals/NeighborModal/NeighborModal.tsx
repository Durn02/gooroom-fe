'use client';
import React, { useState, useEffect } from 'react';
import styles from './NeighborModal.module.css';
import { API_URL } from '@/lib/utils/config';

interface NeighborModalProps {
  isOpen: boolean;
  onClose: () => void;
  userNodeId: string | null;
}

const NeighborModal: React.FC<NeighborModalProps> = ({ isOpen, onClose, userNodeId }) => {
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [neighborData, setNeighborData] = useState({
    nickname: '',
    username: '',
    tags: [] as string[],
  });

  useEffect(() => {
    if (userNodeId && isOpen) {
      fetchNeighborData();
    }
  }, [userNodeId, isOpen]);

  const fetchNeighborData = async () => {
    try {
      const response = await fetch(`${API_URL}/domain/friend/get-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_node_id: userNodeId }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setNeighborData({
          nickname: data.friend.nickname,
          username: data.friend.username,
          tags: data.friend.tags,
        });
      } else {
        console.error('에러가 발생했습니다.');
        setResponseMessage('Failed to load data.');
      }
    } catch (error) {
      setResponseMessage('An error occurred while fetching data.');
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
        <h2>Neighbor Page</h2>
        <div>Nickname:</div>
        <input
          readOnly={true}
          type="text"
          value={neighborData.nickname}
          placeholder="nickname"
          className={styles.modalInput}
        />
        <div>Username:</div>
        <input
          readOnly={true}
          type="text"
          value={neighborData.username}
          placeholder="nickname"
          className={styles.modalInput}
        />
        <div>Tags:</div>
        <input
          readOnly={true}
          type="text"
          value={neighborData.tags}
          placeholder="nickname"
          className={styles.modalInput}
        />
        {responseMessage && <p className={styles.modalResponse}>{responseMessage}</p>}
      </div>
    </div>
  );
};

export default NeighborModal;
