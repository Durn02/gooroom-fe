// components/ContextMenu.tsx
import React from 'react';
// import { useRouter } from 'next/navigation';
// import { encrypt } from '@/src/utils/crypto';

interface ContextMenuProps {
  items: [string, () => void][];
  position: { x: number; y: number } | null;
  onClose: () => void;
  userId?: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ items, position, onClose, userId }) => {
  // const router = useRouter();
  if (!position) return null;

  // const handleItemClick = (item: string) => {
  //   switch (item) {
  //     case 'view my profile':
  //       router.push('/myprofile');
  //       break;
  //     case 'view roommate profile':
  //       const encryptedUserId = encrypt(userId);
  //       router.push(`/roommateprofile/${encodeURIComponent(encryptedUserId)}`);
  //       break;
  //     case 'view neighbor profile':
  //       const encryptedNeighborId = encrypt(userId);
  //       router.push(`/neighborprofile/${encodeURIComponent(encryptedNeighborId)}`);
  //       break;
  //   }

  //   onClose();
  // };

  const handleItemClick = (item: [string, (string) => void]) => {
    const [, itemFunction] = item;

    // Execute the associated function
    itemFunction(userId);

    // Additional routing logic if needed
    // switch (itemName) {
    //   case 'view my profile':
    //     router.push('/myprofile');
    //     break;
    //   case 'view roommate profile':
    //     const encryptedUserId = encrypt(userId);
    //     router.push(`/roommateprofile/${encodeURIComponent(encryptedUserId)}`);
    //     break;
    //   case 'view neighbor profile':
    //     const encryptedNeighborId = encrypt(userId);
    //     router.push(`/neighborprofile/${encodeURIComponent(encryptedNeighborId)}`);
    //     break;
    // }

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
