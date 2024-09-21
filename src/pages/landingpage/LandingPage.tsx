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
  User,
  RoommateWithNeighbors,
  GetCastsResponse,
} from "../../types/landingPage.type";
import {
  fetchFriends,
  generateEdges,
  generateNodes,
} from "../../utils/handleFriends";
import {
  zoomIn,
  zoomOut,
  resetPosition,
  disableGraphInteraction,
  hardenGraph,
} from "../../utils/graphInteraction";
import { castAnimation } from "../../utils/casting";

const APIURL = getAPIURL();

export default function Landing() {
  const isLoggedIn = useContext(IsLoginContext);
  const loggedInUserRef = useRef<User | undefined>(undefined);
  const roommatesDataRef = useRef<User[]>([]);
  const neighborsDataRef = useRef<User[]>([]);
  const roommatesWithNeighborsRef = useRef<RoommateWithNeighbors[]>([]);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const [logined, setlogined] = useState(false);
  const isCasting = useRef<boolean>(false);
  const networkContainer = useRef<HTMLDivElement | null>(null);
  const networkInstance = useRef<Network | null>(null);
  const new_casts = useRef<GetCastsResponse[]>([]);

  const [isFriendModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
    fitNetworkToScreen();
  };

  const openModal = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const fitNetworkToScreen = () => {
    if (networkInstance.current) {
      networkInstance.current.fit({
        animation: {
          duration: 1000, // 애니메이션 지속 시간 (밀리초)
          easingFunction: "easeInOutQuad", // 애니메이션 이징 함수
        },
      });
    }
  };

  const onSignoutButtonClickHandler = async () => {
    const result = window.confirm("회원탈퇴를 진행합니다.");
    if (result) {
      alert("회원탈퇴를 진행합니다.");
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
        console.error(error);
      }
    }
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
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        if (data.message == "access token validation check successfull") {
          const friendsData = await fetchFriends();
          setlogined(true);
          console.log(friendsData);
          // Update refs instead of state
          loggedInUserRef.current = friendsData.loggedInUser;
          roommatesDataRef.current = friendsData.roommates;
          neighborsDataRef.current = friendsData.neighbors;
          roommatesWithNeighborsRef.current =
            friendsData.roommatesWithNeighbors;
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
          const friendsData = await fetchFriends();
          console.log(isLoggedIn.isLogin);
          setlogined(true);
          // Update refs instead of state
          loggedInUserRef.current = friendsData.loggedInUser;
          roommatesDataRef.current = friendsData.roommates;
          neighborsDataRef.current = friendsData.neighbors;
          roommatesWithNeighborsRef.current =
            friendsData.roommatesWithNeighbors;
        } else {
          isLoggedIn.isLogin = false;
        }
      }
    } catch (error) {
      console.error(`Unknown error occurred in verifyAccessToken : ${error}`);
    }
  };

  const longPoll = async () => {
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
    if (!logined) {
      console.log("IsLoggedIn:", isLoggedIn.isLogin);
      return;
    }
    console.log("gi");
    if (!loggedInUserRef.current) {
      return;
    }
    console.log("ok");
    const nodes = generateNodes(
      loggedInUserRef.current,
      roommatesDataRef.current,
      neighborsDataRef.current
    );
    const edges = generateEdges(
      loggedInUserRef.current,
      roommatesDataRef.current,
      roommatesWithNeighborsRef.current
    );

    nodesRef.current = nodes; // Update nodesRef
    edgesRef.current = edges; // Update edgesRef

    if (networkContainer.current) {
      networkInstance.current = new Network(
        networkContainer.current,
        {
          nodes: nodesRef.current, // Access nodes from nodesRef
          edges: edgesRef.current, // Access edges from edgesRef
        },
        visnet_options
      );
    }

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, [
    loggedInUserRef.current,
    roommatesDataRef.current,
    neighborsDataRef.current,
    roommatesWithNeighborsRef.current,
  ]);

  useEffect(() => {
    if (networkContainer.current) {
      if (!networkInstance.current) {
        networkInstance.current = new Network(
          networkContainer.current,
          {
            nodes: nodesRef.current,
            edges: edgesRef.current,
          },
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
                if (clickedNodeId === loggedInUserRef.current?.node_id) {
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
        const data = { nodes: nodesRef.current, edges: edgesRef.current };
        networkInstance.current.setData(data);
      }
    }
    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, [networkContainer.current, nodesRef, edgesRef]);

  useEffect(() => {
    let isCancelled = false;

    if (loggedInUserRef.current) {
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
  }, [loggedInUserRef.current]);

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
        loggedInUserRef.current?.node_id,
        roommatesDataRef.current,
        neighborsDataRef.current
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
        isOpen={isFriendModalOpen}
        onClose={closeModal}
        userNodeId={selectedUserId ? selectedUserId : null}
      />

      <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} />
    </>
  );
}
