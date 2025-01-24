'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DefaultButton from '@/src/components/Button/DefaultButton';
import CastPostStickerDropdownButton from '@/src/components/Button/DropdownButton/CastPostStickerDropdownButton/CastPostStickerDropdownButton';
import style from './LandingPage.module.css';
import useUI from '@/src/hooks/useUI';
import useNetwork from '@/src/hooks/useNetwork';
import { useIsLoginState } from '@/src/hooks/useIsLoginState';
import { onSignoutButtonClickHandler, onLogoutButtonClickHandler } from '../lib/api/sign';
import { verifyAccessToken } from '../lib/api/verifyAccessToken';
import { encrypt } from '../utils/crypto';

export default function Landing() {
  const router = useRouter();
  const { isLogin, login, logout } = useIsLoginState();
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const callbacks = {
    onNodeDoubleClick: (userId: string) => {
      setSelectedUserId(userId);
    },
    onNodeClick: (userId: string) => {
      setSelectedUserId(userId);
    },
  };

  const { networkManager, networkContainer } = useNetwork(callbacks);
  const { uiManager } = useUI(networkManager);

  useEffect(() => {
    console.log('isLogin in landing : ', isLogin);
    if (!isLogin) {
      verifyAccessToken().then((userNodeId) => {
        if (userNodeId) {
          login(userNodeId);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (selectedUserId === '') {
      return;
    }
    if (selectedUserId === networkManager.getLoggeInUser().node_id) {
      router.push('/myprofile');
    } else if (
      networkManager.getRoommatesWithNeighbors().some((instance) => instance.roommate.node_id === selectedUserId)
    ) {
      const encryptedUserId = encrypt(selectedUserId);
      router.push(`/roommateprofile/${encodeURIComponent(encryptedUserId)}`);
    } else {
      const encryptedUserId = encrypt(selectedUserId);
      router.push(`/neighborprofile/${encodeURIComponent(encryptedUserId)}`);
    }
  }, [selectedUserId, networkManager, router]);

  const cast_function = () => {
    console.log('cast function');
  };

  return (
    <>
      {!isLogin && (
        <>
          <div>gooroom에 오신 것을 환영합니다</div>
          <div className={style.toSignInPageButtonContainer}>
            <Link href={'signin'}>
              <DefaultButton placeholder="로그인 페이지로" />
            </Link>
          </div>
          <div className={style.toSignUpPageButtonContainer}>
            <Link href={'signup'}>
              <DefaultButton placeholder="회원가입 페이지로" />
            </Link>
          </div>
        </>
      )}

      {isLogin && (
        <>
          <div>
            <div className={style.castPostStickerDropdownButton}>
              <CastPostStickerDropdownButton cast_fuction={cast_function} />
            </div>
            <div className={style.magnifyButtonContainer}>
              <DefaultButton placeholder="+" onClick={() => networkManager.zoomIn()} />
              <DefaultButton placeholder="O" onClick={() => networkManager.resetPosition()} />
              <DefaultButton placeholder="-" onClick={() => networkManager.zoomOut()} />
            </div>
            <div className={style.logoutButtonContainer}>
              <DefaultButton placeholder="로그아웃" onClick={() => onLogoutButtonClickHandler(logout)} />
            </div>
            <div className={style.signoutButtonContainer}>
              <DefaultButton placeholder="회원탈퇴" onClick={() => onSignoutButtonClickHandler()} />
            </div>
            <div className={style.visNetContainer}>
              <div ref={networkContainer} id="NetworkContainer" style={{ height: '100vh', width: '100vw' }} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
