'use client';

import React, { useState, useEffect } from 'react';
// import { CSSTransition } from 'react-transition-group';
import styles from './ProfileModal.module.css';
import { API_URL } from '@/lib/utils/config';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const APIURL = API_URL;

const ProfileModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [profileData, setProfileData] = useState({
    my_memo: '',
    nickname: '',
    username: '',
    tags: [] as string[], // tags을 배열로 초기화
  });
  const [newTags, setNewTags] = useState<string>(''); // 새로운 tags 입력값

  useEffect(() => {
    if (isOpen) {
      fetchProfileData();
    }
  }, [isOpen]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`${APIURL}/domain/user/my/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error('An error occurred while fetching profile data.', error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNewTagsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTags(event.target.value);
  };

  const handleNewTagsKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && newTags.trim() !== '') {
      addTag();
    }
  };

  const addTag = () => {
    setProfileData((prevData) => ({
      ...prevData,
      tags: [...prevData.tags, newTags.trim()],
    }));
    setNewTags(''); // 입력 필드를 초기화
  };

  const removeTags = (index: number) => {
    setProfileData((prevData) => ({
      ...prevData,
      tags: prevData.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${APIURL}/domain/user/my/info/change`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          my_memo: profileData.my_memo,
          nickname: profileData.nickname,
          username: profileData.username,
          tags: profileData.tags,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Profile updated: ${data.my_memo}`);
        fetchProfileData(); // 저장 후 최신 프로필 데이터 다시 가져오기
        alert('프로필이 성공적으로 저장되었습니다.');
        onClose();
      } else {
        console.error('Failed to update profile.');
      }
    } catch (error) {
      console.error('An error occurred while saving profile.', error);
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    // <CSSTransition in={isOpen} timeout={300} className={styles.slideFade} mountOnEnter unmountOnExit>
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <button className={styles.modalClose} onClick={onClose}>
          X
        </button>
        <h2>My Profile</h2>
        <div>Nickname:</div>
        <input
          type="text"
          name="nickname"
          value={profileData.nickname}
          onChange={handleChange}
          className={styles.modalInput}
          placeholder="Edit your nickname..."
        />
        <div>Username:</div>
        <input
          type="text"
          name="username"
          value={profileData.username}
          onChange={handleChange}
          className={styles.modalInput}
          placeholder="Edit my name..."
        />
        <div>Memo:</div>
        <input
          type="text"
          name="my_memo"
          value={profileData.my_memo}
          onChange={handleChange}
          className={styles.modalInput}
          placeholder="Edit my memo..."
        />
        <div>Tags:</div>
        <input
          type="text"
          value={newTags}
          onChange={handleNewTagsChange}
          onKeyDown={handleNewTagsKeyPress}
          className={styles.modalInput}
          placeholder="Enter a new tags..."
        />
        <button onClick={addTag} className={styles.modalAddButton}>
          Add
        </button>
        <ul className={styles.tagsList}>
          {profileData.tags.map((item, index) => (
            <li key={index} className={styles.tagsItem}>
              {item} <button onClick={() => removeTags(index)}>X</button>
            </li>
          ))}
        </ul>
        <button onClick={handleSave} className={styles.modalSaveButton}>
          Save
        </button>
      </div>
    </div>
    // </CSSTransition>
  );
};

export default ProfileModal;
