import { useLayoutEffect, useState } from 'react';
import { NetworkManager } from '../lib/VisnetGraph/NetworkManager';
import { UIManager } from '../utils/uiManager';

const useUI = (networkManager: NetworkManager) => {
  const [uiManager, setUIManager] = useState<UIManager | null>(null);

  useLayoutEffect(() => {
    console.log('useLayoutEffect called');
    if (networkManager) {
      // 초기 노드 데이터를 가져옴

      console.log('networkManager exists');
      // UIManager 초기화
      const manager = new UIManager(networkManager);
      console.log('manager created  :', manager);

      // NetworkManager의 이벤트를 관찰하도록 설정

      setUIManager(manager);
    }
  }, [networkManager]);

  return {
    uiManager,
  };
};

export default useUI;
