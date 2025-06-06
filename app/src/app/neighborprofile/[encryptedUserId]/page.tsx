'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import userImage from '@/src/assets/images/user.png';
import { Sticker, Post, FriendInfo } from '@/src/types/DomainObject/profilePage.type';
import StickerModal from '@/src/components/Modals/StickerModal/StickerModal';
import PostModal from '@/src/components/Modals/PostModal/PostModal';
import { useResizeSection } from '@/src/hooks/useResizeSection';
import { friendApi } from '@/src/lib/api';
import { decrypt } from '@/src/utils/crypto';

type Props = {
  params: Promise<{ encryptedUserId: string }>;
};

export default function RoommateProfile({ params }: Props) {
  const { encryptedUserId } = use(params);
  const selectedUserId = decrypt(decodeURIComponent(encryptedUserId));
  const [friendInfo, setFriendInfo] = useState<FriendInfo | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const { width, handleMouseDown } = useResizeSection({
    minWidth: 10,
    maxWidth: 80,
    initialWidth: 30,
    sectionSide: 'left',
  });
  const [isStickerModalOpen, setIsStickerModalOpen] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    friendApi.fetchFriendInfo({ userNodeId: selectedUserId }).then((data) => {
      setFriendInfo(data.friend);
      setStickers(data.stickers);
      setPosts(data.posts);
    });
  }, [selectedUserId]);

  const handleStickerDoubleClick = (selectedSticker: Sticker) => {
    setSelectedSticker(selectedSticker);
    setIsStickerModalOpen(true);
  };
  const handlePostDoubleClick = (selectedPost: Post) => {
    setSelectedPost(selectedPost);
    setIsPostModalOpen(true);
  };

  const gohomeButtonHandler = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Home Button */}
      <button
        onClick={gohomeButtonHandler}
        className="fixed top-4 right-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
      >
        홈으로
      </button>

      {/* 좌측 프로필 */}
      <aside
        className="relative bg-white shadow-md flex flex-col items-left p-8 min-w-[300px]"
        style={{ width: `${width}vw`, maxWidth: '80vw' }}
      >
        <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-blue-100 shadow mb-4 bg-gray-100 flex items-center justify-center">
          <Image
            src={friendInfo?.profileImageUrl || userImage}
            alt="프로필"
            width={120}
            height={120}
            className="object-cover w-full h-full"
            priority
          />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl font-bold text-gray-800">@{friendInfo?.nickname}</span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-gray-600 font-semibold">{friendInfo?.username}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {friendInfo?.tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="10" />
              </svg>
              {tag}
            </span>
          ))}
        </div>
        {/* 리사이즈 핸들 */}
        <div
          className="absolute top-0 right-0 w-2 h-full bg-transparent hover:bg-gray-200 cursor-ew-resize z-10"
          onMouseDown={handleMouseDown}
        ></div>
      </aside>

      {/* 오른쪽 - Stickers and Posts */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Stickers */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Stickers</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stickers.map((sticker) => (
              <div
                key={sticker.stickerNodeId}
                className="bg-white border rounded-lg p-4 w-64 shadow hover:shadow-lg transition cursor-pointer"
                onDoubleClick={() => handleStickerDoubleClick(sticker)}
              >
                <div className="font-semibold mb-2 text-gray-800 truncate">{sticker.content}</div>
                <div className="flex gap-2 mb-2">
                  {sticker.imageUrl.slice(0, 1).map((url, i) => (
                    <Image key={i} src={url} alt="" className="rounded shadow" width={60} height={60} />
                  ))}
                  {sticker.imageUrl.length > 1 && (
                    <span className="bg-gray-200 rounded px-2 py-1 text-xs text-gray-700">
                      +{sticker.imageUrl.length - 1}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400">{new Date(sticker.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </section>
        {/* Posts */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Posts</h2>
          </div>
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.postNodeId}
                className="bg-white border rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                onDoubleClick={() => handlePostDoubleClick(post)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{post.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4 max-w-full" style={{ overflowX: 'auto' }}>
                    {post.imageUrl.map((url, i) => (
                      <Image
                        key={i}
                        src={url}
                        alt=""
                        className="rounded shadow"
                        width={80}
                        height={80}
                        style={{ flexShrink: 0 }}
                      />
                    ))}
                  </div>
                  <div className="mb-2 text-gray-700">{post.content}</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.tags?.map((tag, idx) => (
                      <span key={idx} className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString('ko-KR')}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <StickerModal
        isOpen={isStickerModalOpen}
        onClose={() => {
          setIsStickerModalOpen(false);
        }}
        sticker={selectedSticker}
      />
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
        }}
        post={selectedPost}
      />
    </div>
  );
}
