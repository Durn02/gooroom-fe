'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import userImage from '@/src/assets/images/user.png';
import ProfileModal from '@/src/components/Modals/ProfileModal/ProfileModal';
import { UserInfo, Sticker, Post } from '@/src/types/DomainObject/profilePage.type';
import StickerModal from '@/src/components/Modals/StickerModal/StickerModal';
import PostModal from '@/src/components/Modals/PostModal/PostModal';
import CreateStickerModal from '@/src/components/Modals/CreateStickerModal/CreateStickerModal';
import CreatePostModal from '@/src/components/Modals/CreatePostModal/CreatePostModal';
import { useResizeSection } from '@/src/hooks/useResizeSection';
import { userApi, postApi, stickerApi } from '@/src/lib/api';
import { useRouter } from 'next/navigation';
import { getGroupsNameAndNumber, modifyMyGroups } from '@/src/lib/api/friend/friend.api';
import { GroupsInfo } from '@/src/types/DomainObject/friend/group.type';

export default function MyProfile() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const { width, handleMouseDown } = useResizeSection({
    minWidth: 10,
    maxWidth: 80,
    initialWidth: 30,
    sectionSide: 'left',
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isStickerModalOpen, setIsStickerModalOpen] = useState(false);
  const [isCreateStickerModalOpen, setIsCreateStickerModalOpen] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [groups, setGroups] = useState<GroupsInfo[]>([{ groupName: '', memberCount: 0 }]);
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.groupName || '');
  const [newGroupName, setNewGroupName] = useState('');

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    if (groups.some((g) => g.groupName === newGroupName.trim())) {
      alert('이미 존재하는 그룹입니다.');
      return;
    }
    try {
      await modifyMyGroups(groups.map((group) => group.groupName).concat(newGroupName.trim()));
      alert('그룹이 추가되었습니다.');
      setGroups([...groups, { groupName: newGroupName.trim(), memberCount: 0 }]);
      setNewGroupName('');
    } catch (error) {
      console.error('그룹 추가 실패:', error);
      alert('그룹 추가에 실패했습니다.');
    }
  };

  useEffect(() => {
    userApi.fetchMyInfo().then(async (data) => {
      setUserInfo(data);

      const groups = await getGroupsNameAndNumber();
      if(groups.length>0){
        setGroups(groups);
        setSelectedGroup(groups[0].groupName);
      } else {
        setGroups([]);
        setSelectedGroup('');
      }
    });

    stickerApi.fetchMyStickers().then((data) => setStickers(data));
    postApi.fetchPosts().then((data) => setPosts(data));
  }, []);

  const handleStickerDoubleClick = (selectedSticker: Sticker) => {
    setSelectedSticker(selectedSticker);
    setIsStickerModalOpen(true);
  };
  const handlePostDoubleClick = (selectedPost: Post) => {
    setSelectedPost(selectedPost);
    setIsPostModalOpen(true);
  };

  const gohomeButtonHandler = () => {
    router.back();
  };

  const handleDeleteSticker = async (sticker: Sticker) => {
    const response = window.confirm('스티커를 삭제하시겠습니까?');
    if (!response) {
      return;
    }

    const result = stickerApi.deleteStickers(sticker.stickerNodeId, sticker.imageUrl);
    if (!result) {
      alert('스티커 삭제에 실패했습니다.');
      return;
    } else {
      alert('스티커가 삭제되었습니다.');
      await stickerApi.fetchMyStickers().then((data) => setStickers(data));
    }
  };

  const handleDeletePost = async (posts: Post) => {
    const isDelete = window.confirm('게시글을 삭제하시겠습니까?');
    if (!isDelete) {
      return;
    }

    try {
      const response = await postApi.deletePost({
        postNodeId: posts.postNodeId,
        postImageUrls: posts.imageUrl,
      });
      if (response.ok) {
        setPosts((prevPosts) => prevPosts.filter((post) => post.postNodeId !== posts.postNodeId));
        alert('게시글이 삭제되었습니다.');
      } else {
        alert('게시글 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
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
                    onClick={() => setIsProfileModalOpen(true)}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                  >
                    정보 변경
                  </button>
                </div>
                <Image
                  src={typeof userInfo.profileImageUrl === 'string' ? userInfo.profileImageUrl : userImage}
                  alt="User profile"
                  width={100}
                  height={100}
                  className="rounded-full object-cover"
                  style={{ width: '100px', height: '100px' }}
                />

                <p className="text-gray-600 mb-2 font-bold">{userInfo.username}</p>
                <p className="mb-4 text-gray-700 whitespace-pre-wrap border border-gray-400 rounded p-4">
                  {userInfo.myMemo}
                </p>
                {/* 그룹 관리 UI */}
                <div className="mb-8">
                  <label className="block text-lg font-semibold mb-2 text-gray-800">나의 그룹</label>
                  <div className="flex items-center gap-2 mb-2">
                    {/* Select 컴포넌트 */}
                    <select
                      className="border border-gray-300 rounded px-3 py-2 flex-1 text-gray-800"
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                    >
                      {groups.length === 0 ? (
                        <option value="">새로운 그룹을 추가하세요</option>
                      ) : (
                        groups.map((group) => (
                          <option key={group.groupName} value={group.groupName}>
                            {group.groupName} ({group.memberCount}명)
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="border border-gray-300 rounded px-3 py-2 flex-1 text-gray-800"
                      type="text"
                      placeholder="새 그룹 이름"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition"
                      onClick={handleAddGroup}
                    >
                      추가
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {userInfo.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm">
                      #{tag}
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
              onClick={() => setIsCreateStickerModalOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
            >
              작성하기
            </button>
          </div>
          <div className="overflow-x-auto whitespace-nowrap mb-8 pb-4">
            <div className="inline-flex space-x-4">
              {stickers.map((sticker) => (
                <div
                  key={sticker.stickerNodeId}
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
                      {sticker.imageUrl.slice(0, 1).map((url, index) => (
                        <Image
                          key={index}
                          alt={`Sticker ${index + 1}`}
                          className="object-cover rounded shadow"
                          src={url}
                          width={100}
                          height={100}
                        />
                      ))}
                      {sticker.imageUrl.length > 1 && (
                        <div className="w-[50px] h-[50px] flex items-center justify-center bg-gray-200 rounded shadow">
                          +{sticker.imageUrl.length - 1}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{new Date(sticker.createdAt).toLocaleDateString()}</p>
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
              onClick={() => setIsCreatePostModalOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
            >
              작성하기
            </button>
          </div>
          <div className="space-y-6">
            {posts.map((post) => {
              return (
                <div
                  key={post.postNodeId}
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
                      {post.imageUrl.map((url, index) => (
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
                      {new Date(post.createdAt).toLocaleDateString('ko-KR', {
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
          userApi.fetchMyInfo().then((data) => setUserInfo(data));
        }}
        myProfile={userInfo}
      />
      <StickerModal
        isOpen={isStickerModalOpen}
        onClose={() => {
          setIsStickerModalOpen(false);
          stickerApi.fetchMyStickers().then((data) => setStickers(data));
        }}
        sticker={selectedSticker}
      />
      {userInfo && (
        <CreateStickerModal
          isOpen={isCreateStickerModalOpen}
          onClose={() => {
            setIsCreateStickerModalOpen(false);
            stickerApi.fetchMyStickers().then((data) => setStickers(data));
          }}
          userId={userInfo.nodeId}
        />
      )}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
          postApi.fetchPosts().then((data) => setPosts(data));
        }}
        post={selectedPost}
      />
      {userInfo && (
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => {
            setIsCreatePostModalOpen(false);
            postApi.fetchPosts().then((data) => setPosts(data));
          }}
          userId={userInfo.nodeId}
        />
      )}
    </div>
  );
}
