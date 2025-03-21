import React, { useEffect, useState } from 'react';
import styles from './CastModal.module.css';
import { createCast } from '@/src/lib/api/cast.api';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CastProps {
  message: string;
  friends: string[];
  duration: number;
}

const cast = async ({ message, friends, duration }: CastProps) => {
  try {
    const data = await createCast({ message, friends, duration });
    if (data.message === 'created successfully') {
      alert('cast를 성공적으로 생성했습니다.');
      return;
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
      return;
    }
  } catch (error) {
    console.error(error);
  }
};

const CastModal = ({ isOpen, onClose }: ModalProps) => {
  const [castMessage, setCastMessage] = useState('');
  const [friend, setFriend] = useState('');
  const [friends, setFriends] = useState<string[]>([]);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const inputElement = document.getElementById('castMessageInput') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, [isOpen]);

  const onCastButtonClickHandler = async () => {
    onClose();
    await cast({ message: castMessage, friends, duration });
  };

  const handlePressKeyboard = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onCastButtonClickHandler();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const addFriend = () => {
    if (friend.trim() !== '') {
      setFriends([...friends, friend.trim()]);
      setFriend('');
    }
  };

  const removeFriend = (index: number) => {
    setFriends(friends.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.modalCloseButton} onClick={onClose}>
          X
        </button>
        <input
          id="castMessageInput"
          className={styles.modalInput}
          type="text"
          placeholder="cast message를 입력하세요"
          value={castMessage}
          onChange={(e) => setCastMessage(e.target.value)}
          onKeyDown={handlePressKeyboard}
        />
        <input
          id="friendInput"
          className={styles.modalInput}
          type="text"
          placeholder="친구 이름을 입력하세요"
          value={friend}
          onChange={(e) => setFriend(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addFriend();
            }
          }}
        />
        <button className={styles.modalSubmitButton} onClick={addFriend}>
          친구 추가
        </button>
        <ul>
          {friends.map((friend, index) => (
            <li key={index}>
              {friend}
              <button onClick={() => removeFriend(index)}>삭제</button>
            </li>
          ))}
        </ul>
        <input
          id="duration"
          className={styles.modalInput}
          type="number"
          placeholder="지속 시간을 입력하세요"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          onKeyDown={handlePressKeyboard}
        />
        <button className={styles.modalSubmitButton} onClick={onCastButtonClickHandler}>
          전송
        </button>
      </div>
    </div>
  );
};

export default CastModal;