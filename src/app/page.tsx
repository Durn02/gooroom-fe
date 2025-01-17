'use client';

import React, { useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DefaultButton from '@/src/components/Button/DefaultButton';
import CastPostStickerDropdownButton from '@/src/components/Button/DropdownButton/CastPostStickerDropdownButton/CastPostStickerDropdownButton';
import style from '../style/LandingPage.module.css';

import { API_URL } from '@/src/lib/config';
import useUI from '@/src/hooks/useUI';
import useNetwork from '@/src/hooks/useNetwork';
import { UserProfileContext } from '@/src/context/UserProfileContext';
import { useIsLoginState } from '@/src/hooks/useIsLoginState';

const APIURL = API_URL;

export default function Landing() {
  const router = useRouter();
  const isLoggedIn = useIsLoginState();

  const { selectedUserId, setSelectedUserId } = useContext(UserProfileContext);

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
    if (selectedUserId === null) {
      return;
    }
    if (selectedUserId === networkManager.getLoggeInUser().node_id) {
      router.push('/myprofile');
    } else if (
      networkManager.getRoommatesWithNeighbors().some((instance) => instance.roommate.node_id === selectedUserId)
    ) {
      router.push('/roommateprofile');
    } else {
      router.push('/neighborprofile');
    }
  }, [selectedUserId, networkManager, router]);

  useEffect(() => {
    //networkManager.readUnsentCast()
  }, [networkManager]);

  const cast_function = () => {
    console.log('cast function');
  };

  return (
    <>
      {!isLoggedIn && (
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

      {isLoggedIn && (
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
              <DefaultButton placeholder="로그아웃" onClick={() => onLogoutButtonClickHandler()} />
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
