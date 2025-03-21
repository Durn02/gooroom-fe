'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { IsLoginContext } from './IsLoginContext';

export default function IsLoginProvider({ children }: React.PropsWithChildren) {
  const [userId, setUserId] = useState<string | null>(null);

  const login = useCallback(
    (id: string) => {
      setUserId(id);
    },
    [setUserId],
  );

  const logout = useCallback(() => {
    setUserId(null);
  }, [setUserId]);

  const value = useMemo(
    () => ({
      isLogin: userId !== null,
      userId,
      login,
      logout,
    }),
    [userId, login, logout],
  );

  return <IsLoginContext.Provider value={value}>{children}</IsLoginContext.Provider>;
}
