// components/ContextMenu.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
// import { encrypt } from '@/src/utils/crypto';

interface ContextMenuProps {
  items: [string, () => void][];
  position: { x: number; y: number } | null;

  userId?: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ items, position, userId }) => {
  const router_in_component = useRouter();
  if (!position) return null;

  const handleItemClick = (item: [string, (userId: string, router: ReturnType<typeof useRouter>) => void]) => {
    const [, itemFunction] = item;
    itemFunction(userId, router_in_component);
  };

  return (
    <div
      id="context-menu"
      className="absolute bg-white border border-gray-300 shadow-md rounded-md overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          onClick={() => handleItemClick(item)}
          className="cursor-pointer px-4 py-2 hover:bg-gray-100 transition-colors duration-200 ease-in-out"
        >
          {item[0]}
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;
