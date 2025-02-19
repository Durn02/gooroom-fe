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
import ContextMenu from '../components/ContextMenu/ContextMenu';
import { MY_NODE_MENU_ITEMS, NEIGHBOR_NODE_MENU_ITEMS, ROOMMATE_NODE_MENU_ITEMS } from '../constants/contextMenuItems';
import KnockListModal from '../components/Modals/KnockListModal/KnockListModal';
import { getKnocks } from '../lib/api/knock.api';
import { BlockMuteList, KnockEdge } from '../types/landingPage.type';
import BlockMuteListModal from '../components/Modals/BlockMuteListModal/BlockMuteListModal';
import { getBlockMuteList } from '../lib/api/user.api';

export default function Landing() {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number } | null;
    items: [string, () => void][];
    userId: string | null;
  }>({
    position: null,
    items: [],
    userId: null,
  });
  const [isKnockListModalOpen, setIsKnockListModalOpen] = useState(false);
  const [knocks, setKnocks] = useState<KnockEdge[]>([]);

  const [isBlockMuteListModalOpen, setIsBlockMuteListModalOpen] = useState(false);
  const [blockMuteList, setBlockMuteList] = useState<BlockMuteList>({ blockList: [], muteList: [] });

  const handleViewKnockList = async () => {
    const data = await getKnocks();
    setKnocks(data.knocks);
    setIsKnockListModalOpen(true);
  };

  const handleBlockMuteList = async () => {
    const data = await getBlockMuteList();
    setBlockMuteList(data.blockMuteList);
    setIsBlockMuteListModalOpen(true);
  };

  const callbacks = {
    onNodeDoubleClick: (userId: string) => {
      setSelectedUserId(userId);
    },
    onNodeClick: (userId: string) => {
      setSelectedUserId(userId);
    },
  };

  const { networkManager, networkContainer } = useNetwork(callbacks);
  const {} = useUI(networkManager);

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

  useEffect(() => {
    if (networkManager) {
      networkManager.setObserver(({ event, data }) => {
        switch (event) {
          case 'loggedInUserClicked':
            setContextMenu({
              position: data as { x: number; y: number },
              items: MY_NODE_MENU_ITEMS as [string, () => void][],
              userId: null,
            });
            break;
          case 'roommateNodeClicked':
            setContextMenu({
              position: data as { x: number; y: number },
              items: ROOMMATE_NODE_MENU_ITEMS as [string, () => void][],
              userId: (data as { x: number; y: number; userId: string }).userId,
            });
            break;
          case 'neighborNodeClicked':
            setContextMenu({
              position: data as { x: number; y: number },
              items: NEIGHBOR_NODE_MENU_ITEMS as [string, () => void][],
              userId: (data as { x: number; y: number; userId: string }).userId,
            });
            break;
          case 'backgroundClicked':
            setContextMenu({ position: null, items: [], userId: null });
            break;
        }
      });
    }
  }, [networkManager]);

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
            <div className={style.visNetContainer}>
              <div ref={networkContainer} id="NetworkContainer" style={{ height: '100vh', width: '100vw' }} />
              <ContextMenu
                items={contextMenu.items}
                position={contextMenu.position}
                onClose={() => setContextMenu({ position: null, items: [], userId: null })}
                userId={contextMenu.userId}
                onViewKnockList={handleViewKnockList}
                onViewBlockMuteList={handleBlockMuteList}
              />
            </div>
            {isKnockListModalOpen && (
              <KnockListModal
                knocks={knocks}
                onClose={() => setIsKnockListModalOpen(false)}
                isOpen={isKnockListModalOpen}
              />
            )}
            {isBlockMuteListModalOpen && (
              <BlockMuteListModal
                blockMuteList={blockMuteList}
                onClose={() => setIsBlockMuteListModalOpen(false)}
                isOpen={isBlockMuteListModalOpen}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}
