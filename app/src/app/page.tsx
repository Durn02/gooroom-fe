'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DefaultButton from '@/src/components/Button/DefaultButton';
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
import { useResizeSection } from '@/src/hooks/useResizeSection';

interface MySelectionProps {
  onClose: () => void;
  width: number;
  handleMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const MySelection: React.FC<MySelectionProps> = ({ onClose, width, handleMouseDown }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div
      className="h-full bg-white shadow-lg p-4 flex flex-col relative overflow-auto group"
      style={{ width: `${width}vw` }}
    >
      {/* Close Button with SVG */}
      <button
        onClick={onClose}
        className="self-end text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-8 h-8" // 크기 조정
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 19.5L15.75 12L8.25 4.5" />
        </svg>
      </button>

      <h2 className="text-xl font-bold mb-4">My Selection</h2>
      <input
        type="text"
        placeholder="Enter something..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <DefaultButton
        placeholder="Sign Out"
        onClick={() => userApi.onSignoutButtonClickHandler()}
        className="bg-red-500 hover:bg-red-600 text-gray-500 w-full py-2 rounded-lg"
      />
      {/* Resize Handle - 왼쪽에 배치 */}
      <div
        className="absolute top-0 left-0 w-1 h-full bg-transparent hover:bg-gray-300 cursor-ew-resize z-10"
        onMouseDown={handleMouseDown}
      ></div>
    </div>
  );
};
export default function Landing() {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
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

  const { width, handleMouseDown } = useResizeSection({
    minWidth: 20,
    maxWidth: 50,
    initialWidth: 30,
    sectionSide: 'right',
  });

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md py-3 px-6 flex justify-between items-center">
        <h1
          className="text-2xl font-bold text-gray-800 cursor-pointer select-none"
          onClick={() => window.location.reload()}
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

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full z-20 transform transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <MySelection onClose={() => setIsSidebarOpen(false)} width={width} handleMouseDown={handleMouseDown} />
      </div>

      {/* Main Content */}
      <main className="flex-grow flex">
        {/* Network Container */}
        <div className="flex-grow bg-white border border-gray-300 shadow-lg overflow-hidden">
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
                  contentCount={content.length}
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
