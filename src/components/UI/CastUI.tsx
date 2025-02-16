import React, { useEffect, useState } from 'react';
import { AiFillMessage, AiOutlineMessage } from "react-icons/ai";

interface CastUIProps {
  position: { x: number; y: number } | null;
  userId?: string;
  scale: number;
}

const CastUI: React.FC<CastUIProps> = ({ position, userId, scale }) => {

  const [onRead, setOnRead] = useState<boolean>(false);
  const [scaledPosition, setScaledPosition] = useState<{ x: number; y: number } | null>(null);
  
  useEffect(() => {
    if (!position) return;
    const { x, y } = position;
    setScaledPosition({ x: x + scale, y: y - scale });
  }, [position, scale]);
  
  if (!position) return null;
  

  return (
    <div
      id={`cast-${userId}`}
      className={`absolute left-${position.x} top-${position.y} w-10 h-10`}
      style={{
      left: `${position.x + 10*scale}px`,
      top: `${position.y - 40*scale}px`,
      width: `${scale * 100}px`,
      height: `${scale * 30}px`,
      }}
    >

      {onRead === false && (
      <AiFillMessage
        className={`cursor-pointer ${
          onRead ? 'opacity-50' : 'animate-bounce'
        }`}
        onClick={() => {setOnRead(true)}}
        size={scale*20} // 아이콘 크기 설정
      />)}
      {onRead === true && (
      <div 
        className="flex justify-center items-center cursor-pointer "
        onClick={() => {setOnRead(false) }}
      >
        <AiOutlineMessage
          className={`${
            onRead ? 'opacity-50' : 'animate-bounce'
          }`}
          
          size={scale*20} // 아이콘 크기 설정
        />
        <p>text example</p>
      </div>
      )}
    </div>
  );
};

export default CastUI;
