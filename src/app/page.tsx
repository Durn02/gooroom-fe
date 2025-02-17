'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DefaultButton from '@/src/components/Button/DefaultButton';
import CastPostStickerDropdownButton from '@/src/components/Button/DropdownButton/CastPostStickerDropdownButton/CastPostStickerDropdownButton';
import style from './LandingPage.module.css';
// import useUI from '@/src/hooks/useUI';
import useNetwork from '@/src/hooks/useNetwork';
import { userApi } from '../lib/api';
import { encrypt } from '../utils/crypto';
import ContextMenu from '../components/ContextMenu/ContextMenu';

import CastContainer from '../components/CastContainer/CastContainer';
import { MY_NODE_MENU_ITEMS, NEIGHBOR_NODE_MENU_ITEMS, ROOMMATE_NODE_MENU_ITEMS } from '../constants/contextMenuItems';

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

  const [castStatus, setCastStatus] = useState<Record<string, { x: number; y: number }>>({});
  const { networkManager, networkContainer, contextMenu, setContextMenu, castsList } = useNetwork(callbacks);

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

  useEffect(() => {
    console.log(castStatus);
  }, [castStatus]);
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

            <div className={style.visNetContainer} id="NetworkContainer">
              <div ref={networkContainer} style={{ height: '100vh', width: '100vw' }} />
              <ContextMenu
                items={contextMenu.items}
                position={contextMenu.position}
                onClose={() => setContextMenu({ position: null, items: [], userId: null })}
                userId={contextMenu.userId}
              />
              <CastContainer castStatus={castStatus} scale={networkManager?.getScale() || 1} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
