'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import loading_circle from '@/src/assets/gif/loading_circle.gif';
import { stickerApi } from '@/src/lib/api';
interface CreateStickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const CreateStickerModal: React.FC<CreateStickerModalProps> = ({ isOpen, onClose, userId }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const handleCreateImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newImages = Array.from(e.target.files || []);
    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const handleDeleteImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleCreateSticker = async () => {
    try {
      if (!userId) {
        alert('로그인 시간이 만료되었습니다.');
        router.push('/');
        throw new Error('User not found');
      }

      setLoading(true);

      const formData = new FormData();
      formData.append('content', content);
      images.forEach((file) => {
        formData.append('images', file);
      });

      await stickerApi.createSticker(formData);

      alert('스티커가 작성되었습니다.');
      setContent('');
      setImages([]);
      onClose();
    } catch (error) {
      console.error('Error creating sticker:', error);
      alert('스티커 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

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
            <Image src={loading_circle} alt="Loading" width={50} height={50} />
          </div>
        )}

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
        <div className="flex justify-between items-center mb-4 pr-2.5">
          <h2 className="text-2xl font-bold">Create Sticker</h2>
          <button
            onClick={handleCreateSticker}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2.5"
          >
            스티커 작성
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 h-full">
          <div className="w-full md:w-1/2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleCreateImage}
              className="w-full mb-4 p-2 border rounded"
            />
            {images.length > 0 && (
              <div className="mb-4">
                <p>Selected images:</p>
                <div className="max-w-[360px] max-h-[calc(70vh-200px)] overflow-x-auto overflow-y-auto">
                  <div className="flex flex-wrap gap-4 mt-2 w-full">
                    {images.map((image, index) => (
                      <div key={index} className="relative w-[calc(50%-8px)] aspect-square flex-shrink-0 group">
                        <Image
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index}`}
                          width={160}
                          height={160}
                          className="w-full h-full object-cover rounded-md"
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
          <div className="w-full h-[27rem] md:w-1/2 flex flex-col">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Sticker content"
              className="w-full h-full p-2 border rounded resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStickerModal;
