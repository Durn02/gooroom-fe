import { useLayoutEffect, useState, useRef } from 'react';
import { fetchFriendsInManager } from '../lib/api/fetchFriends';
import { NetworkManager } from '../lib/VisnetGraph/NetworkManager';
import { initDB, getAllData, saveDatas, getAllRoommates, saveRoommates } from '../utils/indexedDB';
import { fetchMyInfo } from '../lib/api/fetchData';

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

        await fetchMyInfo().then((data) => {
          loggedInUser = data;
        });
      } else {
        const fetchedData = await fetchFriendsInManager();
        loggedInUser = fetchedData.loggedInUser;
        neighborsData = fetchedData.neighborsData;
        roommatesWithNeighbors = fetchedData.roommatesWithNeighbors;

        console.log('roommatesWithNeighbors : ', roommatesWithNeighbors);
        console.log('neighborsData : ', neighborsData);
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
