import React from 'react';
import CastUI from '../UI/CastUI';
import { useState } from 'react';


interface CastContainerProps {
  castStatus: Record<string, { x: number; y: number }>;
  scale: number;
}

const CastContainer: React.FC<CastContainerProps> = ({ castStatus, scale }) => {
  if (!castStatus || Object.keys(castStatus).length === 0) return null;

  
  return (
    <div className="w-full h-full">
      {Object.entries(castStatus).map(([userId, { x, y }], index) => (
        <CastUI
          key={userId || index}
          position={{ x, y }}
          userId={userId}
          scale={scale}
        />
      ))}
    </div>
  );
};

export default CastContainer;
