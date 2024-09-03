import React, { useEffect, useState, useRef } from "react";
import { Network, Node, Edge, IdType, Position } from "vis-network";
import { Link } from "react-router-dom";
import DefaultButton from "../../components/Button/DefaultButton";
import visnet_options from "../../components/VisNetGraph/visnetGraphOptions";
import CastPostStickerDropdownButton from "../../components/Button/DropdownButton/CastPostStickerDropdownButton/CastPostStickerDropdownButton";
import style from "./LandingPage.module.css";
import gsap from "gsap";
import FriendModal from "./FriendModal";
import ProfileModal from "./ProfileModal";

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

export default function Landing() {
  const [isLoggedIn, setShowLoginedPage] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<User>();
  const [roommatesData, setRoommates] = useState<User[]>([]);
  const [neighborsData, setNeighbors] = useState<User[]>([]);
  const [roommatesWithNeighbors, setRoommatesWithNeighbors] = useState<
    RoommateWithNeighbors[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

  const networkContainer = useRef<HTMLDivElement | null>(null);
  const networkInstance = useRef<Network | null>(null);

  const verifyAccessToken = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/domain/auth/verify-access-token",
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
          // window.location.href = "/main";
          setShowLoginedPage(true);
        }
      } else {
        const refresh_response = await fetch(
          "http://localhost:8000/domain/auth/refresh-acc-token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (refresh_response.ok) {
          // window.location.href = "/main";
        }
      }
    } catch (error) {
      alert("unknown error occurred in verifyAccessToken");
    }
  };
  const onSignoutButtonClickHandler = async () => {
    alert("회원탈퇴를 진행합니다.");
    try {
      const response = await fetch(
        "http://localhost:8000/domain/auth/signout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
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
  };

  const fetchFriends = async () => {
    console.log("fetchFriends called!");
    try {
      const response = await fetch(
        "http://localhost:8000/domain/friend/get-members",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
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
      size: 18,
    };

    const roommateNodes = roommates.map((roommate) => ({
      id: roommate.node_id,
      label: roommate.nickname,
      group: "roommate",
    }));

    const neighborNodes = neighbors.map((neighbor) => ({
      id: neighbor.node_id,
      label: neighbor.nickname,
      group: "neighbor",
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

  const updateNetwork = (nodes: Node[], edges: Edge[]) => {
    console.log("updating networkInstance.current : ", networkInstance.current);
    console.log("with nodes : ", nodes);
    console.log("with nodes : ", edges);
    if (networkInstance.current) {
      const data = { nodes, edges };
      networkInstance.current.setData(data);
    }
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
    if (networkContainer.current && !networkInstance.current) {
      networkInstance.current = new Network(
        networkContainer.current,
        { nodes: [], edges: [] },
        visnet_options
      );
      networkInstance.current.on("doubleClick", (event: { nodes: string[] }) => {
        const { nodes: clickedNodes } = event;
        if (clickedNodes.length > 0) {
          const clickedNodeId = clickedNodes[0];
          if (clickedNodeId === loggedInUser?.node_id) {
            openProfileModal();
            console.log(clickedNodeId);
          } else {
            const clickedUser =
              roommatesData.find((user) => user.node_id === clickedNodeId) ||
              neighborsData.find((user) => user.node_id === clickedNodeId);
            if (clickedUser) {
              openModal(clickedUser);
            }
          }
        }
      });
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
  }, [networkContainer.current]);

  useEffect(() => {
    console.log(
      "networkInstanc.current has changed as : ",
      networkInstance.current
    );
    fetchFriends();
  }, [networkInstance.current]);

  useEffect(() => {
    const nodes = generateNodes(loggedInUser, roommatesData, neighborsData);
    const edges = generateEdges(
      loggedInUser,
      roommatesData,
      roommatesWithNeighbors
    );
    updateNetwork(nodes, edges);
  }, [loggedInUser, roommatesData, neighborsData, roommatesWithNeighbors]);

  const zoomIn = () => {
    if (networkInstance.current) {
      const scale = networkInstance.current.getScale();
      networkInstance.current.moveTo({
        scale: scale * 1.2, // 1.2배 확대
      });
    }
  };
  const zoomOut = () => {
    if (networkInstance.current) {
      const scale = networkInstance.current.getScale();
      networkInstance.current.moveTo({
        scale: scale * 0.8, // 0.8배 축소
      });
    }
  };
  const resetPosition = () => {
    if (networkInstance.current) {
      networkInstance.current.fit(); // 초기 위치로 리셋
    }
  };
  const onLogoutButtonClickHandler = async () => {
    try {
      const response = await fetch("http://localhost:8000/domain/auth/logout", {
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
          sessionStorage.removeItem("userId");
          alert("로그아웃합니다.");
          window.location.href = "/";
        }
      }
    } catch (error) {
      alert("unknown error occurred in onLogoutButtonClickHandler");
    }
  };

  const startCastAnimation = (fromCanvas: Position, toCanvas: Position[]) => {
    if (!networkContainer.current || !networkInstance.current) return;

    const movingElement = document.createElement("span");
    movingElement.classList.add(style.blinkingElement);
    networkContainer.current.appendChild(movingElement);
    const fromDOM = networkInstance.current.canvasToDOM(fromCanvas);

    if (fromDOM) {
      movingElement.style.left = `${fromDOM.x}px`;
      movingElement.style.top = `${fromDOM.y}px`;
    }
    toCanvas.forEach((pos, index) => {
      const toDOM = networkInstance.current?.canvasToDOM(pos);
      if (toDOM && fromDOM) {
        gsap.fromTo(
          movingElement,
          { x: 0, y: 0 },
          {
            x: toDOM.x - fromDOM.x,
            y: toDOM.y - fromDOM.y,
            duration: 1,
            ease: "power1.inOut",
            delay: index * 1,
            onComplete: () => {
              if (index === toCanvas.length - 1) {
                networkContainer.current?.removeChild(movingElement);
              }
            },
          }
        );
      }
    });
  };

  const cast = (cast_message: string) => {
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
      console.log(cast_message);
    }

    networkInstance.current?.once("stabilized", () => {
      console.log("finished stablized");
      const loggedInUserPosition = networkInstance.current?.getPositions(
        loggedInUser?.node_id as IdType
      );
      const roommates = networkInstance.current?.getConnectedNodes(
        loggedInUser?.node_id as IdType,
        "to"
      ) as IdType[] | undefined;

      if (
        loggedInUserPosition &&
        roommates &&
        roommates.every(
          (node: IdType) => typeof node === "string" || typeof node === "number"
        )
      ) {
        const roommatesPositions =
          networkInstance.current?.getPositions(roommates);
        if (roommatesPositions) {
          startCastAnimation(
            Object.values(loggedInUserPosition)[0],
            Object.values(roommatesPositions)
          );
        }
      } else {
        console.error("Connected nodes are not in the expected format.");
      }
    });
  };

  return (
    <>
      {!isLoggedIn && (
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

      {isLoggedIn && (
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

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
      />
    </>
  );
}
