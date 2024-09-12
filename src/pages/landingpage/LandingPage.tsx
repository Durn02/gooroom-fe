import React, { useEffect, useState, useRef, useContext } from "react";
import { Network, Node, Edge, IdType } from "vis-network";
import { Link } from "react-router-dom";
import DefaultButton from "../../components/Button/DefaultButton";
import visnet_options from "../../components/VisNetGraph/visnetGraphOptions";
import CastPostStickerDropdownButton from "../../components/Button/DropdownButton/CastPostStickerDropdownButton/CastPostStickerDropdownButton";
import style from "./LandingPage.module.css";
import gsap from "gsap";
import FriendModal from "../../components/Modals/FriendModal/FriendModal";
import ProfileModal from "./ProfileModal";
import { IsLoginContext } from "../../shared/IsLoginContext";
import getAPIURL from "../../utils/getAPIURL";

interface User {
  my_memo: string;
  nickname: string;
  node_id: string;
  concern: string[];
  username: string;
}

interface RoommateWithNeighbors {
  roommate: User;
  neighbors: User[];
}

const APIURL = getAPIURL();

export default function Landing() {
  const isLoggedIn = useContext(IsLoginContext);
  const [loggedInUser, setLoggedInUser] = useState<User>();
  const [roommatesData, setRoommates] = useState<User[]>([]);
  const [neighborsData, setNeighbors] = useState<User[]>([]);
  const [roommatesWithNeighbors, setRoommatesWithNeighbors] = useState<
    RoommateWithNeighbors[]
  >([]);
  const [Nodes, setNodes] = useState<Node[]>([]);
  const [Edges, setEdges] = useState<Edge[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isCasting = useRef<boolean>(false);
  const networkContainer = useRef<HTMLDivElement | null>(null);
  const networkInstance = useRef<Network | null>(null);

  const nodeRadius = 13;

  const openModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const verifyAccessToken = async () => {
    try {
      const response = await fetch(
        `${APIURL}/domain/auth/verify-access-token`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 쿠키를 포함시키기 위해 필요
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.message === "access token validation check successfull") {
          // 서버가 보낸 메시지에 따라 조건 수정
          await fetchFriends();
        }
      } else {
        const refresh_response = await fetch(
          `${APIURL}/domain/auth/refresh-acc-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (refresh_response.ok) {
          await fetchFriends();
        }
      }
    } catch (error) {
      alert("unknown error occurred in verifyAccessToken");
    }
  };
  const onSignoutButtonClickHandler = async () => {
    const result = window.confirm("회원탈퇴를 진행합니다.");
    if (result) {
      try {
        const response = await fetch(`${APIURL}/domain/auth/signout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.message === "signout success") {
            alert("회원탈퇴가 완료되었습니다.");
            window.location.href = "/";
          }
        }
      } catch (error) {
        alert("unknown error occurred in onSignoutButtonClickHandler");
      }
    }
  };

  const fetchFriends = async () => {
    console.log("fetchFriends called!");
    try {
      const response = await fetch(`${APIURL}/domain/friend/get-members`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.ok) {
        let data = await response.json();
        if (data.length > 0) {
          data = data[0];
          setLoggedInUser(data.u);
          setRoommates(data.roommates);
          setNeighbors(data.neighbors);
          setRoommatesWithNeighbors(data.roommates_with_neighbors);
        }
      }
    } catch (error) {
      alert(error);
    }
  };

  const generateNodes = (
    loggedInUser: User | undefined,
    roommates: User[],
    neighbors: User[]
  ): Node[] => {
    if (!loggedInUser) {
      console.error("Logged in user is undefined");
      return [];
    }

    const userNode: Node = {
      id: loggedInUser.node_id,
      label: loggedInUser.nickname,
      group: "loggedInUser",
      size: nodeRadius,
    };

    const roommateNodes = roommates.map((roommate) => ({
      id: roommate.node_id,
      label: roommate.nickname,
      group: "roommate",
      size: nodeRadius,
    }));

    const neighborNodes = neighbors.map((neighbor) => ({
      id: neighbor.node_id,
      label: neighbor.nickname,
      group: "neighbor",
      size: nodeRadius,
    }));

    return [userNode, ...roommateNodes, ...neighborNodes];
  };

  const generateEdges = (
    loggedInUser: User | undefined,
    roommates: User[],
    roommatesWithNeighbors: RoommateWithNeighbors[]
  ): Edge[] => {
    if (!loggedInUser) {
      console.error("Logged in user is undefined");
      return [];
    }

    const edges: Edge[] = [];
    const edgeSet = new Set<string>();

    roommates.forEach((roommate) => {
      const edgeKey = `${loggedInUser.node_id}-${roommate.node_id}`;
      edges.push({
        from: loggedInUser.node_id,
        to: roommate.node_id,
      });
      edgeSet.add(edgeKey);
    });

    roommatesWithNeighbors.forEach((roommateWithNeighbor) => {
      const roommateId = roommateWithNeighbor.roommate.node_id;
      roommateWithNeighbor.neighbors.forEach((neighbor) => {
        const edgeKey = `${roommateId}-${neighbor.node_id}`;
        const reverseEdgeKey = `${neighbor.node_id}-${roommateId}`;

        if (!edgeSet.has(reverseEdgeKey)) {
          edges.push({
            from: roommateId,
            to: neighbor.node_id,
          });
          edgeSet.add(edgeKey);
        }
      });
    });

    return edges;
  };

  useEffect(() => {
    verifyAccessToken();
  }, []);

  useEffect(() => {
    console.log(
      "networkContainer.current changed as : ",
      networkContainer.current
    );
    console.log("and now networkInstanc.current : ", networkInstance.current);
    if (networkContainer.current) {
      if (!networkInstance.current) {
        console.log("Nodes : ", Nodes);
        console.log("Edges : ", Edges);
        networkInstance.current = new Network(
          networkContainer.current,
          { nodes: Nodes, edges: Edges },
          visnet_options
        );
        networkInstance.current.on(
          "doubleClick",
          (event: { nodes: string[] }) => {
            const { nodes: clickedNodes } = event;
            if (clickedNodes.length > 0) {
              const clickedNodeId = clickedNodes[0];
              if (clickedNodeId === loggedInUser?.node_id) {
                openProfileModal();
                console.log(clickedNodeId);
              } else {
                const clickedUser =
                  roommatesData.find(
                    (user) => user.node_id === clickedNodeId
                  ) ||
                  neighborsData.find((user) => user.node_id === clickedNodeId);
                if (clickedUser) {
                  openModal(clickedUser);
                }
              }
            }
          }
        );
      } else {
        const data = { nodes: Nodes, edges: Edges };
        networkInstance.current.setData(data);
      }
    }
    console.log(
      "networkinstance.current in initializing instance: ",
      networkInstance.current
    );
    return () => {
      if (networkInstance.current) {
        console.log("network instance destroyed");
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, [networkContainer.current, Nodes, Edges]);

  useEffect(() => {
    const nodes = generateNodes(loggedInUser, roommatesData, neighborsData);
    const edges = generateEdges(
      loggedInUser,
      roommatesData,
      roommatesWithNeighbors
    );
    setNodes(nodes);
    setEdges(edges);
  }, [loggedInUser, roommatesData, neighborsData, roommatesWithNeighbors]);

  const zoomIn = () => {
    if (networkInstance.current && !isCasting.current) {
      const scale = networkInstance.current.getScale();
      networkInstance.current.moveTo({
        scale: scale * 1.2, // 1.2배 확대
      });
    }
  };
  const zoomOut = () => {
    if (networkInstance.current && !isCasting.current) {
      const scale = networkInstance.current.getScale();
      networkInstance.current.moveTo({
        scale: scale * 0.8, // 0.8배 축소
      });
    }
  };
  const resetPosition = () => {
    if (networkInstance.current && !isCasting.current) {
      networkInstance.current.fit(); // 초기 위치로 리셋
    }
  };
  const onLogoutButtonClickHandler = async () => {
    try {
      const response = await fetch(`${APIURL}/domain/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.message === "logout success") {
          // 서버가 보낸 메시지에 따라 조건 수정
          alert("로그아웃합니다.");
          sessionStorage.removeItem("userId");
          console.log("isLoggedIn : ", isLoggedIn);
          window.location.href = "/";
        }
      }
    } catch (error) {
      alert("unknown error occurred in onLogoutButtonClickHandler");
    }
  };

  const disableGraphInteraction = () => {
    if (networkInstance.current) {
      networkInstance.current.setOptions({
        interaction: {
          dragNodes: false,
          dragView: false,
          zoomView: false,
          selectable: false,
        },
      });
    }
    isCasting.current = true;
  };

  const enableGraphInteraction = () => {
    if (networkInstance.current) {
      networkInstance.current.setOptions({
        interaction: {
          dragNodes: true,
          dragView: true,
          zoomView: true,
          selectable: true,
        },
      });
      isCasting.current = false;
    }
  };

  const hardenGraph = () => {
    if (networkInstance.current) {
      networkInstance.current.setOptions({
        edges: {
          smooth: {
            enabled: true,
            type: "continuous",
            roundness: 0,
          },
        },
      });
    }
  };

  const softenGraph = () => {
    if (networkInstance.current) {
      networkInstance.current.setOptions({
        edges: {
          smooth: {
            enabled: true,
            type: "dynamic",
            roundness: 0.5,
          },
        },
      });
    }
  };

  const getPosition = (node_id: IdType) => {
    if (!networkInstance.current) {
      console.error("error in getPosition. there's no networkInstance.current");
      return;
    }

    const canvasPosition = networkInstance.current.getPosition(
      node_id as IdType
    );
    const domPosition = networkInstance.current.canvasToDOM(canvasPosition);
    return domPosition;
  };

  const castAnimation = () => {
    if (!networkInstance.current) {
      console.error("error in getPosition. there's no networkInstance.current");
      return;
    }

    const loggedInUserPosition = getPosition(loggedInUser?.node_id as IdType);
    if (!loggedInUserPosition) {
      console.error("error in castAnimation. there's no loggedInUserPosition");
      return;
    }

    const roommatesPositions = roommatesData
      .map((roommate) => {
        const position = getPosition(roommate.node_id);
        return position || null;
      })
      .filter((position) => position !== null);

    const roommatesByNeighborsPositions = neighborsData.map((neighbor) => {
      const connectedRoommates = networkInstance.current?.getConnectedNodes(
        neighbor.node_id
      ) as IdType[];
      const connectedRoommatesPositions = connectedRoommates.map(
        (connnectedRoommate) => {
          return getPosition(connnectedRoommate);
        }
      );
      return { [neighbor.node_id]: connectedRoommatesPositions };
    });

    const runFirstAnimation = (onComplete: () => void) => {
      let animationsCompleted = 0;

      roommatesPositions.forEach((roommatePos) => {
        if (roommatePos && loggedInUserPosition) {
          const element = document.createElement("span");
          element.classList.add(style.blinkingElement);
          networkContainer.current?.appendChild(element);

          element.style.left = `${loggedInUserPosition.x - 5}px`;
          element.style.top = `${loggedInUserPosition.y - 5}px`;

          gsap.fromTo(
            element,
            { x: 0, y: 0 },
            {
              x: roommatePos.x - loggedInUserPosition.x,
              y: roommatePos.y - loggedInUserPosition.y,
              duration: 2,
              ease: "power1.inOut",
              onComplete: () => {
                networkContainer.current?.removeChild(element);
                animationsCompleted += 1;
                if (animationsCompleted === roommatesPositions.length) {
                  onComplete();
                }
              },
            }
          );
        }
      });
    };

    const runSecondAnimation = () => {
      roommatesByNeighborsPositions.forEach((roommatesByNeighborPos, index) => {
        const [[neighborId, connectedRoommates]] = Object.entries(
          roommatesByNeighborPos
        );
        const neighborPosition = getPosition(neighborId);

        connectedRoommates.forEach((connectedRoommate) => {
          if (neighborPosition && connectedRoommate) {
            const element = document.createElement("span");
            element.classList.add(style.blinkingElement);
            networkContainer.current?.appendChild(element);

            element.style.left = `${connectedRoommate.x - 5}px`;
            element.style.top = `${connectedRoommate.y - 5}px`;

            gsap.fromTo(
              element,
              { x: 0, y: 0 },
              {
                x: neighborPosition.x - connectedRoommate.x,
                y: neighborPosition.y - connectedRoommate.y,
                duration: 2,
                ease: "power1.inOut",
                onComplete: () => {
                  networkContainer.current?.removeChild(element);
                  if (index === roommatesByNeighborsPositions.length - 1) {
                    enableGraphInteraction();
                    softenGraph();
                  }
                },
              }
            );
          }
        });
      });
    };

    runFirstAnimation(runSecondAnimation);
  };

  const cast = (cast_message: string) => {
    isCasting.current = true;
    disableGraphInteraction();
    hardenGraph();
    console.log("cast_message : ", cast_message);

    networkInstance.current?.once("stabilized", () => {
      console.log("finished stablized");
      castAnimation();
    });
  };

  return (
    <>
      {!isLoggedIn.isLogin && (
        <>
          <div>gooroom에 오신 것을 환영합니다</div>
          <div className={style.toSignInPageButtonContainer}>
            <Link to={"signin"}>
              <DefaultButton placeholder="로그인 페이지로" />
            </Link>
          </div>
          <div className={style.toSignUpPageButtonContainer}>
            <Link to={"signup"}>
              <DefaultButton placeholder="회원가입 페이지로" />
            </Link>
          </div>
        </>
      )}

      {isLoggedIn.isLogin && (
        <>
          <div>
            <div className={style.castPostStickerDropdownButton}>
              <CastPostStickerDropdownButton cast_fuction={cast} />
            </div>
            <div className={style.magnifyButtonContainer}>
              <DefaultButton placeholder="+" onClick={() => zoomIn()} />
              <DefaultButton placeholder="O" onClick={() => resetPosition()} />
              <DefaultButton placeholder="-" onClick={() => zoomOut()} />
            </div>
            <div className={style.logoutButtonContainer}>
              <DefaultButton
                placeholder="로그아웃"
                onClick={() => onLogoutButtonClickHandler()}
              />
            </div>
            <div className={style.signoutButtonContainer}>
              <DefaultButton
                placeholder="회원탈퇴"
                onClick={() => onSignoutButtonClickHandler()}
              />
            </div>
            <div className={style.visNetContainer}>
              <div
                ref={networkContainer}
                style={{ height: "100%", width: "100%" }}
              />
            </div>
          </div>
        </>
      )}

      {/* 모달 컴포넌트 */}
      <FriendModal
        isOpen={isModalOpen}
        onClose={closeModal}
        userNodeId={selectedUser ? selectedUser.node_id : null}
      />

      <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} />
    </>
  );
}
