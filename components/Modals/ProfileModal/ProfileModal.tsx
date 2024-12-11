'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '@/lib/utils/config';
import { UserInfo } from '@/lib/types/myprofilePage.type';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  myProfile: UserInfo;
}

const ProfileModal: React.FC<ModalProps> = ({ isOpen, onClose, myProfile }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [profileData, setProfileData] = useState<UserInfo>(null);
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
      });
    }
  }, [myProfile]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`${API_URL}/domain/user/my/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        console.error('Failed to fetch profile data.');
        window.location.href = '/';
        return;
      }
      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error('An error occurred while fetching profile data.', error);
    }
  };

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
        fetchProfileData();
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
      <div
        className="bg-white p-6 rounded-lg relative w-4/5 max-w-md shadow-lg transition-transform duration-300  overflow-y-auto max-h-[70vh] p-4 transform ${
        isOpen ? 'scale-100' : 'scale-95'
      }"
      >
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
        <h2 className="text-2xl font-bold mb-4">My Profile</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nickname:</label>
          <input
            type="text"
            name="nickname"
            value={profileData.nickname}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 pl-1"
            placeholder="Edit your nickname..."
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Username:</label>
          <input
            type="text"
            name="username"
            value={profileData.username}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 pl-1"
            placeholder="Edit my name..."
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Memo:</label>
          <textarea
            name="my_memo"
            value={profileData.my_memo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 pl-1"
            placeholder="Edit my memo..."
            rows={3}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Tags:</label>
          <div className="flex">
            <input
              type="text"
              value={newTags}
              onChange={(e) => {
                setNewTags(e.target.value);
              }}
              onKeyUp={handleNewTagsKeyPress}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 pl-1"
              placeholder="Enter a new tag..."
            />
            <button onClick={addTag} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Add
            </button>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-2 mb-4">
          {profileData?.tags.map((item, index) => (
            <li key={index} className="flex justify-between items-center p-2 border border-gray-300 rounded">
              {item}
              <button onClick={() => removeTags(index)} className="text-red-500 hover:text-red-700">
                X
              </button>
            </li>
          ))}
        </ul>
        <button onClick={handleSave} className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
          Save
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
