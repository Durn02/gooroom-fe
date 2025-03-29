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


  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const options = { year: "numeric", month: "2-digit", day: "2-digit", hour: "numeric", minute: "2-digit", hour12: true };
    return date.toLocaleString("en-US", options).replace(",", "");
  };

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
          <AiOutlineMessage
            className="cursor-pointer text-neutral-800 w-full h-full"
            onClick={() => setOnRead(true)}
          />
          {contentCount > 1 && (
            <span className="absolute top-1/3 right-0 text-sm font-bold text-red-500 bg-white rounded-full px-2 py-1 shadow">
              {contentCount}
            </span>
          )}
        </div>
      )}
      {onRead && (
      <div
        className="relative w-[200%] left-2 bg-white text-gray-800 rounded-2xl shadow-lg p-4 border border-gray-200 cursor-pointer"
        onClick={() => setOnRead(false)}
        style={{ width: `${size * 6}px` }}
      >
        
        {content.map((item, index) => (
          <div
            key={index}
            className="text-sm hover:opacity-80 text-gray-800 mb-2 last:mb-0 flex flex-col"
          >
            <p>{item.message}</p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(item.createdAt)}
            </p>
          </div>
        ))}
      </div>
    )}
    </div>
  );
};

export default CastUI;