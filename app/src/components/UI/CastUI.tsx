import React, { useEffect, useState } from 'react';
import { AiFillMessage } from 'react-icons/ai';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

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
  const [scaled, setScaled] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (!position) return;
    const { x, y } = position;
    const newscaled = {
      x: x + scale * 10 + size * 0.125,
      y: y - Math.min(scale * 60, 200) - size * 0.25,
      width: scale * 60 + size * 0.1,
      height: scale * 60 + size * 0.1,
    };
    setScaled(newscaled);
  }, [position, scale, size]);

  if (!position || !scaled) return null;

  return (
    <div
      id={`cast-${userId}`}
      className="absolute"
      style={{
        left: `${scaled.x}px`,
        top: `${scaled.y}px`,
        width: `${scaled.width}px`,
        height: `${scaled.height}px`,
        zIndex: 30,
      }}
    >
      {!onRead && (
        <div className="relative w-full h-full animate-bounce">
          <AiFillMessage
            className="cursor-pointer text-blue-500 w-full h-full drop-shadow"
            onClick={() => setOnRead(true)}
            title="Cast 메시지 보기"
          />
          {contentCount > 1 && (
            <span className="absolute -top-2 -right-2 text-xs font-bold text-white bg-red-500 rounded-full px-2 py-0.5 shadow">
              {contentCount}
            </span>
          )}
        </div>
      )}
      {onRead && (
        <div
          className="flex flex-col items-stretch cursor-pointer bg-white rounded-lg shadow-xl border border-gray-200 p-3 max-h-56 min-w-[180px] max-w-xs overflow-y-auto transition-all duration-200"
          onClick={() => setOnRead(false)}
          style={{ width: `${Math.max(size * 6, 180)}px` }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-blue-600">메시지</span>
            <button
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded"
              onClick={(e) => {
                e.stopPropagation();
                setOnRead(false);
              }}
              title="닫기"
            >
              ✕
            </button>
          </div>
          {content
            .slice()
            .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
            .map((item, idx) => (
              <div key={idx} className="mb-2 last:mb-0 border-b last:border-b-0 border-gray-100 pb-2 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-400 text-xs">•</span>
                  <span className="font-medium text-gray-800 text-sm">{item.message}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{dayjs(item.createdAt).fromNow()}</span>
                  <span>{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}</span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default CastUI;
