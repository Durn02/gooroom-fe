'use client';

import { createContext } from 'react';

type IsLoginContextType = {
  isLogin: boolean;
  userId: string | null;
  login: (id: string) => void;
  logout: () => void;
};

export const IsLoginContext = createContext<IsLoginContextType>({
  isLogin: false,
  userId: null,
  login: () => undefined,
  logout: () => undefined,
});
