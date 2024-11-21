import { useLayoutEffect, useState, useRef } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import { fetchFriendsInManager } from '@/lib/utils/handleFriends';
import visnet_options from '../assets/styles/visnetGraphOptions';
import { NetworkManager } from '../utils/VisNetGraph/NetworkManager';

const useNetwork = (callbacks: { [key: string]: (node_id: string) => void }) => {
  const [networkManager, initNetworkManager] = useState<NetworkManager>();
  const networkContainer = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const init = async () => {
      const { loggedInUser, roommatesData, neighborsData, roommatesWithNeighbors } = await fetchFriendsInManager();

      if (networkContainer.current) {
        const instance = new Network(
          networkContainer.current,
          {
            nodes: [],
            edges: [],
          },
          visnet_options,
        );

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
    networkManager: networkManager as NetworkManager,
    networkContainer,
  };
};

export default useNetwork;
