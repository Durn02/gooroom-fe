'use client';

import { useEffect, useState, useCallback } from 'react';
import { API_URL } from '@/lib/utils/config';
import Image from 'next/image';
import userImage from '../../lib/assets/images/user.png';
import ProfileModal from '@/components/Modals/ProfileModal/ProfileModal';
import { UserInfo, Sticker, Post } from '@/lib/types/myprofilePage.type';
import StickerModal from '@/components/Modals/StickerModal/StickerModal';
import PostModal from '@/components/Modals/PostModal/PostModal';
import CreateStickerModal from '@/components/Modals/CreateStickerModal/CreateStickerModal';
import CreatePostModal from '@/components/Modals/CreatePostModal/CreatePostModal';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

export default function MyProfile() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isResizing, setIsResizing] = useState(false);
  const [initialX, setInitialX] = useState(0);
  const [width, setWidth] = useState(30);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isStickerModalOpen, setIsStickerModalOpen] = useState(false);
  const [isCreateStickerModalOpen, setIsCreateStickerModalOpen] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    fetchUserInfo();
    fetchStickers();
    fetchPosts();
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setInitialX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        requestAnimationFrame(() => {
          const newWidth = width + ((e.clientX - initialX) / window.innerWidth) * 100;
          if (newWidth >= 10 && newWidth <= 80) {
            setWidth(newWidth);
          }
          setInitialX(e.clientX);
        });
      }
    },
    [isResizing, initialX, width],
  );

  const handleStickerDoubleClick = (selected_sticker: Sticker) => {
    event.preventDefault();
    setSelectedSticker(selected_sticker);
    setIsStickerModalOpen(true);
  };
  const handlePostDoubleClick = (selected_post: Post) => {
    event.preventDefault();
    setSelectedPost(selected_post);
    setIsPostModalOpen(true);
  };

  const gohomeButtonHandler = () => {
    window.location.href = '/';
  };
  const s3Client = new S3Client({
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY as string,
    },
  });
  const deleteImageFromS3 = async (imageUrl: string) => {
    const key = imageUrl.split('/').slice(3).join('/');
    try {
      const command = new DeleteObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AMPLIFY_BUCKET,
        Key: key,
      });

      const res = await s3Client.send(command);
      console.log(res);
      console.log(`Image ${key} deleted successfully from S3`);
    } catch (error) {
      console.error('Error deleting image from S3:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove]);

  const fetchUserInfo = useCallback(async () => {
    const response = await fetch(`${API_URL}/domain/user/my/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) {
      alert('사용자 정보를 불러오는데 실패했습니다.');
      window.location.href = '/';
      return;
    } else {
      const data = await response.json();
      setUserInfo(data);
    }
  }, []);

  const fetchStickers = useCallback(async () => {
    const response = await fetch(`${API_URL}/domain/content/sticker/get-my-contents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) {
      alert('스티커를 불러오는데 실패했습니다.');
      window.location.href = '/';
    } else {
      const data = await response.json();
      setStickers(data);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    const response = await fetch(`${API_URL}/domain/content/post/get-my-contents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) {
      alert('게시글을 불러오는데 실패했습니다.');
      window.location.href = '/';
    } else {
      const data = await response.json();
      setPosts(data);
    }
  }, []);

  const handleEditProfile = useCallback(() => {
    setIsProfileModalOpen(true);
  }, []);

  const handleCreateSticker = useCallback(async () => {
    setIsCreateStickerModalOpen(true);
  }, []);

  const handleDeleteSticker = async (sticker: Sticker) => {
    const response = window.confirm('스티커를 삭제하시겠습니까?');
    if (!response) {
      return;
    }
    try {
      // S3에서 이미지 삭제
      for (const imageUrl of sticker.image_url) {
        await deleteImageFromS3(imageUrl);
      }
    } catch (error) {
      console.error('Error deleting sticker:', error);
      alert('스티커 삭제 중 오류가 발생했습니다.');
      return;
    }

    const result = await fetch(`${API_URL}/domain/content/sticker/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ sticker_node_id: sticker.sticker_node_id }),
    });
    if (!result.ok) {
      alert('스티커 삭제에 실패했습니다.');
      return;
    } else {
      alert('스티커가 삭제되었습니다.');
      await fetchStickers();
    }
  };

  const handleCreatePost = useCallback(async () => {
    setIsCreatePostModalOpen(true);
  }, []);

  const handleDeletePost = async (posts: Post) => {
    const isDelete = window.confirm('게시글을 삭제하시겠습니까?');
    if (!isDelete) {
      return;
    }

    try {
      // S3에서 이미지 삭제
      for (const imageUrl of posts.image_url) {
        await deleteImageFromS3(imageUrl);
      }

      try {
        const response = await fetch(`${API_URL}/domain/content/post/delete-my-content`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ post_node_id: posts.post_node_id }),
        });
        if (response.ok) {
          setPosts((prevPosts) => prevPosts.filter((post) => post.post_node_id !== posts.post_node_id));
          alert('게시글이 삭제되었습니다.');
        } else {
          alert('게시글 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('게시글 삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error deleting sticker:', error);
      alert('스티커 삭제 중 오류가 발생했습니다.');
      return;
    }
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
            {userInfo && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h1 className="text-3xl font-bold">@{userInfo.nickname}</h1>
                  <button
                    onClick={handleEditProfile}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                  >
                    정보 변경
                  </button>
                </div>
                <Image src={userImage} alt="User profile" width={100} height={100} className="rounded-full" />
                <p className="text-gray-600 mb-2 font-bold">{userInfo.username}</p>
                <p className="mb-4 text-gray-700 whitespace-pre-wrap border border-gray-400 rounded p-4">
                  {userInfo.my_memo}
                </p>
                <div className="flex flex-wrap gap-2">
                  {userInfo.tags.map((tag, index) => (
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
            <button
              onClick={handleCreateSticker}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
            >
              작성하기
            </button>
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
                        <button
                          className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center text-gray-600"
                          onClick={() => handleDeleteSticker(sticker)}
                        >
                          X
                        </button>
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
            <button
              onClick={handleCreatePost}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
            >
              작성하기
            </button>
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
                  <button
                    onClick={() => handleDeletePost(post)}
                    className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-gray-600"
                  >
                    X
                  </button>
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
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          fetchUserInfo();
        }}
        myProfile={userInfo}
      />
      <StickerModal
        isOpen={isStickerModalOpen}
        onClose={() => {
          setIsStickerModalOpen(false);
          fetchStickers();
        }}
        sticker={
          stickers.length > 0 ? selectedSticker : { sticker_node_id: '', content: '', image_url: [], created_at: '' }
        }
      />
      <CreateStickerModal
        isOpen={isCreateStickerModalOpen}
        onClose={() => setIsCreateStickerModalOpen(false)}
        fetchStickers={fetchStickers}
      />
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
          fetchPosts();
        }}
        post={
          posts.length > 0
            ? selectedPost
            : { post_node_id: '', title: '', content: '', image_url: [], tags: [], created_at: '' }
        }
      />
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        fetchPosts={fetchPosts}
      />
    </div>
  );
}
