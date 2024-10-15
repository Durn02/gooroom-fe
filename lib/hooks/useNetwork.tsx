import { useLayoutEffect, useState, useRef } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import { fetchFriendsInManager } from '@/lib/utils/handleFriends';
import visnet_options from '../assets/styles/visnetGraphOptions';
import { NetworkManager } from '../utils/VisNetGraph/NetworkManager';

const useNetwork = (callbacks: { [key: string]: (nodeId: string) => void }) => {
  const [networkManager, initNetworkManager] = useState<NetworkManager>();
  const networkContainer = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const init = async () => {
      //data fetch
      const { loggedInUser, roommatesData, neighborsData, roommatesWithNeighbors } = await fetchFriendsInManager();

      //networkContainer(html element)와 binding된 빈 networkInstance생성
      if (networkContainer.current) {
        const instance = new Network(
          networkContainer.current,
          {
            nodes: [],
            edges: [],
          },
          visnet_options,
        );

        //위의 networkInstance에 fetch해온 데이터들을 set
        if (!loggedInUser) return;
        initNetworkManager(
          new NetworkManager(instance, loggedInUser, roommatesData, neighborsData, roommatesWithNeighbors, callbacks),
        );
      }
    };
    init();
    return () => networkManager?.destroy();
  }, []);

  return {
    networkManager,
    networkContainer,
  };
};

export default useNetwork;
