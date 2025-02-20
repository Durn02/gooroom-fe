'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DefaultButton from '@/src/components/Button/DefaultButton';
import CastPostStickerDropdownButton from '@/src/components/Button/DropdownButton/CastPostStickerDropdownButton/CastPostStickerDropdownButton';
import style from './LandingPage.module.css';
import useNetwork from '@/src/hooks/useNetwork';
import { userApi } from '../lib/api';
import { encrypt } from '../utils/crypto';
import ContextMenu from '../components/ContextMenu/ContextMenu';
import CastContainer from '../components/CastContainer/CastContainer';
import CastUI from '../components/UI/CastUI';
import { MY_NODE_MENU_ITEMS, NEIGHBOR_NODE_MENU_ITEMS, ROOMMATE_NODE_MENU_ITEMS } from '../constants/contextMenuItems';

export default function Landing() {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  // const [contextMenu, setContextMenu] = useState<{
  //   position: { x: number; y: number } | null;
  //   items: [string, () => void][];
  //   userId: string | null;
  // }>({
  //   position: null,
  //   items: [],
  //   userId: null,
  // });


  const callbacks = {
    onNodeDoubleClick: (userId: string) => {
      setSelectedUserId(userId);
    },
    onNodeClick: (userId: string) => {
      setSelectedUserId(userId);
    },
  };

  const { networkManager, networkContainer, castData, contextMenu, observing } = useNetwork(callbacks);
  // const [castStatus, setCastStatus] = useState<Record<string, { x: number; y: number }>>({});
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
      networkManager
        .getRoommatesWithNeighbors()
        .keys()
        .some((roommateId) => roommateId === selectedUserId)
    ) {
      const encryptedUserId = encrypt(selectedUserId);
      router.push(`/roommateprofile/${encodeURIComponent(encryptedUserId)}`);
    } else {
      const encryptedUserId = encrypt(selectedUserId);
      router.push(`/neighborprofile/${encodeURIComponent(encryptedUserId)}`);
    }
  }, [selectedUserId, networkManager, router]);

  // useEffect(() => {
  //   if (networkManager) {
  //     networkManager.setObserver(({ event, data }) => {
  //       switch (event) {
  //         case 'loggedInUserClicked':
  //           setContextMenu({
  //             position: data as { x: number; y: number },
  //             items: MY_NODE_MENU_ITEMS as [string, () => void][],
  //             userId: null,
  //           });
  //           break;
  //         case 'roommateNodeClicked':
  //           setContextMenu({
  //             position: data as { x: number; y: number },
  //             items: ROOMMATE_NODE_MENU_ITEMS as [string, () => void][],
  //             userId: (data as { x: number; y: number; userId: string }).userId,
  //           });
  //           break;
  //         case 'neighborNodeClicked':
  //           setContextMenu({
  //             position: data as { x: number; y: number },
  //             items: NEIGHBOR_NODE_MENU_ITEMS as [string, () => void][],
  //             userId: (data as { x: number; y: number; userId: string }).userId,
  //           });
  //           break;
  //         case 'backgroundClicked':
  //           setContextMenu({ position: null, items: [], userId: null });
  //           break;
  //         case 'startDrawing':
  //           setContextMenu({ position: null, items: [], userId: null });
  //           setCastStatus({});
  //         case 'finishDrawing':
  //           if (data) {
  //             setCastStatus(data as Record<string, { x: number; y: number }>);
  //           }
  //           break;
  //       }
  //     });
  //   }
  // }, [networkManager]);

  // useEffect(() => {
  //   console.log(castStatus);
  // },[castStatus]);
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
            <div className={style.signoutButtonContainer}>
              <DefaultButton placeholder="회원탈퇴" onClick={() => userApi.onSignoutButtonClickHandler()} />
            </div>
            <div className={style.visNetContainer} id="NetworkContainer" >
              <div ref={networkContainer} style={{ height: '100vh', width: '100vw' }} />
              {ContextMenu && !observing && (
                <ContextMenu
                  items={contextMenu.items}
                  position={contextMenu.position}
                  userId={contextMenu.userId}
                />)}

              { !observing && Object.keys(castData).length > 0 && Object.values(castData).map(({ userId, content }) => {
                const position = networkManager?.getPosition(userId);
                if(!position) return null;
                return (
                  <CastUI
                    key={userId}
                    content={content}
                    userId={userId}
                    scale={networkManager?.getScale() || 1}
                    size={networkManager?.getSize(userId) || 1}
                    position={{ x: position.x, y: position.y }}
                    contentCount={content.length} // content 개수 전달
                  />
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
