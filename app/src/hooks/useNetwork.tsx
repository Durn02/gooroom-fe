import { useLayoutEffect, useState, useRef } from 'react';
import { NetworkManager } from '../lib/VisnetGraph/NetworkManager';
import { initDB, getAllData, saveDatas, getAllRoommates, saveRoommates } from '../utils/indexedDB';
import { landingApi, userApi } from '../lib/api';
import { MY_NODE_MENU_ITEMS, NEIGHBOR_NODE_MENU_ITEMS, ROOMMATE_NODE_MENU_ITEMS } from '../constants/contextMenuItems';
import { CastsByUser } from '../types/DomainObject/cast.type';
import { ContextMenuState } from '../types/DomainObject/networkTypes';

const useNetwork = (callbacks: { [key: string]: (node_id: string) => void }) => {
  const [networkManager, setNetworkManager] = useState<NetworkManager | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    position: null,
    items: [],
    userId: null,
  });

  const [castData, setCastData] = useState<CastsByUser>({});
  const [observing, setObserving] = useState(false);
  const networkContainer = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const init = async () => {
      await initDB();
      const cachedRoommates = await getAllRoommates();
      const cachedNeighbors = await getAllData('neighbors');

      let loggedInUser, neighborsData, roommatesWithNeighbors;

      landingApi.fetchContents().then((contentsResponse) => {
        setCastData(contentsResponse.castData);
      });

      if (cachedRoommates.length === 0 || cachedNeighbors.length === 0) {
        const friendsResponse = await landingApi.fetchFriends();
        loggedInUser = friendsResponse.loggedInUser;
        neighborsData = friendsResponse.neighborsData;
        roommatesWithNeighbors = friendsResponse.roommatesWithNeighbors;

        saveRoommates(roommatesWithNeighbors);
        saveDatas('neighbors', neighborsData);
      } else {
        const myInfoResponse = await userApi.fetchMyInfo();

        loggedInUser = myInfoResponse;
        neighborsData = cachedNeighbors;
        roommatesWithNeighbors = cachedRoommates;
      }

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
            case 'startObservation':
              setObserving(true);
              break;
            case 'finishObservation':
              setObserving(false);
              break;
            case 'doubleClick':
              setContextMenu({ position: null, items: [], userId: null });
              break;
          }
        });
      }
    };

    init();

    return () => {
      console.log('destroy1 is called');
      networkManager?.destroy();
    };
  }, []);

  useLayoutEffect(() => {
    if (!networkManager) return;
    let isMounted = true;

    const pollNewCasts = async () => {
      while (isMounted) {
        try {
          console.debug('Polling new casts...');
          const newContents = await landingApi.fetchNewContents();

          //newRoommate가 최우선
          if (newContents.newRoommates.length > 0) {
            newContents.newRoommates.forEach((newRoommate) => {
              console.log('newRoommate : ', newRoommate);
              networkManager.addRoommate(newRoommate.newRoommate, newRoommate.neighbors);
            });
          }

          if (newContents.castsReceived.length > 0) {
            setCastData((newCast) => {
              const updatedCastData = { ...newCast };

              newContents.castsReceived.forEach((cast) => {
                if (updatedCastData[cast.creator]) {
                  // 기존 userId가 있으면 content 추가
                  updatedCastData[cast.creator].content.push({
                    message: cast.message,
                    duration: cast.duration,
                    createdAt: cast.createdAt,
                  });
                } else {
                  // 새로운 userId면 새 객체 생성
                  updatedCastData[cast.creator] = {
                    content: [
                      {
                        message: cast.message,
                        duration: cast.duration,
                        createdAt: cast.createdAt,
                      },
                    ],
                  };
                }
              });

              return updatedCastData;
            });
          }
        } catch (error) {
          console.error('Error fetching new cast data:', error);
        }
      }
    };

    pollNewCasts();

    return () => {
      isMounted = false;
      networkManager?.destroy();
    };
  }, [networkManager]);

  return {
    networkManager,
    networkContainer,
    contextMenu,
    setContextMenu,
    castData,
    setCastData,
    observing,
  };
};

export default useNetwork;
