'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DefaultButton from '@/src/components/Button/DefaultButton';
import CastPostStickerDropdownButton from '@/src/components/Button/DropdownButton/CastPostStickerDropdownButton/CastPostStickerDropdownButton';
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
import CastModal from '../components/Modals/CastModal/CastModal';

export default function Landing() {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const [isKnockListModalOpen, setIsKnockListModalOpen] = useState(false);
  const [knocks, setKnocks] = useState<KnockEdge[]>([]);

  const [isBlockMuteListModalOpen, setIsBlockMuteListModalOpen] = useState(false);
  const [blockMuteList, setBlockMuteList] = useState<BlockMuteList>({ blockList: [], muteList: [] });

  const [isCreateCastModalOpen, setIsCreateCastModalOpen] = useState(false);

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

  const handleCreateCast = () => {
    setIsCreateCastModalOpen(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md py-3 px-6 flex justify-between items-center">
        <h1
          className="text-2xl font-bold text-gray-800 cursor-pointer select-none"
          onClick={() => {
            window.location.reload();
          }}
        >
          GooRoom
        </h1>
        <DefaultButton placeholder="Sign Out" onClick={() => userApi.onSignoutButtonClickHandler()} />
      </header>

      {/* Main Content */}
      <main className="flex-grow relative">
        {/* Dropdown Button */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 w-10">
          <CastPostStickerDropdownButton cast_fuction={() => console.log('cast function')} />
        </div>

        {/* Magnify Buttons */}
        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 w-10">
          <DefaultButton placeholder="+" onClick={() => networkManager.zoomIn()} />
          <DefaultButton placeholder="O" onClick={() => networkManager.resetPosition()} />
          <DefaultButton placeholder="-" onClick={() => networkManager.zoomOut()} />
        </div>

        {/* Network Container */}
        <div className="relative w-full h-[90vh] bg-white border border-gray-300 shadow-lg overflow-hidden">
          <div ref={networkContainer} style={{ height: '100%', width: '100%' }} />
          <ContextMenu
            items={contextMenu.items}
            position={contextMenu.position}
            onClose={() => setContextMenu({ position: null, items: [], userId: null })}
            userId={contextMenu.userId}
            onViewKnockList={handleViewKnockList}
            onViewBlockMuteList={handleBlockMuteList}
            onCreateCast={handleCreateCast}
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
      </main>

      {/* Modals */}
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
      {isCreateCastModalOpen && (
        <CastModal isOpen={isCreateCastModalOpen} onClose={() => setIsCreateCastModalOpen(false)} />
      )}
    </div>
  );
}
