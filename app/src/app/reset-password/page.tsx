'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/src/lib/api/axiosApiClient';
import loading_circle from '@/src/assets/gif/loading_circle.gif';
import Image from 'next/image';
import VerifyInput from '@/src/components/Input/VerifyInput/VerifyInput';

export default function ResetPassword() {
  const [email, setEmail] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerifySection, setShowVerifySection] = useState(false);

  const router = useRouter();

  const handleBackNavigation = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push('/signin');
    }, 300);
  };

  const handleSendVerificationCode = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post('/domain/auth/send-verification-code', { email });

      if (response.status === 200) {
        alert('인증 코드가 이메일로 전송되었습니다.');
        setShowVerifySection(true);
      }
    } catch (error) {
      alert('이메일 전송에 실패했습니다. 다시 시도해주세요.');
      console.error('Error sending verification code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCodeAndReset = async () => {
    const confirm = window.confirm('비밀번호를 재설정하시겠습니까?');
    if (!confirm) {
      return;
    }
    try {
      setLoading(true);
      const response = await apiClient.post('/domain/auth/pw/reset', {
        email,
        verifycode: verificationCode,
      });

      if (response.status === 200) {
        alert('재설정한 비밀번호가 이메일로 전송되었습니다.');
        router.push('/signin');
      }
    } catch (error) {
      alert('비밀번호 재설정 실패. 정보를 확인해주세요.');
      console.error('Error resetting password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (!showVerifySection) {
        handleSendVerificationCode();
      } else {
        handleVerifyCodeAndReset();
      }
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

        {!showVerifySection ? (
          <>
            <div className="mb-4">
              <input
                type="email"
                placeholder="가입한 이메일 주소"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              onClick={handleSendVerificationCode}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              인증 코드 전송
            </button>
          </>
        ) : (
          <div className="mb-4">
            <VerifyInput
              placeholder="인증 코드 입력"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e)}
              onClick={handleVerifyCodeAndReset}
            />
          </div>
        )}
      </div>
    </div>
  );
}
