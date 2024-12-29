'use client';

import { createContext } from 'react';

type IsLoginContext = {
  isLogin: boolean;
  accessToken: string;
  setAccessToken: SetState<string | null>;
  userId: string | null;
  setUserId: SetState<string | null>;
};

export const IsLoginContext = createContext<IsLoginContext>({
  isLogin: false,
  accessToken: '',
  setAccessToken: () => undefined,
  userId: '',
  setUserId: () => undefined,
});
