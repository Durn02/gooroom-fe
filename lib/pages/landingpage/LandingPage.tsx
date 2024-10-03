'use client';

import React, { useEffect, useState, useRef, useContext } from 'react';
import { Network, Node, Edge } from 'vis-network';
import { DataSet } from 'vis-data';
import Link from 'next/link';
import DefaultButton from '@/components/Button/DefaultButton';
import visnet_options from '@/components/VisNetGraph/visnetGraphOptions';
import CastPostStickerDropdownButton from '@/components/Button/DropdownButton/CastPostStickerDropdownButton/CastPostStickerDropdownButton';
import style from './LandingPage.module.css';
import FriendModal from '@/components/Modals/FriendModal/FriendModal';
import ProfileModal from './ProfileModal';
import { IsLoginContext } from '@/lib/context/IsLoginContext';

import { zoomIn, zoomOut, resetPosition, disableGraphInteraction, hardenGraph } from '../../utils/graphInteraction';
import CastModal from '@/components/Modals/CastModal/CastModal';
import { castAnimation } from '../../utils/casting';
import { fetchUnreadCasts } from '../../utils/alertCasting';
import { User, RoomMateData, RoommateWithNeighbors } from '../../types/landingPage.type';
import { fetchFriends, initDataset, reloadDataset } from '../../utils/handleFriends';
import { API_URL } from '@/lib/utils/config';

const APIURL = API_URL;

export default function Landing() {
  const isLoggedIn = useContext(IsLoginContext);

  const loggedInUserRef = useRef<User>();
  const roommatesDataRef = useRef<RoomMateData[]>([]);
  const neighborsDataRef = useRef<User[]>([]);
  const friendsData: string[] = [];
  const roommatesWithNeighborsRef = useRef<RoommateWithNeighbors[]>([]);

  const nodesDataset = useRef(new DataSet<Node>());
  const edgesDataset = useRef(new DataSet<Edge>());

  const networkContainer = useRef<HTMLDivElement | null>(null);
  const networkInstance = useRef<Network | null>(null);

  const [isFriendModalOpen, setIsModalOpen] = useState(false);
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [cast_message, setCastMessage] = useState('');

  const closeFriendModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
    resetPosition(networkInstance.current);
  };

  const openFriendModal = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const fetchAndUpdateData = async () => {
    const friendsData = await fetchFriends();

    if (loggedInUserRef.current) {
      reloadDataset(
        {
          loggedInUser: loggedInUserRef.current,
          roommates: roommatesDataRef.current,
          neighbors: neighborsDataRef.current,
          roommatesWithNeighbors: roommatesWithNeighborsRef.current,
        },
        friendsData,
        nodesDataset.current,
        edgesDataset.current,
      );
    }
    roommatesDataRef.current = friendsData.roommates;
    neighborsDataRef.current = friendsData.neighbors;
    roommatesWithNeighborsRef.current = friendsData.roommatesWithNeighbors;

    // Check if loggedInUser exists. If it doesn't, this is the first load.
    if (!loggedInUserRef.current) {
      console.log(loggedInUserRef.current);
      loggedInUserRef.current = friendsData.loggedInUser;
      console.log(loggedInUserRef.current);
      initDataset(friendsData, nodesDataset.current, edgesDataset.current);
    }
  };
  const closeCastModal = () => {
    setIsCastModalOpen(false);
  };

  const openCastModal = () => {
    setIsCastModalOpen(true);
  };

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
          isLoggedIn.isLogin = true;
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
          isLoggedIn.isLogin = true;
        } else {
          isLoggedIn.isLogin = false;
        }
      }
    } catch (error) {
      console.error(`Unknown error occurred in verifyAccessToken : ${error}`);
    }
  };

  useEffect(() => {
    verifyAccessToken();
  }, []);

  useEffect(() => {
    if (networkContainer.current) {
      if (!networkInstance.current) {
        networkInstance.current = new Network(
          networkContainer.current,
          {
            nodes: nodesDataset.current,
            edges: edgesDataset.current,
          },
          visnet_options,
        );
        fetchAndUpdateData();

        networkInstance.current.on('doubleClick', (event: { nodes: string[] }) => {
          const { nodes: clickedNodes } = event;
          if (clickedNodes.length > 0) {
            const clickedNodeId = clickedNodes[0];

            networkInstance.current?.focus(clickedNodeId, {
              scale: 100, // 확대 비율 (1.0은 기본 값, 1.5는 1.5배 확대)
              animation: {
                duration: 1000, // 애니메이션 지속 시간 (밀리초)
                easingFunction: 'easeInOutQuad', // 애니메이션 이징 함수
              },
            });

            setTimeout(() => {
              if (clickedNodeId === loggedInUserRef.current?.node_id) {
                openFriendModal(clickedNodeId);
              } else {
                console.log(clickedNodeId);
                openFriendModal(clickedNodeId);
              }
            }, 800);
          }
        });
        fetchUnreadCasts(nodesDataset.current);
      } else {
        fetchAndUpdateData();
        console.log('fetchAndUpdateData called');
      }
    }
    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, [networkContainer.current]);

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
          isLoggedIn.setUserId(null);
          console.log('isLoggedIn : ', isLoggedIn);
          window.location.href = '/';
        }
      }
    } catch (error) {
      alert(error);
    }
  };

  const addFriend = async () => {
    // Simulate adding a friend

    fetchAndUpdateData(); // Re-fetch and reload the dataset
  };

  const cast = () => {
    disableGraphInteraction(networkInstance.current);
    hardenGraph(networkInstance.current);

    networkInstance.current?.once('stabilized', () => {
      castAnimation(
        networkInstance.current,
        networkContainer.current,
        loggedInUserRef.current?.node_id,
        roommatesDataRef.current,
        neighborsDataRef.current,
      );
    });

    roommatesDataRef.current.forEach((element) => {
      friendsData.push(element.roommate.node_id);
    });
    neighborsDataRef.current.forEach((element) => {
      friendsData.push(element.node_id);
    });

    fetch(`${APIURL}/domain/content/cast/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        friends: friendsData,
        message: cast_message,
        duration: 1,
      }),
      credentials: 'include',
    })
      .then((response) => {
        if (response.ok) {
          console.log('cast success');
        } else {
          console.error('cast failed');
        }
      })
      .catch((error) => {
        console.error('error : ', error);
      });
  };
  return (
    <>
      {console.log('isLoggedIn.isLogin : ', isLoggedIn.isLogin)}
      {!isLoggedIn.isLogin && (
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

      {isLoggedIn.isLogin && (
        <>
          <div>
            <div className={style.castPostStickerDropdownButton}>
              <CastPostStickerDropdownButton cast_fuction={openCastModal} />
            </div>
            <div className={style.magnifyButtonContainer}>
              <DefaultButton placeholder="+" onClick={() => zoomIn(networkInstance.current)} />
              <DefaultButton placeholder="O" onClick={() => resetPosition(networkInstance.current)} />
              <DefaultButton placeholder="-" onClick={() => zoomOut(networkInstance.current)} />
            </div>
            <div className={style.logoutButtonContainer}>
              <DefaultButton placeholder="로그아웃" onClick={() => onLogoutButtonClickHandler()} />
            </div>
            <div className={style.signoutButtonContainer}>
              <DefaultButton placeholder="회원탈퇴" onClick={() => onSignoutButtonClickHandler()} />
            </div>
            <button onClick={addFriend}>Add Friend Test</button>
            <div className={style.visNetContainer}>
              <div ref={networkContainer} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </>
      )}

      {/* 모달 컴포넌트 */}
      <FriendModal
        isOpen={isFriendModalOpen}
        onClose={closeFriendModal}
        userNodeId={selectedUserId ? selectedUserId : null}
      />
      <CastModal isOpen={isCastModalOpen} onClose={closeCastModal} setCastMessage={setCastMessage} cast={cast} />

      <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} />
    </>
  );
}
