import { useLayoutEffect, useState, useRef } from 'react';
import { NetworkManager } from '../lib/VisnetGraph/NetworkManager';
import { initDB, getAllData, saveDatas, getAllRoommates, saveRoommates } from '../utils/indexedDB';
import { landingApi, userApi } from '../lib/api';
import { MY_NODE_MENU_ITEMS, NEIGHBOR_NODE_MENU_ITEMS, ROOMMATE_NODE_MENU_ITEMS } from '../constants/contextMenuItems';

const useNetwork = (callbacks: { [key: string]: (node_id: string) => void }) => {
  const [networkManager, setNetworkManager] = useState<NetworkManager | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number } | null;
    items: [string, () => void][];
    userId: string | null;
  }>({
    position: null,
    items: [],
    userId: null,
  });
  const [castsList, setCastsList] = useState<{ id: string; x: number; y: number; content: string }[]>([]);
  const networkContainer = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let isMounted = true;
    const init = async () => {
      await initDB();
      const cachedRoommates = await getAllRoommates();
      const cachedNeighbors = await getAllData('neighbors');

      let loggedInUser, neighborsData, roommatesWithNeighbors, fetchedCasts;

      if (cachedRoommates.length === 0 || cachedNeighbors.length === 0) {
        const [friendsResponse, contentsResponse] = await Promise.all([
          landingApi.fetchFriends(),
          landingApi.fetchContents(),
        ]);

        loggedInUser = friendsResponse.loggedInUser;
        neighborsData = friendsResponse.neighborsData;
        roommatesWithNeighbors = friendsResponse.roommatesWithNeighbors;
        fetchedCasts = contentsResponse.casts;

        saveRoommates(roommatesWithNeighbors);
        saveDatas('neighbors', neighborsData);
      } else {
        const [myInfoResponse, contentsResponse] = await Promise.all([
          userApi.fetchMyInfo(),
          landingApi.fetchContents(),
        ]);

        loggedInUser = myInfoResponse;
        neighborsData = cachedNeighbors;
        roommatesWithNeighbors = cachedRoommates;
        fetchedCasts = contentsResponse.casts;
      }

      setCastsList(fetchedCasts);

      if (networkContainer.current && loggedInUser) {
        const manager = new NetworkManager(
          networkContainer.current,
          loggedInUser,
          neighborsData,
          roommatesWithNeighbors,
          callbacks,
        );

        setNetworkManager(manager);

        manager.setObserver(({ event, data }) => {
          switch (event) {
            case 'loggedInUserClicked':
              setContextMenu({
                position: data as { x: number; y: number },
                items: MY_NODE_MENU_ITEMS as [string, () => void][],
                userId: null,
              });
              break;
            case 'roommateNodeClicked':
              setContextMenu({
                position: data as { x: number; y: number },
                items: ROOMMATE_NODE_MENU_ITEMS as [string, () => void][],
                userId: (data as { x: number; y: number; userId: string }).userId,
              });
              break;
            case 'neighborNodeClicked':
              setContextMenu({
                position: data as { x: number; y: number },
                items: NEIGHBOR_NODE_MENU_ITEMS as [string, () => void][],
                userId: (data as { x: number; y: number; userId: string }).userId,
              });
              break;
            case 'backgroundClicked':
              setContextMenu({ position: null, items: [], userId: null });
              break;
          }
        });

        const pollNewCasts = async () => {
          while (isMounted) {
            try {
              console.debug('Polling new casts...');
              const newContents = await landingApi.fetchNewContents();

              if (newContents.casts_received.length > 0) {
                console.log("there's new contents");
              }
            } catch (error) {
              console.error('Error fetching new cast data:', error);
            }
          }
        };

        pollNewCasts();
      }
    };

    init();
    return () => {
      isMounted = false;
      networkManager?.destroy();
    };
  }, []);

  return {
    networkManager,
    networkContainer,
    contextMenu,
    setContextMenu,
    castsList,
  };
};

export default useNetwork;
