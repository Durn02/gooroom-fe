import React, { useEffect, useState } from 'react';

const NodeComponent = ({ nodeId, uiManager }: { nodeId: string; uiManager: UIManager }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleUpdate = (positions: { [nodeId: string]: { x: number; y: number } }) => {
      if (positions[nodeId]) {
        setPosition(positions[nodeId]);
      }
    };

    uiManager.subscribe(handleUpdate);
    return () => {
      uiManager.unsubscribe(handleUpdate);
    };
  }, [nodeId, uiManager]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '5px',
        border: '1px solid black',
        borderRadius: '4px',
      }}
    >
      Node {nodeId}
    </div>
  );
};

export default NodeComponent;
