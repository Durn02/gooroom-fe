'use client';
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { API_URL } from '@/lib/utils/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import Image from 'next/image';
import { UserProfileContext } from '@/lib/context/UserProfileContext';
import { useRouter } from 'next/navigation';

// S3 configuration
const Bucket = process.env.NEXT_PUBLIC_AMPLIFY_BUCKET;
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY as string,
  },
});

interface StickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchStickers: () => void;
}

const StickerModal: React.FC<StickerModalProps> = ({ isOpen, onClose, fetchStickers }) => {
  const { selectedUserId } = useContext(UserProfileContext);
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
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

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newImages = Array.from(e.target.files || []);
    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const handleImageDelete = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const uploadToS3 = async (file: File, imageIndex: number): Promise<string> => {
    try {
      const currentTime = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
      const fileName = `${selectedUserId}/sticker/${currentTime}/${imageIndex}_${file.name}`;
      if (!selectedUserId) {
        alert('로그인 시간이 만료되었습니다.');
        router.push('/');
        throw new Error('User not found');
      }
      const command = new PutObjectCommand({
        Bucket: Bucket,
        Key: fileName,
        Body: (await file.arrayBuffer()) as Buffer,
        ContentType: file.type,
      });
      await s3Client.send(command);
      return `https://${Bucket}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw new Error('Failed to upload image to S3');
    }
  };
  const handleCreateSticker = async () => {
    try {
      const uploadedUrls = await Promise.all(images.map((file, index) => uploadToS3(file, index)));
      const stickerData = {
        content: content,
        image_url: uploadedUrls,
      };

      const result = await fetch(`${API_URL}/domain/content/sticker/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(stickerData),
      });

      if (!result.ok) {
        throw new Error('Failed to create sticker');
      }

      alert('스티커가 작성되었습니다.');
      setContent('');
      setImages([]);
      fetchStickers();
      onClose();
    } catch (error) {
      console.error('Error creating sticker:', error);
      alert('스티커 작성에 실패했습니다.');
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
      <div className="bg-white rounded-lg p-6 w-96 overflow-y-auto max-h-[70vh] max-w-full relative">
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
        <h2 className="text-2xl font-bold mb-4">Create Sticker</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Sticker content"
          className="w-full mb-4 p-2 border rounded resize-none"
          rows={2}
        />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="w-full mb-4 p-2 border rounded"
        />
        {images.length > 0 && (
          <div className="mb-4">
            <p>Selected images:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <Image
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index}`}
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <button
                    onClick={() => handleImageDelete(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    X
                  </button>
                  <p className="text-xs mt-1 text-center truncate w-24">{image.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={handleCreateSticker}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          스티커 작성
        </button>
      </div>
    </div>
  );
};
export default StickerModal;
