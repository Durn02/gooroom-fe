'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/src/components/Input/DefaultInput';
import PwInput from '@/src/components/Input/PwInput/PwInput';
import VerifyInput from '@/src/components/Input/VerifyInput/VerifyInput';
import { authApi } from '@/src/lib/api';
import { SignupRequest, SendVerificationCodeRequest, VerifyCodeRequest } from '@/src/types/request/auth.type';

export default function Signup() {
  const [userEmailInput, setEmailInput] = useState<string>('');
  const [userPwInput, setUserPwInput] = useState<string>('');
  const [userTagsInput, setUserTagsInput] = useState<string>('');
  const [userNicknameInput, setUserNicknameInput] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [userVerificationCodeInput, setUserVerificationCodeInput] = useState<string>('');
  const [showVerifyIntputBox, setShowVerifyInputBox] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const router = useRouter();

  const handleBackNavigation = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.back();
    }, 300);
  };

  const onSignupClickHandler = async () => {
    const signupRequestData: SignupRequest = {
      email: userEmailInput,
      password: userPwInput,
      tags: userTagsInput.split(',').map((item) => item.trim()),
      nickname: userNicknameInput,
      username: usernameInput,
    };

    if (!userEmailInput) {
      alert('이메일을 입력해주세요');
      return;
    }
    if (!userPwInput) {
      alert('비밀번호를 입력해주세요');
      return;
    }
    if (!userNicknameInput) {
      alert('닉네임을 입력해주세요');
      return;
    }
    if (!usernameInput) {
      alert('사용자 이름을 입력해주세요');
      return;
    }

    try {
      await authApi.signup(signupRequestData);
      alert('인증코드가 이메일로 전송되었습니다.');
      setShowVerifyInputBox(true);

      try {
        const sendVerificationCodeRequest: SendVerificationCodeRequest = {
          email: userEmailInput,
        };
        await authApi.sendVerificationCode(sendVerificationCodeRequest);
      } catch (error) {
        console.error('인증코드 전송 실패:', error);
        alert('인증코드 전송 중 문제가 발생했습니다.');
      }
    } catch (error) {
      console.error('회원가입 실패:', error);
      alert('회원가입 실패: 서버 오류가 발생했습니다.');
    }
  };

  const onVerifyClickHandler = async () => {
    const sendVerificationCodeRequest: VerifyCodeRequest = {
      verificationCode: userVerificationCodeInput,
      email: userEmailInput,
    };

    try {
      await authApi.sendVerificationCode(sendVerificationCodeRequest);
      alert('회원가입에 성공했습니다.');
      router.push('/');
    } catch (error) {
      if (error instanceof Error) {
        alert(`Verify failed: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const data = await authApi.verifyAccessToken();
        if (data.message === 'access token validation check successfull') {
          router.push('/');
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkLogin();
  }, [router]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 transition-opacity duration-300 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md relative">
        {/* Back Button */}
        <button
          onClick={handleBackNavigation}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Go back to main"
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

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Sign Up</h1>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <Input placeholder="Enter your email" value={userEmailInput} onChange={(e) => setEmailInput(e)} />
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <PwInput placeholder="Enter your password" value={userPwInput} onChange={(e) => setUserPwInput(e)} />
        </div>

        {/* Tag Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">Tags</label>
          <Input
            placeholder="Enter your tags (comma-separated)"
            value={userTagsInput}
            onChange={(e) => setUserTagsInput(e)}
          />
        </div>

        {/* Nickname Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">
            Nickname <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter your nickname"
            value={userNicknameInput}
            onChange={(e) => setUserNicknameInput(e)}
          />
        </div>

        {/* Username Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">
            Username <span className="text-red-500">*</span>
          </label>
          <Input placeholder="Enter your username" value={usernameInput} onChange={(e) => setUsernameInput(e)} />
        </div>

        {/* Verification Code Input */}
        {showVerifyIntputBox && (
          <div className="mb-4">
            <VerifyInput
              placeholder="Enter verification code"
              value={userVerificationCodeInput}
              onChange={(e) => setUserVerificationCodeInput(e)}
              onClick={() => onVerifyClickHandler()}
            />
          </div>
        )}

        {!showVerifyIntputBox && (
          <button
            onClick={onSignupClickHandler}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
          >
            Sign Up
          </button>
        )}
      </div>
    </div>
  );
}
