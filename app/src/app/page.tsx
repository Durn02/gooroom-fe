'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useNetwork from '@/src/hooks/useNetwork';
import { encrypt } from '../utils/crypto';
import ContextMenu from '../components/ContextMenu/ContextMenu';
import KnockListModal from '../components/Modals/KnockListModal/KnockListModal';
import { getKnocks } from '../lib/api/knock.api';
import { BlockMuteList, KnockEdge, User } from '../types/DomainObject/landingPage.type';
import BlockMuteListModal from '../components/Modals/BlockMuteListModal/BlockMuteListModal';
import { getBlockMuteList } from '../lib/api/user.api';
import CastUI from '../components/UI/CastUI';
import CastModal from '../components/Modals/CastModal/CastModal';
import { useResizeSection } from '@/src/hooks/useResizeSection';
import { LandingPageSideBar } from '../components/SideBar/LandingPageSideBar';
import { clearStore } from '../utils/indexedDB';

export default function Landing() {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loggedInUserInfo, setLoggedInUserInfo] = useState<User>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    console.log('blockMute : ', blockMuteList);
  };

  const handleCreateCast = () => {
    setIsCreateCastModalOpen(true);
  };

  const callbacks = {
    onNodeDoubleClick: (userId: string) => {
      setContextMenu({ position: null, items: [], userId: null });
      setSelectedUserId(userId);
    },
    onNodeClick: (userId: string) => {
      setSelectedUserId(userId);
    },
  };

  const { networkManager, networkContainer, castData, setCastData, contextMenu, setContextMenu, observing } =
    useNetwork(callbacks);

  const { width, handleMouseDown } = useResizeSection({
    minWidth: 20,
    maxWidth: 50,
    initialWidth: 30,
    sectionSide: 'right',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCastData((prev) => {
        const now = Date.now();
        const updated = Object.fromEntries(
          Object.entries(prev)
            .map(([userId, { content }]) => {
              const filtered = content.filter((c) => {
                const created = new Date(c.createdAt).getTime();
                return now < created + c.duration * 60_000;
              });
              return filtered.length > 0 ? [userId, { content: filtered }] : null;
            })
            .filter(Boolean) as [string, { content: (typeof prev)[string]['content'] }][],
        );
        return updated;
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, [setCastData]);

  useEffect(() => {
    setLoggedInUserInfo(networkManager?.getLoggedInUser());
    if (selectedUserId === '') {
      return;
    }
    if (selectedUserId === networkManager.getLoggedInUser().nodeId) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white shadow-md px-6 flex justify-between items-center">
        <h1
          className="text-2xl font-bold text-gray-800 cursor-pointer select-none"
          onClick={() => {
            Promise.all([clearStore('roommates'), clearStore('neighbors')]);
            window.location.reload();
          }}
        >
          GooRoom
        </h1>
        {/* Hamburger Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-12 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md shadow-md transition-all flex items-center justify-center select-none"
          aria-label="Toggle Sidebar"
        >
          ☰
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex relative overflow-hidden">
        {/* Network Container */}
        <div className="flex-1 relative bg-white border border-gray-300 shadow-lg">
          <div
            ref={networkContainer}
            className="w-full h-full min-w-[50vw] max-h-[calc(100vh-4rem)]"
            style={{ aspectRatio: '1 / 1' }}
          />
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
            Object.entries(castData).map(([userId, { content }]) => {
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
                  contentCount={content.length}
                />
              );
            })}
        </div>
      </main>
      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full z-20 transform transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <LandingPageSideBar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          width={width}
          handleMouseDown={handleMouseDown}
          loggedInUserInfo={loggedInUserInfo}
        />
      </div>
      {/* Magnify Buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => networkManager.zoomIn()}
          className="p-3 bg-gray-200 hover:bg-gray-300 text-black rounded-full shadow-md transition-all"
          aria-label="Zoom In"
        >
          +
        </button>

        <button
          onClick={() => networkManager.resetPosition()}
          className="p-3 bg-gray-200 hover:bg-gray-300 text-black rounded-full shadow-md transition-all"
          aria-label="Reset Position"
        >
          O
        </button>

        <button
          onClick={() => networkManager.zoomOut()}
          className="p-3 bg-gray-200 hover:bg-gray-300 text-black rounded-full shadow-md transition-all"
          aria-label="Zoom Out"
        >
          -
        </button>
      </div>

      {/* Modals */}
      {isKnockListModalOpen && (
        <KnockListModal
          knocks={knocks}
          onClose={() => setIsKnockListModalOpen(false)}
          isOpen={isKnockListModalOpen}
          addRoommate={networkManager.addRoommate}
          loggedInUserInfo={loggedInUserInfo}
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
        <CastModal
          isOpen={isCreateCastModalOpen}
          onClose={() => setIsCreateCastModalOpen(false)}
          roommatesInfo={networkManager.getRoommatesBreifData()}
          neighborsInfo={networkManager.getNeighborsBreifData()}
        />
      )}
    </div>
  );
}
