import React, { useEffect, useState, useRef, useContext } from "react";
import { Network, Node, Edge } from "vis-network";
import { DataSet } from "vis-data";
import { Link } from "react-router-dom";
import DefaultButton from "../../components/Button/DefaultButton";
import visnet_options from "../../components/VisNetGraph/visnetGraphOptions";
import CastPostStickerDropdownButton from "../../components/Button/DropdownButton/CastPostStickerDropdownButton/CastPostStickerDropdownButton";
import style from "./LandingPage.module.css";
import FriendModal from "../../components/Modals/FriendModal/FriendModal";
import ProfileModal from "./ProfileModal";
import { IsLoginContext } from "../../shared/IsLoginContext";
import getAPIURL from "../../utils/getAPIURL";
import gsap from "gsap";

import {
  zoomIn,
  zoomOut,
  resetPosition,
  disableGraphInteraction,
  hardenGraph,
} from "../../utils/graphInteraction";
import { castAnimation } from "../../utils/casting";
import { fetchUnreadCasts } from "../../utils/alertCasting";
import {
  User,
  RoomMateData,
  RoommateWithNeighbors,
} from "../../types/landingPage.type";
import {
  fetchFriends,
  initDataset,
  reloadDataset,
  parseGroups,
} from "../../utils/handleFriends";

const APIURL = getAPIURL();

export default function Landing() {
  const isLoggedIn = useContext(IsLoginContext);
  const loggedInUserRef = useRef<User>();
  const roommatesDataRef = useRef<RoomMateData[]>([]);
  const neighborsDataRef = useRef<User[]>([]);
  const roommatesWithNeighborsRef = useRef<RoommateWithNeighbors[]>([]);
  const nodesDataset = useRef(new DataSet<Node>());
  const edgesDataset = useRef(new DataSet<Edge>());
  const networkContainer = useRef<HTMLDivElement | null>(null);
  const networkInstance = useRef<Network | null>(null);
  // const new_casts = useRef<GetCastsResponse[]>([]);
  const selectedNodeIdRef = useRef<string | null>(null);
  const selectedGroupRef = useRef<string>("");

  const [isFriendModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // const groupChangeUIRef = useRef<HTMLDivElement | null>(null);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
    resetPosition(networkInstance.current);
  };

  const openModal = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const handleGroupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // Store the selected group in the `selectedGroupRef`
    selectedGroupRef.current = event.target.value;
    console.log("Selected group:", selectedGroupRef.current);
  };

  const updateNodeGroup = async () => {
    if (selectedNodeIdRef.current && selectedGroupRef.current) {
      const currentNode = nodesDataset.current.get(selectedNodeIdRef.current);

      try {
        const response = await fetch(`${APIURL}/domain/group/modify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_node_id: selectedNodeIdRef.current,
            new_group: selectedGroupRef.current,

          }),
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
  
  const fetchAndUpdateData = async () => {
    const friendsData = await fetchFriends();

    if (loggedInUserRef.current) {
      reloadDataset(
        {
          loggedInUser: loggedInUserRef.current,
          roommates: roommatesDataRef.current,
          neighbors: neighborsDataRef.current,
          roommatesWithNeighbors: roommatesWithNeighborsRef.current,
        },
        friendsData,
        nodesDataset.current,
        edgesDataset.current
      );
    }
    roommatesDataRef.current = friendsData.roommates;
    neighborsDataRef.current = friendsData.neighbors;
    roommatesWithNeighborsRef.current = friendsData.roommatesWithNeighbors;


    if (!loggedInUserRef.current) {
      loggedInUserRef.current = friendsData.loggedInUser;
      initDataset(friendsData, nodesDataset.current, edgesDataset.current);
    }
  };

  const onSignoutButtonClickHandler = async () => {
    const isSignout = window.confirm("정말 회원탈퇴를 진행하시겠습니까?");
    if (isSignout) {
      alert("회원탈퇴를 진행합니다!");
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
          isLoggedIn.isLogin = true;
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
        } else {
          isLoggedIn.isLogin = false;
        }
      }
    } catch (error) {
      console.error(`Unknown error occurred in verifyAccessToken : ${error}`);
    }
  };

  useEffect(() => {
    verifyAccessToken();
  }, []);

  useEffect(() => {
    if (networkContainer.current) {
      if (!networkInstance.current) {
        networkInstance.current = new Network(
          networkContainer.current,
          {
            nodes: nodesDataset.current,
            edges: edgesDataset.current,
          },
          visnet_options
        );
        fetchAndUpdateData();
        console.log("networkInstance constructed");

        networkInstance.current.on("click", (event: { nodes: string[] }) => {
          const { nodes: clickedNodes } = event;
          if (clickedNodes.length > 0) {
            selectedNodeIdRef.current = clickedNodes[0];
          }
          console.log(selectedNodeIdRef.current);
        });
        

        // networkInstance.current.on("hoverNode", (event: { node: string }) => {
        //   const hoveredNodeId = event.node;
        
        //   // Get the position of the hovered node
        //   const nodePosition = networkInstance.current?.getPosition(hoveredNodeId);
        //   const domPosition = networkInstance.current?.canvasToDOM(nodePosition);
        
        //   // Get the current scale of the network
        //   const scale = networkInstance.current?.getScale() || 1;
        
        //   // Show the UI above the node relative to its position and scale
        //   if (domPosition && groupChangeUIRef.current) {
        //     gsap.set(groupChangeUIRef.current, { opacity: 1 });
        
        //     // Calculate offset for correct positioning
        //     const offsetX = groupChangeUIRef.current.offsetWidth / 2;
        //     const offsetY = groupChangeUIRef.current.offsetHeight;
        
        //     // Position the UI centered above the node
        //     const targetLeft = domPosition.x - offsetX;
        //     const targetTop = domPosition.y - offsetY - (10 * scale);
        //     const targetWidth = 100 * scale;
        //     const targetHeight = 50 * scale;
        
        //     // Animate the position and scale with gsap
        //     gsap.to(groupChangeUIRef.current, {
        //       left: `${targetLeft}px`,
        //       top: `${targetTop}px`,
        //       width: `${targetWidth}px`,
        //       height: `${targetHeight}px`,
        //       duration: 0.3, // Duration of the animation
        //       ease: "power1.out",
        //     });
        //   }
        // });
        
        // networkInstance.current.on("blurNode", () => {
        //   // Animate the UI to disappear when the mouse leaves the node
        //   if (groupChangeUIRef.current) {
        //     gsap.to(groupChangeUIRef.current, {
        //       opacity: 0,
        //       duration: 0.3,
        //       ease: "power1.out",
        //     });
        //   }
        // });
        

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
        fetchUnreadCasts(nodesDataset.current);
      } else {
        fetchAndUpdateData();
        console.log("fetchAndUpdateData called");
      }
    }
    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, [networkContainer.current]);

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
    disableGraphInteraction(networkInstance.current);
    hardenGraph(networkInstance.current);
    console.log("cast_message : ", cast_message);

    networkInstance.current?.once("stabilized", () => {
      castAnimation(
        networkInstance.current,
        networkContainer.current,
        loggedInUserRef.current?.node_id,
        roommatesDataRef.current,
        neighborsDataRef.current
      );
    });
  };

  return (
    <>
      {console.log("isLoggedIn.isLogin : ", isLoggedIn.isLogin)}
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
      {loggedInUserRef.current?.groups && (
        <div className="group-selector">
          <label htmlFor="group-select">Select Group:</label>
          <select id="group-select" onChange={handleGroupChange}>
            {Object.keys(parseGroups(loggedInUserRef.current.groups)).map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          <button onClick={updateNodeGroup}>Change Group</button>
        </div>
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
                onClick={() => zoomIn(networkInstance.current)}
              />
              <DefaultButton
                placeholder="O"
                onClick={() => resetPosition(networkInstance.current)}
              />
              <DefaultButton
                placeholder="-"
                onClick={() => zoomOut(networkInstance.current)}
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
