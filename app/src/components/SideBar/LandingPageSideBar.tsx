import React, { useEffect, useRef, useState } from 'react';
import apiClient from '@/src/lib/api/axiosApiClient';
import userImage from '@/src/assets/images/user.png';
import Image from 'next/image';
import { API_URL } from '@/src/lib/config';
import DefaultButton from '../Button/DefaultButton';
import { knockApi, userApi } from '@/src/lib/api';
import { SearchedUser, User } from '@/src/types/landingPage.type';
import SendKnockModal from '../Modals/SendKnockModal';

interface LandingPageSideBarProps {
  onClose: () => void;
  width: number;
  handleMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  isOpen: boolean;
  loggedInUserInfo?: User;
}

export const LandingPageSideBar: React.FC<LandingPageSideBarProps> = ({
  onClose,
  width,
  handleMouseDown,
  isOpen,
  loggedInUserInfo,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSendKnockModalOpen, setIsSendKnockModalOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const [userGroups, setUserGroups] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setUserGroups(loggedInUserInfo?.groups || []);
    }
  }, [isOpen]);

  useEffect(() => {
    if (inputValue.trim() === '') {
      setSearchResults([]);
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      try {
        const response = await apiClient.post<SearchedUser[]>(`${API_URL}/domain/user/search/get-members`, {
          query: inputValue,
        });
        if (!response.data[0]['nickname']) {
          setSearchResults([]);
          return;
        }
        setSearchResults(response.data);
      } catch (error) {
        console.error('검색 실패:', error);
        setSearchResults([]);
      }
    }, 700);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [inputValue]);

  const openSendKnockModal = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setIsSendKnockModalOpen(true);
  };
  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendKnock = async (nodeId: string, group: string) => {
    const sendKnock = window.confirm('노크를 하시겠습니까?');
    if (!sendKnock) {
      return;
    }
    try {
      const data = await knockApi.sendKnock(nodeId, group);
      if (data.message === 'send knock successfully') {
        alert('노크를 성공적으로 보냈습니다.');
        onClose();
        setInputValue('');
      } else if (data.message === 'knock already sent') {
        alert('이미 노크를 보냈습니다.');
      } else if (data.message === 'User does not exist') {
        alert('존재하지 않는 사용자입니다.');
      } else if (data.message === 'cannot send to myself') {
        alert('자신에게 노크를 보낼 수 없습니다.');
      } else if (data.message === 'already roommate') {
        alert('이미 룸메이트입니다.');
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
      return;
    } catch (error) {
      console.error('노크 전송 실패:', error);
      alert('노크 전송에 실패했습니다.');
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="h-full bg-white shadow-lg p-4 flex flex-col relative overflow-hidden group"
      style={{ width: `${width}vw` }}
    >
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="self-end text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 19.5L15.75 12L8.25 4.5" />
        </svg>
      </button>

      <h2 className="text-xl font-bold mb-4">검색</h2>

      {/* 검색 입력창 */}
      <input
        type="text"
        ref={inputRef}
        placeholder="닉네임이나 사용자명을 입력하세요"
        value={inputValue}
        onChange={handleSearchInputChange}
        className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* 검색 결과 목록 */}
      <div className="flex-1 overflow-y-auto">
        {searchResults.length > 0 ? (
          searchResults.map((user) => (
            <div
              key={user.nodeId}
              className="flex items-center p-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100"
            >
              {/* 프로필 이미지 */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 mr-3">
                <Image
                  src={user.profileImageUrl || userImage}
                  alt="프로필"
                  className="w-full h-full object-cover"
                  width={100}
                  height={100}
                />
              </div>

              {/* 사용자 정보 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{user.nickname}</h3>
                <p className="text-sm text-gray-500 truncate">{user.username}</p>
              </div>

              {/* 친구 추가 버튼 */}
              <button
                onClick={() => {
                  if (!user.isRoommate && !user.sentKnock) {
                    // 직접 호출 대신 모달 열기
                    openSendKnockModal(user.nodeId);
                  }
                }}
                disabled={user.isRoommate || user.sentKnock}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  user.isRoommate || user.sentKnock
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {user.isRoommate ? '이미 친구' : user.sentKnock ? '노크 보냄' : '친구 추가'}
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">
            {inputValue ? '검색 결과가 없습니다' : '검색어를 입력해주세요'}
          </div>
        )}
      </div>
      <DefaultButton
        placeholder="Sign Out"
        onClick={() => userApi.onSignoutButtonClickHandler()}
        className="bg-red-500 hover:bg-red-600 text-gray-500 w-full py-2 rounded-lg"
      />

      {/* 리사이즈 핸들 */}
      <div
        className="absolute top-0 left-0 w-1 h-full bg-transparent hover:bg-gray-300 cursor-ew-resize z-10"
        onMouseDown={handleMouseDown}
      ></div>

      <SendKnockModal
        isOpen={isSendKnockModalOpen}
        onClose={() => setIsSendKnockModalOpen(false)}
        nodeId={selectedNodeId}
        userGroups={userGroups}
        onSendKnock={handleSendKnock}
      />
    </div>
  );
};
