'use client';

// import React, { useEffect, useState, useRef, useContext } from 'react';
import React, { useState, useEffect } from 'react';
// import { Network, Node, Edge } from 'vis-network';

// import React from 'react';
// import { Network } from 'vis-network';
// import { DataSet } from 'vis-data';
import Link from 'next/link';
import type { RoomMateData } from '@/lib/types/landingPage.type';
import DefaultButton from '@/components/Button/DefaultButton';
// import visnet_options from '@/components/VisNetGraph/visnetGraphOptions';
// import CastPostStickerDropdownButton from '@/components/Button/DropdownButton/CastPostStickerDropdownButton/CastPostStickerDropdownButton';
import type { User } from '@/lib/types/landingPage.type';
import style from './LandingPage.module.css';
import RoommateModal from '@/components/Modals/RoommateModal/RoommateModal';
import ProfileModal from '../../../components/Modals/ProfileModal/ProfileModal';
import NeighborModal from '@/components/Modals/NeighborModal/NeighborModal';

// import CastModal from '@/components/Modals/CastModal/CastModal';
// import { castAnimation } from '../../utils/casting';
// import { fetchUnreadCasts } from '../../utils/alertCasting';
// import { User, RoomMateData, RoommateWithNeighbors } from '../../types/landingPage.type';
// import { fetchFriends, initDataset, reloadDataset } from '../../utils/handleFriends';
import { API_URL } from '@/lib/utils/config';

import useNetwork from '@/lib/hooks/useNetwork';
import { useIsLoginState } from '@/lib/hooks/useIsLoginState';

const APIURL = API_URL;

export function Landing() {
  const isLoggedIn = useIsLoginState();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [isRoommateModalOpen, setIsRoommateModalOpen] = useState(false);
  const [isNeighborModalOpen, setIsNeighborModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  // const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  // const [cast_message, setCastMessage] = useState('');
  // const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  // const [cast_message, setCastMessage] = useState('');
  const callbacks = {
    onNodeDoubleClick: (nodeId: string, user: User, rmd: RoomMateData[]) => {
      return openFriendModal(nodeId, user, rmd);
    },
  };

  const { networkManager, networkContainer } = useNetwork(callbacks);

  const closeRoommateModal = () => {
    setIsRoommateModalOpen(false);
    setSelectedUserId(null);
    networkManager.resetPosition();
  };

  const closeNeighborModal = () => {
    setIsNeighborModalOpen(false);
    setSelectedUserId(null);
    networkManager.resetPosition();
  };

  const openFriendModal = (userId: string, loggedInUser: User, roommateData: RoomMateData[]) => {
    setSelectedUserId(userId);
    // console.log('networkManager :', networkManager);
    // const loggedInUser = networkManager.getLoggeInUser();
    console.log('loggedInUser :', loggedInUser);
    if (userId === loggedInUser.node_id) {
      setIsProfileModalOpen(true);
    } else if (roommateData.some((instance) => instance.roommate.node_id === userId)) {
      setIsRoommateModalOpen(true);
    } else {
      setIsNeighborModalOpen(true);
    }
  };

  // const closeCastModal = () => {
  //   setIsCastModalOpen(false);
  // };

  // const openCastModal = () => {
  //   setIsCastModalOpen(true);
  // };

  const onSignoutButtonClickHandler = async () => {
    const isSignout = window.confirm('정말 회원탈퇴를 진행하시겠습니까?');
    if (isSignout) {
      alert('회원탈퇴를 진행합니다!');
      try {
        const response = await fetch(`${APIURL}/domain/auth/signout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.message === 'signout success') {
            alert('회원탈퇴가 완료되었습니다.');
            window.location.href = '/';
          }
        }
      } catch (error) {
        alert('unknown error occurred in onSignoutButtonClickHandler');
        console.error(error);
      }
    }
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedUserId(null);
    networkManager.resetPosition();
  };

  const verifyAccessToken = async () => {
    try {
      const response = await fetch(`${APIURL}/domain/auth/verify-access-token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        if (data.message == 'access token validation check successfull') {
          // isLoggedIn = true;
          console.log('isLoggedIn : ', isLoggedIn);
        }
      } else {
        const refresh_response = await fetch(`${APIURL}/domain/auth/refresh-acc-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (refresh_response.ok) {
          // isLoggedIn = true;
          console.log('isLoggedIn : ', isLoggedIn);
        } else {
          // isLoggedIn = false;
          console.log('isLoggedIn : ', isLoggedIn);
        }
      }
    } catch (error) {
      console.error(`Unknown error occurred in verifyAccessToken : ${error}`);
    }
  };

  useEffect(() => {
    verifyAccessToken();
  }, []);

  const onLogoutButtonClickHandler = async () => {
    try {
      const response = await fetch(`${APIURL}/domain/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.message === 'logout success') {
          // 서버가 보낸 메시지에 따라 조건 수정
          alert('로그아웃합니다.');
          localStorage.clear();
          sessionStorage.clear();
          console.log('isLoggedIn : ', isLoggedIn);
          window.location.href = '/';
        }
      }
    } catch (error) {
      alert(error);
    }
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
            {/* <div className={style.castPostStickerDropdownButton}>
              <CastPostStickerDropdownButton cast_fuction={openCastModal} />
            </div> */}
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
            {/* <button onClick={addFriend}>Add Friend Test</button> */}
            <div className={style.visNetContainer}>
              <div ref={networkContainer} style={{ height: '100vh', width: '100vw' }} />
            </div>
          </div>
        </>
      )}

      {/* 모달 컴포넌트 */}
      {/* <CastModal isOpen={isCastModalOpen} onClose={closeCastModal} setCastMessage={setCastMessage} cast={cast} /> */}
      <RoommateModal
        isOpen={isRoommateModalOpen}
        onClose={closeRoommateModal}
        userNodeId={selectedUserId ? selectedUserId : null}
      />
      <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} />
      <NeighborModal
        isOpen={isNeighborModalOpen}
        onClose={closeNeighborModal}
        userNodeId={selectedUserId ? selectedUserId : null}
      />
    </>
  );
}

// {
/* <FriendModal
isOpen={isFriendModalOpen}
onClose={closeFriendModal}
userNodeId={selectedUserId ? selectedUserId : null}
/>
<CastModal isOpen={isCastModalOpen} onClose={closeCastModal} setCastMessage={setCastMessage} cast={cast} />

<ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} /> */
// }
