'use client';

import React, { useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DefaultButton from '@/components/Button/DefaultButton';
import CastPostStickerDropdownButton from '@/components/Button/DropdownButton/CastPostStickerDropdownButton/CastPostStickerDropdownButton';
import style from './LandingPage.module.css';

import { API_URL } from '@/lib/utils/config';

import useNetwork from '@/lib/hooks/useNetwork';
import { useIsLoginState } from '@/lib/hooks/useIsLoginState';
import { UserProfileContext } from '@/lib/context/UserProfileContext';

export function Landing() {
  const router = useRouter();
  const isLoggedIn = useIsLoginState();

  const { selectedUserId, setSelectedUserId } = useContext(UserProfileContext);

  const callbacks = {
    onNodeDoubleClick: (userId: string) => {
      setSelectedUserId(userId);
    },
  };

  const { networkManager, networkContainer } = useNetwork(callbacks);

  const onSignoutButtonClickHandler = async () => {
    const isSignout = window.confirm('정말 회원탈퇴를 진행하시겠습니까?');
    if (isSignout) {
      alert('회원탈퇴를 진행합니다!');
      try {
        const response = await fetch(`${API_URL}/domain/auth/signout`, {
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

  const verifyAccessToken = async () => {
    try {
      const response = await fetch(`${API_URL}/domain/auth/verify-access-token`, {
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
          console.log('isLoggedIn : ', isLoggedIn);
        }
      } else {
        const refresh_response = await fetch(`${API_URL}/domain/auth/refresh-acc-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (refresh_response.ok) {
          alert('refresh token success');
          window.location.reload();
          console.log('isLoggedIn : ', isLoggedIn);
        } else {
          console.log('isLoggedIn : ', isLoggedIn);
        }
      }
    } catch (error) {
      console.error(`Unknown error occurred in verifyAccessToken : ${error}`);
    }
  };

  // useEffect(() => {

  // }, []);

  useEffect(() => {
    if (selectedUserId === null) {
      return;
    }
    if (selectedUserId === networkManager.getLoggeInUser().node_id) {
      router.push('/myprofile');
    } else if (networkManager.getRoommatesData().some((instance) => instance.roommate.node_id === selectedUserId)) {
      router.push('/roommateprofile');
    } else {
      router.push('/neighborprofile');
    }
  }, [selectedUserId, networkManager, router]);

  const onLogoutButtonClickHandler = async () => {
    try {
      const response = await fetch(`${API_URL}/domain/auth/logout`, {
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
              <div ref={networkContainer} style={{ height: '100vh', width: '100vw' }} />
            </div>
          </div>
        </>
      )}
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
