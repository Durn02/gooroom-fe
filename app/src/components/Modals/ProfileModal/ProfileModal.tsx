'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '@/src/lib/config';
import { UserInfo } from '@/src/types/profilePage.type';
import { userApi } from '@/src/lib/api';
import Image from 'next/image';
import userImage from '@/src/assets/images/user.png';
import loading_circle from '@/src/assets/gif/loading_circle.gif';

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
      profile_image_url: null,
      remove_profile_image: false,
    },
  );
  const [newTags, setNewTags] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string>(
    typeof myProfile?.profile_image_url === 'string' ? myProfile.profile_image_url : userImage.src,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeProfileImage, setRemoveProfileImage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

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
        profile_image_url: myProfile.profile_image_url || null,
        remove_profile_image: myProfile.remove_profile_image || false,
      });
      setPreviewImage(typeof myProfile.profile_image_url === 'string' ? myProfile.profile_image_url : userImage.src);
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
    if (event.nativeEvent.isComposing) {
      return;
    }
    if (event.key === 'Enter' && newTags.trim()) {
      event.preventDefault();
      if (!profileData.tags.includes(newTags.trim())) {
        setProfileData((prevData) => ({
          ...prevData,
          tags: [...prevData.tags, newTags.trim()],
        }));
        setNewTags('');
      }
    }
  };

  const removeTags = (index: number) => {
    setProfileData((prevData) => ({
      ...prevData,
      tags: prevData.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Save logic here
      const formData = new FormData();
      formData.append('nickname', profileData.nickname);
      formData.append('username', profileData.username);
      formData.append('my_memo', profileData.my_memo);
      formData.append('tags', JSON.stringify(profileData.tags));
      if (removeProfileImage) {
        formData.append('remove_profile_image', 'True');
      }
      if (imageFile) {
        formData.append('profile_image', imageFile);
      }
      const response = await fetch(`${API_URL}/domain/user/my/info/change`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

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
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (loading) return;

    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.files && event.target.files[0]) {
  //     const file = event.target.files[0];
  //     const reader = new FileReader();

  //     reader.onloadend = () => {
  //       setPreviewImage(reader.result as string);
  //       setProfileData((prevData) => ({
  //         ...prevData,
  //         profile_image_url: file,
  //       }));
  //     };

  //     reader.readAsDataURL(file);
  //   }
  // };
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
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
      <div className="bg-white rounded-2xl p-10 overflow-y-auto w-full max-w-2xl min-h-[28rem] relative shadow-xl">
        {/* Loading Screen */}
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
            <div className="text-white text-lg mb-4">Loading...</div>
            <Image src={loading_circle} alt="Loading" width={50} height={50} />
          </div>
        )}

        <button className="absolute top-6 right-6 text-gray-500 hover:text-gray-700" onClick={onClose}>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-8">My Profile</h2>
        <div className="flex gap-8 mb-6">
          {/* Profile Image */}
          <div className="relative w-[9rem] h-[9rem] flex-shrink-0 group">
            {previewImage !== userImage.src && (
              <button
                className="absolute -top-3 -right-3 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:bg-gray-400 transition-colors z-10"
                onClick={() => {
                  if (window.confirm('기본이미지로 변경하시겠습니까?')) {
                    setPreviewImage(userImage.src);
                    setImageFile(null);
                    setRemoveProfileImage(true);
                  }
                }}
              >
                🗑️
              </button>
            )}

            <div className="relative w-[9rem] h-[9rem] border rounded-full overflow-hidden group">
              <Image
                src={previewImage}
                alt="프로필 미리보기"
                className="w-full h-full object-cover"
                width={144}
                height={144}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = userImage.src;
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 text-sm">이미지 변경</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImageChange}
              />
            </div>
          </div>
          {/* Profile Inputs */}
          <div className="flex-grow flex flex-col gap-5">
            <input
              type="text"
              name="nickname"
              value={profileData.nickname}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="닉네임을 입력하세요"
            />
            <input
              type="text"
              name="username"
              value={profileData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="사용자 이름을 입력하세요"
            />
          </div>
        </div>

        <textarea
          name="my_memo"
          value={profileData.my_memo}
          onChange={handleChange}
          className="w-full h-[6rem] px-4 py-3 border border-gray-300 rounded-lg resize-vertical mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="메모를 입력하세요"
        />

        <div className="mb-5">
          <input
            type="text"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            onKeyDown={handleNewTagsKeyPress}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="태그를 입력하고 Enter를 누르세요"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {profileData.tags.map((tag, index) => (
              <span key={index} className="bg-gray-100 px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                {tag}
                <button onClick={() => removeTags(index)} className="text-gray-400 hover:text-gray-600">
                  x
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-3 rounded-lg w-full text-center text-lg"
        >
          프로필 저장
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
