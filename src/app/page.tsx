'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DefaultButton from '@/src/components/Button/DefaultButton';
import CastPostStickerDropdownButton from '@/src/components/Button/DropdownButton/CastPostStickerDropdownButton/CastPostStickerDropdownButton';
import style from './LandingPage.module.css';
import useUI from '@/src/hooks/useUI';
import useNetwork from '@/src/hooks/useNetwork';
import { userApi } from '../lib/api';
import { encrypt } from '../utils/crypto';

export default function Landing() {
  const router = useRouter();
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

  // useEffect(() => {
  //   console.log('networkManager set');
  //   if (networkManager == undefined) {
  //     console.log('setIsLoading set as false');
  //     setIsLoading(true);
  //   } else {
  //     console.log('setIsLoading set as true');
  //     setIsLoading(false);
  //   }
  // }, [networkManager]);

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
      {/* {isLoading && <div>isLoading</div>} */}

      {true && (
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
              <DefaultButton placeholder="로그아웃" onClick={() => userApi.onLogoutButtonClickHandler()} />
            </div>
            <div className={style.signoutButtonContainer}>
              <DefaultButton placeholder="회원탈퇴" onClick={() => userApi.onSignoutButtonClickHandler()} />
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
