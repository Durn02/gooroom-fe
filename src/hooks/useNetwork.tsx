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


  const [castData, setCastData] = useState({});
  const [initData, setInitData] = useState([]);
  const [observing, setObserving] = useState(false);
  const networkContainer = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
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

      setInitData(fetchedCasts);

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
          }
        });
      }
    };

    init();

    return () => {
      networkManager?.destroy();
    };
  }, []);

  useLayoutEffect(() => {
    if (!networkManager) return;
    let isMounted = true;
    if(initData.length > 0) {
      if(initData.length > 0) {
        const groupedData = initData.reduce((acc, cast) => {
            if (acc[cast.creator]) {
                // 기존 userId에 content 추가
                acc[cast.creator].content.push({
                    message: cast.message,
                    duration: cast.duration,
                    createdAt: cast.created_at
                });
            } else {
                // 새로운 userId로 객체 생성
                acc[cast.creator] = {
                    userId: cast.creator,
                    content: [{
                        message: cast.message,
                        duration: cast.duration,
                        createdAt: cast.created_at
                    }]
                };
            }
            return acc;
        }, {});
  
        setCastData(groupedData);
      }
    }

    const pollNewCasts = async () => {
      while (isMounted) {
        try {
          console.debug('Polling new casts...');
          const newContents = await landingApi.fetchNewContents();

          //newRoommate가 최우선
          if (newContents.new_roommates.length > 0) {
            newContents.new_roommates.forEach((newRoommate) => {
              console.log('newRoommate : ', newRoommate);
              networkManager.addRoommate(newRoommate.new_roommate, newRoommate.neighbors);
            });
          }

          if (newContents.casts_received.length > 0) {
            setCastData(prevCastData => {
                const updatedCastData = { ...prevCastData };
        
                newContents.casts_received.forEach(cast => {
                    if (updatedCastData[cast.creator]) {
                        // 기존 userId가 있으면 content 추가
                        updatedCastData[cast.creator].content.push({
                            message: cast.message,
                            duration: cast.duration,
                            createdAt: cast.created_at
                        });
                    } else {
                        // 새로운 userId면 새 객체 생성
                        updatedCastData[cast.creator] = {
                            userId: cast.creator,
                            content: [{
                                message: cast.message,
                                duration: cast.duration,
                                createdAt: cast.created_at
                            }]
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
