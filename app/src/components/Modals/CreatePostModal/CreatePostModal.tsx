import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Post } from '@/src/types/DomainObject/profilePage.type';
import loadingCircle from '@/src/assets/gif/loadingCircle.gif';
import { postApi } from '@/src/lib/api';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, userId }) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [postData, setPostData] = useState<Partial<Post>>({
    title: '',
    content: '',
    tags: [],
    imageUrl: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  const handleCreatePost = async () => {
    try {
      if (!userId) {
        alert('로그인 시간이 만료되었습니다.');
        router.push('/');
        throw new Error('User not found');
      }

      if (!postData.title?.trim() || !postData.content?.trim()) {
        alert('제목과 내용을 입력해주세요.');
        return;
      }
      setLoading(true);

      const formData = new FormData();
      formData.append('content', postData.content);
      formData.append('title', postData.title);
      formData.append('tags', JSON.stringify(postData.tags));
      formData.append('isPublic', 'true');
      images.forEach((file) => {
        formData.append('images', file);
      });

      await postApi.createPost(formData);

      alert('게시물이 작성되었습니다.');
      setPostData({ title: '', content: '', tags: [], imageUrl: [] });
      setImages([]);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('게시물 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewTagsKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) {
      return;
    }

    if (event.key === 'Enter' && tagInput.trim()) {
      event.preventDefault();
      if (!postData.tags.includes(tagInput.trim())) {
        setPostData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
        setTagInput('');
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    setPostData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleCreateImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages([...images, ...files]);
  };

  const handleDeleteImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (loading) return;

    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg p-6 overflow-y-auto w-100 max-h-[70vh] min-h-[24rem] max-w-full min-w-[520px] relative">
        {/* Loading Screen */}
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
            <div className="text-white text-lg mb-4">Loading...</div> {/* Added margin-bottom */}
            <Image src={loadingCircle} alt="Loading" width={50} height={50} />
          </div>
        )}

        <div className="bg-white rounded-lg p-6 overflow-y-auto w-100 max-h-[70vh] min-h-[24rem] max-w-[30rem] min-w-[500px] relative">
          <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex justify-between items-center mb-4 w-[28rem] mt-3">
            <h2 className="text-2xl font-bold">Create a new post</h2>
            <button
              onClick={handleCreatePost}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded"
            >
              게시물 작성
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <input
                type="text"
                value={postData.title}
                onChange={(e) => setPostData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="제목을 입력하세요"
                maxLength={100}
              />
            </div>
            <div className="w-full">
              <textarea
                value={postData.content}
                onChange={(e) => setPostData((prev) => ({ ...prev, content: e.target.value }))}
                className="w-full h-[12rem] p-2 border rounded resize-none"
                placeholder="내용을 입력하세요"
                maxLength={2000}
              />
            </div>

            <div className="w-full">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleNewTagsKeyPress}
                className="w-full p-2 border rounded"
                placeholder="태그를 입력하고 Enter를 누르세요"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {postData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 transition-colors duration-200"
                  >
                    <span className="text-gray-700">{tag}</span>
                    <button
                      onClick={() => removeTag(index)}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200 w-4 h-4 flex items-center justify-center"
                      aria-label={`Remove ${tag} tag`}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleCreateImage}
                className="w-full p-2 border rounded"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {images.length > 0 && (
                  <div className="mb-4">
                    <div className="max-w-[360px] max-h-[calc(70vh-200px)] overflow-x-auto overflow-y-auto">
                      <div className="flex flex-wrap gap-4 mt-2 w-full">
                        {images.map((image, index) => (
                          <div key={index} className="relative w-[calc(50%-8px)] aspect-square flex-shrink-0 group">
                            <Image
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index}`}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover rounded"
                            />
                            <button
                              onClick={() => handleDeleteImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              X
                            </button>
                            <p className="text-xs mt-1 text-center truncate w-full">{image.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
