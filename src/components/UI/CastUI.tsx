import React, { useEffect, useState } from 'react';
import { AiFillMessage, AiOutlineMessage } from "react-icons/ai";

interface CastUIProps {
  position: { x: number; y: number } | null;
  userId?: string;
  scale: number;
  content: { message: string; duration: number; createdAt: string }[];
  size: number;
  contentCount: number;
}

const CastUI: React.FC<CastUIProps> = ({ position, userId, scale, content, size, contentCount }) => {
  const [onRead, setOnRead] = useState<boolean>(false);
  const [scaled, setScaled] = useState<{ x: number; y: number, width: number, height: number } | null>(null);

  useEffect(() => {
    if (!position) return;
    const { x, y } = position;
    const newscaled = {
      x: x + scale * 10 + size * 0.125,
      y: y - Math.min(scale * 60, 200) - size * 0.25,
      width : scale * 60 + size * 0.1,
      height : scale * 60 + size * 0.1,
    };
    setScaled(newscaled);
    console.log(scale);
  }, [position, scale, size]);

  // 디버깅 로그

  if (!position || !scaled) {
    return null;
  }



  return (
    <div
      id={`cast-${userId}`}
      className="absolute"
      style={{
        left: `${scaled.x}px`,
        top: `${scaled.y}px`,
        width: `${scaled.width}px`,
        height: `${scaled.height}px`,
      }}
    >
      {onRead === false && (
        <div className="relative w-full h-full animate-bounce" >
          <AiFillMessage
            className="cursor-pointer text-blue-500 w-full h-full"
            onClick={() => setOnRead(true)}
          />
          {contentCount > 1 && (
            <span className="absolute top-1/3 right-0 text-sm font-bold text-red-500 bg-white rounded-full px-2 py-1 shadow">
              {contentCount}
            </span>
          )}
        </div>
      )}
      {onRead === true && (
        <div
          className="flex flex-col items-start cursor-pointer bg-white rounded-lg shadow-lg p-2 border border-gray-200 max-h-40"
          onClick={() => setOnRead(false)}
          style={{ width: `${size * 6}px` }}
        >
          {content.map((item, index) => (
            <div
              key={index}
              className="text-sm text-gray-800 mb-1 last:mb-0 flex items-start"
            >
              <span className="mr-1">•</span>
              <p>{item.message}</p>
              <p>{item.createdAt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CastUI;