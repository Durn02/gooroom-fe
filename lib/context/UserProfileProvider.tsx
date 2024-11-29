'use client';

import { useState } from 'react';
import { UserProfileContext } from './UserProfileContext';

export default function UserProfileProvider({ children }: React.PropsWithChildren) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const value = {
    selectedUserId,
    setSelectedUserId,
  };

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}
