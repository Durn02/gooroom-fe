import { useContext } from 'react';
import { IsLoginContext } from '@/lib/context/IsLoginContext';

export function useIsLoginState() {
  const context = useContext(IsLoginContext);

  if (!context) {
    throw new Error('useSetIsLogin must be used within an IsLoginProvider');
  }

  return context.isLogin;
}