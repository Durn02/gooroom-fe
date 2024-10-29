'use client';

import React, { useMemo } from 'react';
import { IsLoginContext } from './IsLoginContext';
import useTabSharedState from '../hooks/tabShared';

const KEY_FOR_USERID = 'userId';
const KEY_FOR_ACCESS_TOKEN = 'access_token';
const KEY_FOR_IS_LOGIN = 'islogin';

export default function IsLoginProvider({ children }: React.PropsWithChildren) {
  const [userId, setUserId] = useTabSharedState<string | null>(KEY_FOR_USERID, null);
  const [accessToken, setAccessToken] = useTabSharedState<string | null>(KEY_FOR_ACCESS_TOKEN, null);

  const value = useMemo(
    () => ({
      isLogin: userId === null && accessToken === null ? false : true,
      userId,
      setUserId,
      accessToken,
      setAccessToken,
    }),
    [],
  );

  return <IsLoginContext.Provider value={value}>{children}</IsLoginContext.Provider>;
}
