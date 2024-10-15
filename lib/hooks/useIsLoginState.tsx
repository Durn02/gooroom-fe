import { useContext } from 'react';
import { IsLoginContext } from '@/lib/context/IsLoginContext';

// 로그인 상태 변경 함수 반환하는 커스텀 훅
export function useIsLoginState() {
  const context = useContext(IsLoginContext);

  if (!context) {
    throw new Error('useSetIsLogin must be used within an IsLoginProvider');
  }

  return context.isLogin;
}
