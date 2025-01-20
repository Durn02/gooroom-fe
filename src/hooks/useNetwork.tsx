import { useLayoutEffect, useState, useRef } from 'react';
import { fetchFriendsInManager } from '../lib/api/fetchFriends';
import { NetworkManager } from '../lib/VisnetGraph/NetworkManager';

const useNetwork = (callbacks: { [key: string]: (node_id: string) => void }) => {
  const [networkManager, initNetworkManager] = useState<NetworkManager>();
  const networkContainer = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const init = async () => {
      const { loggedInUser, neighborsData, roommatesWithNeighbors } = await fetchFriendsInManager();

      if (networkContainer.current && loggedInUser) {
        initNetworkManager(
          new NetworkManager(networkContainer.current, loggedInUser, neighborsData, roommatesWithNeighbors, callbacks),
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
