import { useLayoutEffect, useState, useRef } from 'react';
import { NetworkManager } from '../lib/VisnetGraph/NetworkManager';
import { initDB, getAllData, saveDatas, getAllRoommates, saveRoommates } from '../utils/indexedDB';
import { landingApi, userApi } from '../lib/api';

const useNetwork = (callbacks: { [key: string]: (node_id: string) => void }) => {
  const [networkManager, initNetworkManager] = useState<NetworkManager>();
  const networkContainer = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const init = async () => {
      await initDB();
      const cachedRoommates = await getAllRoommates();
      const cachedNeighbors = await getAllData('neighbors');

      let loggedInUser, neighborsData, roommatesWithNeighbors;

      if (cachedRoommates.length > 0 && cachedNeighbors.length > 0) {
        roommatesWithNeighbors = cachedRoommates;
        neighborsData = cachedNeighbors;

        await userApi.fetchMyInfo().then((data) => {
          loggedInUser = data;
        });
      } else {
        const fetchedData = await landingApi.fetchFriends();
        loggedInUser = fetchedData.loggedInUser;
        neighborsData = fetchedData.neighborsData;
        roommatesWithNeighbors = fetchedData.roommatesWithNeighbors;
        saveRoommates(roommatesWithNeighbors);
        saveDatas('neighbors', neighborsData);
      }

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
