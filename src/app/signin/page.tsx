'use client';

import React from 'react';
import Link from 'next/link';
import DefaultButton from '@/src/components/Button/DefaultButton';
import Input from '@/src/components/Input/DefaultInput';
import PwInput from '@/src/components/Input/PwInput/PwInput';
import { useState } from 'react';
import { API_URL } from '@/src/lib/config';
import { useRouter } from 'next/navigation';
// import { userApi } from '@/src/lib/api';

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
  const router = useRouter();

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

  // useEffect(() => {
  //   const isLoggedIn = userApi.checkLogin();
  //   if (isLoggedIn) {
  //     alert('이미 로그인 되어있습니다');
  //     router.push('/');
  //   }
  // }, [router]);

  return (
    <>
      <div className="w-40 h-10">
        <Link href={'/'}>
          <DefaultButton placeholder="랜딩화면으로" />
        </Link>
      </div>

      <div>로그인 페이지</div>

      <div className="w-40 h-10">
        <Input
          placeholder="email"
          value={userEmailInput}
          onChange={(e) => setUserEmailInput(e)}
          onEnter={onSignInButtonClickHandler}
        />
      </div>

      <div className="w-40 h-10">
        <PwInput
          placeholder="password"
          value={userPwInput}
          onChange={(e) => {
            setUserPwInput(e);
          }}
          onEnter={onSignInButtonClickHandler}
        />
      </div>

      {emailVerification && (
        <>
          <div className="w-40 h-10">
            <Input
              placeholder="인증번호 입력"
              value={userVerifyInput}
              onChange={(e) => {
                setUserVerifyCodeInput(e);
              }}
            />
          </div>
          <div className="w-40 h-10">
            <DefaultButton
              placeholder="인증번호 재전송"
              onClick={() => {
                alert('인증번호 재전송');
                onResendVerifyButtonClickHandler();
              }}
            />
          </div>
          <div className="w-40 h-10">
            <DefaultButton placeholder="인증하기" onClick={() => onVerifyButtonClickHandler()} />
          </div>
        </>
      )}

      <div className="w-40 h-10">
        <DefaultButton placeholder="로그인!" onClick={() => onSignInButtonClickHandler()} />
      </div>
    </>
  );
}
