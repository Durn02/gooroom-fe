'use client';

import { useState, useEffect } from 'react';
import { UserProfileContext } from './UserProfileContext';

export default function UserProfileProvider({ children }: React.PropsWithChildren) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedUserId) {
      localStorage.setItem('selectedUserId', selectedUserId);
    }
  }, [selectedUserId]);

  const value = {
    selectedUserId,
    setSelectedUserId,
  };

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}
