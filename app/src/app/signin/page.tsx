'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Input from '@/src/components/Input/DefaultInput';
import PwInput from '@/src/components/Input/PwInput/PwInput';
import { API_URL } from '@/src/lib/config';
import { useRouter } from 'next/navigation';
import { userApi } from '@/src/lib/api';

type signinRequestData = {
  email: string;
  password: string;
};
type VerifyCodeRequestData = {
  verifycode: string;
  email: string;
};
type VerifyRequestData = {
  email: string;
};
const APIURL = API_URL;

export default function Signin() {
  const [emailVerification, setEmailVerification] = useState(false);
  const [userEmailInput, setUserEmailInput] = useState('');
  const [userPwInput, setUserPwInput] = useState('');
  const [userVerifyInput, setUserVerifyCodeInput] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false); // 애니메이션 상태 추가
  const router = useRouter();

  const handleBackNavigation = () => {
    setIsTransitioning(true); // 페이드아웃 시작
    setTimeout(() => {
      router.push('/main'); // 페이지 이동
    }, 300); // 애니메이션 지속 시간 (300ms)
  };

  const onSignInButtonClickHandler = () => {
    const signinRequestData: signinRequestData = {
      email: userEmailInput,
      password: userPwInput,
    };

    if (!userEmailInput) {
      alert('이메일을 입력해주세요');
    } else if (!userPwInput) {
      alert('비밀번호를 입력해주세요');
    } else {
      try {
        fetch(`${APIURL}/domain/auth/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(signinRequestData),
          credentials: 'include',
        })
          .then((res) => res.json())
          .then((data) => {
            console.log('data in login : ', data);
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
          });
      } catch (e) {
        alert(e);
      }
    }
  };

  const onVerifyButtonClickHandler = async () => {
    const verifyCodeRequest: VerifyCodeRequestData = {
      verifycode: userVerifyInput,
      email: userEmailInput,
    };

    try {
      const response = await fetch(`${APIURL}/domain/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verifyCodeRequest),
      });
      if (response.ok) {
        alert('Verify successful');
        router.push('/');
      } else {
        alert(`Verify failed: ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Verify failed: ${error.message}`);
      }
    }
  };

  const onResendVerifyButtonClickHandler = async () => {
    const verifyRequest: VerifyRequestData = {
      email: userEmailInput,
    };
    try {
      const verifyResponse = await fetch(`${APIURL}/domain/auth/send-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verifyRequest),
      });
      if (!verifyResponse.ok) {
        throw new Error('server no response');
      }
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
                Resend Code
              </button>
              <button
                onClick={onVerifyButtonClickHandler}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors w-1/2"
              >
                Verify
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
