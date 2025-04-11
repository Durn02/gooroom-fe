'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/src/components/Input/DefaultInput';
import PwInput from '@/src/components/Input/PwInput/PwInput';
import VerifyInput from '@/src/components/Input/VerifyInput/VerifyInput';
import { API_URL } from '@/src/lib/config';

type SignupRequestData = {
  email: string;
  password: string;
  concern: string[];
  nickname: string;
  username: string;
};
type VerificationCodeRequestData = {
  email: string;
};
type SendVerificationCodeRequestData = {
  verifycode: string;
  email: string;
};

const APIURL = API_URL;

export default function Signup() {
  const [userEmailInput, setEmailInput] = useState<string>('');
  const [userPwInput, setUserPwInput] = useState<string>('');
  const [userConcernInput, setUserConcernInput] = useState<string>('');
  const [userNicknameInput, setUserNicknameInput] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [userVerificationCodeInput, setUserVerificationCodeInput] = useState<string>('');
  const [showVerifyIntputBox, setShowVerifyInputBox] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const router = useRouter();

  const handleBackNavigation = () => {
    setIsTransitioning(true); // 페이드아웃 시작
    setTimeout(() => {
      router.push('/main'); // 페이지 이동
    }, 300); // 애니메이션 지속 시간 (300ms)
  };

  const onSignupClickHandler = async () => {
    const signupRequestData: SignupRequestData = {
      email: userEmailInput,
      password: userPwInput,
      concern: userConcernInput.split(',').map((item) => item.trim()),
      nickname: userNicknameInput,
      username: usernameInput,
    };
    const verificationCodeRequest: VerificationCodeRequestData = {
      email: userEmailInput,
    };
    if (userEmailInput === '') {
      alert('이메일을 입력해주세요');
    } else if (userPwInput === '') {
      alert('비밀번호를 입력해주세요');
    } else if (userNicknameInput === '') {
      alert('닉네임을 입력해주세요');
    } else if (usernameInput === '') {
      alert('사용자 이름을 입력해주세요');
    } else {
      try {
        const signupResponse = await fetch(`${APIURL}/domain/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(signupRequestData),
        });

        if (signupResponse.ok) {
          setShowVerifyInputBox(true);
          alert('인증코드가 이메일로 전송되었습니다.');
          try {
            const verifyResponse = await fetch(`${APIURL}/domain/auth/send-verification-code`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(verificationCodeRequest),
            });
            if (!verifyResponse.ok) {
              throw new Error('server no response');
            }
          } catch (error) {
            if (error instanceof Error) {
              alert(`Verify failed: ${error.message}`);
            } else {
              alert('Verify failed: unknown error occurred.');
            }
          }
        } else {
          alert('회원가입 실패');
        }
      } catch (error) {
        if (error instanceof Error) {
          alert(`Signup failed: ${error.message}`);
        } else {
          alert('Signup failed: unknown error occurred.');
        }
      }
    }
  };

  const onVerifyClickHandler = async () => {
    const sendVerificationCodeRequest: SendVerificationCodeRequestData = {
      verifycode: userVerificationCodeInput,
      email: userEmailInput,
    };

    try {
      const response = await fetch(`${APIURL}/domain/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendVerificationCodeRequest),
      });
      if (response.ok) {
        alert('회원가입에 성공했습니다.');
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

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await fetch(`${APIURL}/domain/auth/verify-access-token`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // 쿠키를 포함시키기 위해 필요
        });

        if (response.ok) {
          const data = await response.json();
          if (data.message === 'access token validation check successfull') {
            alert('이미 로그인 되어있습니다.');
            router.push('/');
          }
        }
      } catch (error) {
        alert(error);
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

        {/* Concern Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">Concerns</label>
          <Input
            placeholder="Enter your concerns (comma-separated)"
            value={userConcernInput}
            onChange={(e) => setUserConcernInput(e)}
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
