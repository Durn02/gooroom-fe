'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import userImage from '../../lib/assets/images/user.png';
import { Sticker, Post, FriendInfo } from '@/src/types/profilePage.type';
import StickerModal from '@/src/components/Modals/StickerModal/StickerModal';
import PostModal from '@/src/components/Modals/PostModal/PostModal';
import { useResizeSection } from '@/src/hooks/useResizeSection';
import { fetchFriendInfo } from '@/src/lib/api/fetchData';
import { decrypt } from '@/src/utils/crypto';

type Props = {
  params: {
    encryptedUserId: string;
  };
};

export default function NeighborProfile({ params }: Props) {
  const selectedUserId = decrypt(decodeURIComponent(params.encryptedUserId));
  const [friendInfo, setFriendInfo] = useState<FriendInfo | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const { width, handleMouseDown } = useResizeSection({
    minWidth: 10,
    maxWidth: 80,
    initialWidth: 30,
  });
  const [isStickerModalOpen, setIsStickerModalOpen] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    fetchFriendInfo(selectedUserId).then((data) => {
      setFriendInfo(data.friend);
      setStickers(data.stickers);
      setPosts(data.posts);
    });
  }, [selectedUserId]);

  const handleStickerDoubleClick = (selected_sticker: Sticker) => {
    setSelectedSticker(selected_sticker);
    setIsStickerModalOpen(true);
  };
  const handlePostDoubleClick = (selected_post: Post) => {
    setSelectedPost(selected_post);
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

      {/*User Info */}
      <>
        <div className="relative bg-white shadow-md overflow-auto group" style={{ width: `${width}vw` }}>
          <div className="p-8">
            {friendInfo && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h1 className="text-3xl font-bold">@{friendInfo.nickname}</h1>
                </div>
                <Image src={userImage} alt="User profile" width={100} height={100} className="rounded-full" />
                <p className="text-gray-600 mb-2 font-bold">{friendInfo.username}</p>
                {friendInfo.my_memo && (
                  <p className="mb-4 text-gray-700 whitespace-pre-wrap border border-gray-400 rounded p-4">
                    {friendInfo.my_memo}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {friendInfo.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
          <div
            className="absolute top-0 right-0 w-1 h-full bg-transparent group-hover:bg-gray-300 cursor-ew-resize"
            onMouseDown={handleMouseDown}
          ></div>
        </div>
      </>

      {/* Right side - Stickers and Posts */}
      <div className="p-8 overflow-y-auto" style={{ width: `${100 - width}vw` }}>
        {/* Stickers */}
        <>
          <div className="flex justify-between items-center mb-4 mt-12">
            <h2 className="text-2xl font-bold text-gray-800">Stickers</h2>
          </div>
          <div className="overflow-x-auto whitespace-nowrap mb-8 pb-4">
            <div className="inline-flex space-x-4">
              {stickers.map((sticker) => (
                <div
                  key={sticker.sticker_node_id}
                  className="inline-block bg-white border rounded-lg p-4 w-64 shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg group"
                  onDoubleClick={() => {
                    handleStickerDoubleClick(sticker);
                  }}
                >
                  <div className="transform transition-transform duration-300 ease-in-out group-hover:scale-105">
                    <div>
                      <div className="relative">
                        <p className="font-semibold mb-2 text-gray-800 max-w-48 truncate overflow-hidden">
                          {sticker.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sticker.image_url.slice(0, 1).map((url, index) => (
                        <Image
                          key={index}
                          alt={`Sticker ${index + 1}`}
                          className="object-cover rounded shadow"
                          src={url}
                          width={100}
                          height={100}
                        />
                      ))}
                      {sticker.image_url.length > 1 && (
                        <div className="w-[50px] h-[50px] flex items-center justify-center bg-gray-200 rounded shadow">
                          +{sticker.image_url.length - 1}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{new Date(sticker.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>

        {/* Posts */}
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Posts</h2>
          </div>
          <div className="space-y-6">
            {posts.map((post) => {
              return (
                <div
                  key={post.post_node_id}
                  className="bg-white border rounded-lg shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg group relative"
                  onDoubleClick={() => {
                    handlePostDoubleClick(post);
                  }}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 pr-8">{post.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.image_url.map((url, index) => (
                        <Image
                          key={index}
                          src={url}
                          alt={`Post ${index + 1}`}
                          className="object-cover rounded shadow"
                          width={100}
                          height={100}
                        />
                      ))}
                    </div>
                    <p className="mb-4 text-gray-700">{post.content}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {post.tags
                        ? post.tags.map((tag, index) => (
                            <span key={index} className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm">
                              {tag}
                            </span>
                          ))
                        : null}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      </div>

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
