'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/src/lib/api/axiosApiClient';
import loading_circle from '@/src/assets/gif/loading_circle.gif';
import Image from 'next/image';

export default function ResetPassword() {
  const [email, setEmail] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  const router = useRouter();

  const handleBackNavigation = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push('/signin');
    }, 300);
  };

  const handleSendEmail = async (email: string) => {
    try {
      setLoading(true); // 로딩 시작
      const response = await apiClient.post('/domain/auth/pw/reset', { email });
      if (response.status !== 200) {
        alert('비밀번호 재설정 이메일 전송에 실패했습니다.');
        return;
      }
      alert('비밀번호 재설정 이메일이 전송되었습니다.');
      router.push('/signin');
    } catch (error) {
      alert('오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Error sending email:', error);
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSendEmail(email);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 transition-opacity duration-300 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Loading Screen */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <Image src={loading_circle} alt="Loading" width={50} height={50} />
            <p className="text-white text-lg mt-4">잠시만 기다려주세요...</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md relative">
        {/* Back Arrow */}
        <button
          onClick={handleBackNavigation}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Go back to Sign In"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">비밀번호 재설정</h1>
        <p className="text-gray-600 text-center mb-6">이메일을 통해 비밀번호를 재설정하세요.</p>

        {/* Email Input */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="이메일 주소"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Send Email Button */}
        <button
          onClick={() => handleSendEmail(email)}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
        >
          비밀번호 재설정 이메일 보내기
        </button>
      </div>
    </div>
  );
}
