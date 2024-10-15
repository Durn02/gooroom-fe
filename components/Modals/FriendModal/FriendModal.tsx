'use client';

import React, { useState, useEffect } from 'react';
import styles from './FriendModal.module.css';
import { API_URL } from '@/lib/utils/config';
import { NetworkManager } from '@/lib/utils/VisNetGraph/NetworkManager';

// interface ModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   userNodeId: string | null; // 사용자의 노드 ID
// }

interface ModalProps {
  networkManager: NetworkManager;
  nodeId: string;
  isOpen: boolean;
}

const APIURL = API_URL;

const Modal: React.FC<ModalProps> = ({ networkManager, nodeId, isOpen }) => {
  const [memo, setMemo] = useState('');
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  useEffect(() => {
    if (nodeId && isOpen) {
      fetchMemo();
    }
  }, [nodeId, isOpen]);

  const fetchMemo = async () => {
    try {
      const response = await fetch(`${APIURL}/domain/friend/memo/get-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_node_id: nodeId }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setMemo(data.memo);
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
    setMemo(event.target.value);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${APIURL}/domain/friend/memo/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_node_id: nodeId, new_memo: memo }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setResponseMessage(`Memo updated: ${data.new_memo}`);
        fetchMemo();
      } else {
        setResponseMessage('Failed to update memo.');
      }
    } catch (error) {
      setResponseMessage('An error occurred while saving memo.');
      console.error(error);
    }
  };

  if (!isOpen) return null;

  const onClose = () => {
    networkManager.resetPosition();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.modalClose} onClick={onClose}>
          X
        </button>
        <h2>This is FriendPage. Edit Memo</h2>
        <input
          type="text"
          value={memo}
          onChange={handleMemoChange}
          className={styles.modalInput}
          placeholder="Edit your memo here..."
        />
        <button onClick={handleSave} className={styles.modalSaveButton}>
          ✔️
        </button>
        {responseMessage && <p className={styles.modalResponse}>{responseMessage}</p>}
      </div>
    </div>
  );
};

export default Modal;
