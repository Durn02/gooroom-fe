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
import KnockListModal from '../components/Modals/KnockListModal/KnockListModal';
import { getKnocks } from '../lib/api/knock.api';
import { BlockMuteList, KnockEdge } from '../types/landingPage.type';
import BlockMuteListModal from '../components/Modals/BlockMuteListModal/BlockMuteListModal';
import { getBlockMuteList } from '../lib/api/user.api';
import CastUI from '../components/UI/CastUI';

export default function Landing() {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string>('');

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

  const { networkManager, networkContainer, castData, contextMenu, setContextMenu, observing } = useNetwork(callbacks);

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
                onViewKnockList={handleViewKnockList}
                onViewBlockMuteList={handleBlockMuteList}
              />

              {!observing &&
                Object.keys(castData).length > 0 &&
                Object.values(castData).map(({ userId, content }) => {
                  const position = networkManager?.getPosition(userId);
                  if (!position) return null;
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
            {isKnockListModalOpen && (
              <KnockListModal
                knocks={knocks}
                onClose={() => setIsKnockListModalOpen(false)}
                isOpen={isKnockListModalOpen}
                addRoommate={networkManager.addRoommate}
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
