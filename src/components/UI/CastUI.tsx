import React, { useEffect, useState } from 'react';
import { AiFillMessage } from 'react-icons/ai';
import { getCastReplies } from '@/src/lib/api/cast.api';
import { GetCastRepliesResponse } from '@/src/types/request/cast.type';

interface CastUIProps {
  position: { x: number; y: number } | null;
  userId?: string;
  scale: number;
  content: { node_id: string; message: string; duration: number; created_at: string }[];
  size: number;
  contentCount: number;
}

const CastUI: React.FC<CastUIProps> = ({ position, userId, scale, content, size, contentCount }) => {
  const [onRead, setOnRead] = useState<boolean>(false);
  const [scaled, setScaled] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [replies, setReplies] = useState<GetCastRepliesResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!selectedNodeId) return;

    getCastReplies({ cast_node_id: selectedNodeId }).then((replies) => {
      setReplies(replies);
      setIsModalOpen(true);
    });
  }, [selectedNodeId]);

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
    console.log(scale);
  }, [position, scale, size]);

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
        <div className="relative w-full h-full animate-bounce">
          <AiFillMessage className="cursor-pointer text-blue-500 w-full h-full" onClick={() => setOnRead(true)} />
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
          {/* {content.map((item, index) => (
            <div key={index} className="text-sm text-gray-800 mb-1 last:mb-0 flex items-start">
              <span className="mr-1">•</span>
              <p>{item.message}</p>
              <p>{item.created_at}</p>
            </div>
          ))} */}
          {content.map((item, index) => (
            <div
              key={index}
              className="text-sm text-gray-800 mb-1 last:mb-0 flex flex-col items-start cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNodeId(item.node_id);
              }}
            >
              <div className="flex items-start">
                <span className="mr-1">•</span>
                <p>{item.message}</p>
              </div>
              <p className="text-xs text-gray-500">{item.created_at}</p>
            </div>
          ))}
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-2">Replies</h2>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <div className="overflow-y-auto max-h-60">
              {replies.length === 0 ? (
                <p className="text-gray-500">No replies yet.</p>
              ) : (
                replies.map((res, i) => (
                  <div key={i} className="border-b py-2">
                    <p className="text-sm font-semibold">{res.replier.nickname}</p>
                    <p className="text-sm">{res.reply.content}</p>
                    <p className="text-xs text-gray-400">{res.reply.created_at}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CastUI;
