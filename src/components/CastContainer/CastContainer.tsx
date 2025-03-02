import React from 'react';
import CastUI from '../UI/CastUI';
import { useState } from 'react';

interface CastData {
  userId: string;
  position: { x: number; y: number } | null;
  size: number;
  content: { message: string; duration: number; createdAt: string }[];
}

interface CastContainerProps {
  castData: Record<string, CastData>;
  scale: number;
}

const CastContainer: React.FC<CastContainerProps> = ({ castData, scale }) => {
  if (!castData || Object.keys(castData).length === 0) return null;
  console.log(castData, "in Castcont");

  return (
    <div className="w-full h-full">
      {Object.values(castData).map(({ userId, position, size, content }) => {
        if (!position) return null;
        const { x, y } = position;
        // 첫 번째 메시지만 표시하거나, content를 CastUI로 전달
        return (
          <CastUI
            key={userId}
            position={{ x, y }}
            content={content} // 첫 번째 메시지 사용 (필요 시 수정)
            userId={userId}
            scale={scale}
            size={size}
            contentCount={content.length} // content 개수 전달
          />
        );
      })}
    </div>
  );
};

export default CastContainer;
