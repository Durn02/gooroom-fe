import React, { useEffect, useState, useRef, useContext } from "react";
import { Network, Node, Edge } from "vis-network";
import { Link } from "react-router-dom";
import DefaultButton from "../../components/Button/DefaultButton";
import visnet_options from "../../components/VisNetGraph/visnetGraphOptions";
import CastPostStickerDropdownButton from "../../components/Button/DropdownButton/CastPostStickerDropdownButton/CastPostStickerDropdownButton";
import style from "./LandingPage.module.css";
import FriendModal from "../../components/Modals/FriendModal/FriendModal";
import ProfileModal from "./ProfileModal";
import { IsLoginContext } from "../../shared/IsLoginContext";
import getAPIURL from "../../utils/getAPIURL";
import {
  zoomIn,
  zoomOut,
  fitNetworkToScreen,
  resetPosition,
  disableGraphInteraction,
  hardenGraph,
} from "../../utils/graphInteraction";
import { castAnimation } from "../../utils/casting";
import {
  User,
  RoommateWithNeighbors,
  GetCastsResponse,
} from "../../types/landingPage.type";

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
  const [isFriendModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isCasting = useRef<boolean>(false);
  const networkContainer = useRef<HTMLDivElement | null>(null);
  const networkInstance = useRef<Network | null>(null);
  const new_casts = useRef<GetCastsResponse[]>([]);

  const nodeRadius = 13;

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
    fitNetworkToScreen(networkInstance.current);
  };

  const openModal = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
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
          isLoggedIn.isLogin = true;
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
          isLoggedIn.isLogin = true;
          await fetchFriends();
        } else {
          isLoggedIn.isLogin = false;
        }
      }
    } catch (error) {
      console.error(`Unknown error occurred in verifyAccessToken : ${error}`);
    }
  };
  // const onSignoutButtonClickHandler = async () => {
  //   alert("회원탈퇴를 진행합니다.");
  //   try {
  //     const response = await fetch(`${APIURL}/domain/auth/signout`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include",
  //     });
  //     if (response.ok) {
  //       const data = await response.json();
  //       if (data.message === "signout success") {
  //         alert("회원탈퇴가 완료되었습니다.");
  //         window.location.href = "/";
  //       }
  //     }
  //   } catch (error) {
  //     alert("unknown error occurred in onSignoutButtonClickHandler");
  //   }
  // };

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

  const longPoll = async () => {
    console.log("longPoll called");
    try {
      const response = await fetch(
        "http://localhost:8000/domain/content/long_poll",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.new_exists) {
          new_casts.current = data.contents;
          // alertCast();
        }
      }
    } catch (error) {
      console.error("error : ", error);
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

              networkInstance.current?.focus(clickedNodeId, {
                scale: 100, // 확대 비율 (1.0은 기본 값, 1.5는 1.5배 확대)
                animation: {
                  duration: 1000, // 애니메이션 지속 시간 (밀리초)
                  easingFunction: "easeInOutQuad", // 애니메이션 이징 함수
                },
              });

              setTimeout(() => {
                if (clickedNodeId === loggedInUser?.node_id) {
                  openModal(clickedNodeId);
                } else {
                  console.log(clickedNodeId);
                  openModal(clickedNodeId);
                }
              }, 800);
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

  useEffect(() => {
    let isCancelled = false;

    if (loggedInUser) {
      const startPolling = async () => {
        while (!isCancelled) {
          await longPoll();
        }
      };
      startPolling();
    }

    return () => {
      isCancelled = true;
    };
  }, [loggedInUser]);

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
      alert(error);
    }
  };

  const cast = (cast_message: string) => {
    isCasting.current = true;
    disableGraphInteraction(networkInstance.current);
    hardenGraph(networkInstance.current);
    console.log("cast_message : ", cast_message);

    networkInstance.current?.once("stabilized", () => {
      console.log("finished stablized");
      castAnimation(
        networkInstance.current,
        networkContainer.current,
        loggedInUser?.node_id,
        roommatesData,
        neighborsData
      );
    });
    isCasting.current = false;
  };

  return (
    <>
      {console.log(isLoggedIn.isLogin)}
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
              <DefaultButton
                placeholder="+"
                onClick={() =>
                  zoomIn(networkInstance.current, isCasting.current)
                }
              />
              <DefaultButton
                placeholder="O"
                onClick={() =>
                  resetPosition(networkInstance.current, isCasting.current)
                }
              />
              <DefaultButton
                placeholder="-"
                onClick={() =>
                  zoomOut(networkInstance.current, isCasting.current)
                }
              />
            </div>
            <div className={style.logoutButtonContainer}>
              <DefaultButton
                placeholder="로그아웃"
                onClick={() => onLogoutButtonClickHandler()}
              />
            </div>
            {/* <div className={style.signoutButtonContainer}>
              <DefaultButton
                placeholder="회원탈퇴"
                onClick={() => onSignoutButtonClickHandler()}
              />
            </div> */}
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
        isOpen={isFriendModalOpen}
        onClose={closeModal}
        userNodeId={selectedUserId ? selectedUserId : null}
      />

      <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} />
    </>
  );
}
