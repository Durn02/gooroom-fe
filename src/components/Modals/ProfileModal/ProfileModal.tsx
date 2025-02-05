'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '@/src/lib/config';
import { UserInfo } from '@/src/types/profilePage.type';
import { userApi } from '@/src/lib/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  myProfile: UserInfo;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, myProfile }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [profileData, setProfileData] = useState<UserInfo>(
    myProfile || {
      my_memo: '',
      nickname: '',
      username: '',
      node_id: '',
      tags: [],
      profile_image_url: '',
    },
  );
  const [newTags, setNewTags] = useState<string>('');

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
      setIsVisible(true);
      document.addEventListener('keydown', handleKeyDown);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (myProfile) {
      setProfileData({
        nickname: myProfile.nickname || '',
        username: myProfile.username || '',
        my_memo: myProfile.my_memo || '',
        node_id: myProfile.node_id || '',
        tags: myProfile.tags || [],
        profile_image_url: '',
      });
    }
  }, [myProfile]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNewTagsKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (newTags.trim() !== '') {
        addTag();
      }
    }
  };

  const addTag = () => {
    setProfileData((prevData) => ({
      ...prevData,
      tags: [...prevData.tags, newTags],
    }));
    setNewTags('');
  };

  const removeTags = (index: number) => {
    setProfileData((prevData) => ({
      ...prevData,
      tags: prevData.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/domain/user/my/info/change`, {
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
        await response.json();
        const data = await userApi.fetchMyInfo();
        setProfileData(data);
        alert('프로필이 성공적으로 저장되었습니다.');
        onClose();
      } else {
        console.error('Failed to update profile.');
      }
    } catch (error) {
      alert('프로필 저장 중 오류가 발생했습니다.');
      console.error('An error occurred while saving profile.', error);
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg p-6 overflow-y-auto w-100 max-h-[70vh] min-h-[24rem] max-w-[35rem] min-w-[500px] relative">
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

        <div className="flex justify-between items-center mb-4 w-[28rem] mt-3">
          <h2 className="text-2xl font-bold">My Profile</h2>
          <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded">
            프로필 저장
          </button>
        </div>

        <div className="flex flex-col gap-4 max-w-[28rem]">
          <div className="w-full">
            <input
              type="text"
              name="nickname"
              value={profileData.nickname}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="닉네임을 입력하세요"
            />
          </div>

          <div className="w-full">
            <input
              type="text"
              name="username"
              value={profileData.username}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="사용자 이름을 입력하세요"
            />
          </div>

          <div className="w-full">
            <textarea
              name="my_memo"
              value={profileData.my_memo}
              onChange={handleChange}
              className="w-full h-[12rem] p-2 border rounded resize-none"
              placeholder="메모를 입력하세요"
            />
          </div>

          <div className="w-full">
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              onKeyDown={handleNewTagsKeyPress}
              className="w-full p-2 border rounded"
              placeholder="태그를 입력하고 Enter를 누르세요"
            />
            <div className="flex flex-wrap gap-2 mt-2 max-w-full overflow-hidden">
              {profileData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 transition-colors duration-200 break-words"
                >
                  <span className="text-gray-700 break-all">{tag}</span>
                  <button
                    onClick={() => removeTags(index)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 w-4 h-4 flex items-center justify-center flex-shrink-0"
                    aria-label={`Remove ${tag} tag`}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
