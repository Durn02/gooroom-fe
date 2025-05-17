'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Input from '@/src/components/Input/DefaultInput';
import PwInput from '@/src/components/Input/PwInput/PwInput';
import { useRouter } from 'next/navigation';
import { userApi, authApi } from '@/src/lib/api';
import { SigninRequest, VerifyCodeRequest, SendVerificationCodeRequest } from '@/src/types/request/auth.type';

export default function Signin() {
  const [emailVerification, setEmailVerification] = useState(false);
  const [userEmailInput, setUserEmailInput] = useState('');
  const [userPwInput, setUserPwInput] = useState('');
  const [userVerifyInput, setUserVerifyCodeInput] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  const handleBackNavigation = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push('/main');
    }, 300);
  };

  const onSignInButtonClickHandler = async () => {
    const signinRequestData: SigninRequest = {
      email: userEmailInput,
      password: userPwInput,
    };

    if (!userEmailInput) {
      alert('이메일을 입력해주세요');
      return;
    }

    if (!userPwInput) {
      alert('비밀번호를 입력해주세요');
      return;
    }

    try {
      const data = await authApi.signin(signinRequestData);

      if (data.detail === 'not registered email') {
        alert('가입되지 않은 이메일입니다');
      } else if (data.detail === 'not verified email') {
        alert('이메일 인증을 해주세요');
        setEmailVerification(true);
      } else if (data.detail === 'inconsistent password') {
        alert('비밀번호가 일치하지 않습니다');
      } else {
        alert('로그인 성공');
        router.push('/');
      }
    } catch (error) {
      console.error('로그인 요청 중 오류 발생:', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  const onVerifyButtonClickHandler = async () => {
    const verifyCodeRequest: VerifyCodeRequest = {
      verifycode: userVerifyInput,
      email: userEmailInput,
    };

    try {
      await authApi.verifySMTPCode(verifyCodeRequest);
      alert('Verify successful');
      router.push('/');
    } catch (error) {
      if (error instanceof Error) {
        alert(`Verify failed: ${error.message}`);
      } else {
        alert('Verify failed: Unknown error occurred.');
      }
    }
  };

  const onResendVerifyButtonClickHandler = async () => {
    const verifyRequest: SendVerificationCodeRequest = {
      email: userEmailInput,
    };

    try {
      await authApi.sendVerificationCode(verifyRequest);
      alert('인증코드가 재전송되었습니다.');
    } catch (error) {
      if (error instanceof Error) {
        alert(`Verify failed: ${error.message}`);
      } else {
        alert('Verify failed: An unknown error occurred.');
      }
    }
  };

  useEffect(() => {
    userApi.checkLogin().then((isLoggedIn) => {
      if (isLoggedIn) {
        alert('이미 로그인 되어있습니다');
        router.push('/');
      }
    });
  }, [router]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 transition-opacity duration-300 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md relative">
        {/* Back Arrow */}
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

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Sign In</h1>

        {/* Email Input */}
        <div className="mb-4">
          <Input
            placeholder="Enter your email"
            value={userEmailInput}
            onChange={(e) => setUserEmailInput(e)}
            onEnter={onSignInButtonClickHandler}
          />
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <PwInput
            placeholder="Enter your password"
            value={userPwInput}
            onChange={(e) => setUserPwInput(e)}
            onEnter={onSignInButtonClickHandler}
          />
        </div>

        {/* Email Verification Section */}
        {emailVerification && (
          <>
            <div className="mb-4">
              <Input
                placeholder="Enter verification code"
                value={userVerifyInput}
                onChange={(e) => setUserVerifyCodeInput(e)}
              />
            </div>
            <div className="flex justify-between mb-4 gap-2">
              <button
                onClick={onResendVerifyButtonClickHandler}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors w-1/2"
              >
                코드 재전송
              </button>
              <button
                onClick={onVerifyButtonClickHandler}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors w-1/2"
              >
                확인
              </button>
            </div>
          </>
        )}

        {/* Sign In Button */}
        <button
          onClick={onSignInButtonClickHandler}
          className="bg-blue-500 hover:bg-blue-600 text-white w-full py-2 rounded-lg font-semibold transition-colors"
        >
          Sign In
        </button>

        {/* Links */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-500 hover:text-blue-700 font-semibold">
              Sign Up
            </Link>
          </p>
          <p className="text-gray-600 mt-2">
            Forgot your password?{' '}
            <Link href="/reset-password" className="text-blue-500 hover:text-blue-700 font-semibold">
              Reset Password
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
