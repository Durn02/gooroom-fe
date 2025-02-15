// components/ContextMenu.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { MY_NODE_MENU_ITEMS } from '@/src/constants/contextMenuItems';
interface ContextMenuProps {
  items: [string, () => void][];
  position: { x: number; y: number } | null;
  onClose: () => void;
  userId?: string;
  onViewKnockList: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ items, position, onClose, userId, onViewKnockList }) => {
  const router_in_component = useRouter();

  if (!position) return null;

  const handleItemClick = (item: [string, (...args) => void]) => {
    const [itemName, itemFunction] = item;
    if (itemName === MY_NODE_MENU_ITEMS[1][0]) {
      // MY_NODE_MENU_ITEMS[1][0] is 'view knock list'
      onViewKnockList();
    } else {
      itemFunction(userId, router_in_component);
    }
    onClose();
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
