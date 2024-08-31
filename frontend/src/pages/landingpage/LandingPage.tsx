import React, { useEffect, useState, useRef } from "react";
import { Network } from "vis-network";
import { Link } from "react-router-dom";
import DefaultButton from "../../components/Button/DefaultButton";
import visnet_options from "../../components/VisNetGraph/visnetGraphOptions";
import style from "./LandingPage.module.css";

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

interface NodeData {
  id: string;
  label: string;
  group: string;
}

interface EdgeData {
  from: string;
  to: string;
}

export default function Landing() {
  const [showLoginedPage, setShowLoginedPage] = useState<boolean>(false);
  const [loginedUser, setLoginedUser] = useState<User>();
  const [roommatesData, setRoommates] = useState<User[]>([]);
  const [neighborsData, setNeighbors] = useState<User[]>([]);
  const [roommatesWithNeighbors, setRoommatesWithNeighbors] = useState<
    RoommateWithNeighbors[]
  >([]);

  const networkContainer = useRef(null);
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
        console.log("verify access token not ok");
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

  //////////////////////
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
        console.log("fetchFriend success : ", data);
        if (data.length > 0) {
          data = data[0];
          setLoginedUser(data.u);
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
  ): NodeData[] => {
    if (!loggedInUser) {
      console.error("Logged in user is undefined");
      return [];
    }

    console.log("generatingNodes");

    const userNode: NodeData = {
      id: loggedInUser.node_id,
      label: loggedInUser.nickname,
      group: "loggedInUser",
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
  ): EdgeData[] => {
    if (!loggedInUser) {
      console.error("Logged in user is undefined");
      return [];
    }

    console.log("generatingEdges");

    const edges: EdgeData[] = [];
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

  const updateNetwork = (nodes: NodeData[], edges: EdgeData[]) => {
    console.log("updating network");
    if (networkInstance.current) {
      const data = { nodes, edges };
      networkInstance.current.setData(data);
      networkInstance.current.redraw();
      console.log("networkInstance : ", networkInstance.current);
    }
  };

  useEffect(() => {
    verifyAccessToken();
  }, []);

  useEffect(() => {
    if (networkContainer.current && !networkInstance.current) {
      networkInstance.current = new Network(
        networkContainer.current,
        { nodes: [], edges: [] },
        visnet_options
      );
      networkInstance.current.on(
        "doubleClick",
        (event: { nodes: number[] }) => {
          const { nodes: clickedNodes } = event;
          alert(`id ${clickedNodes} node is clicked.`);
        }
      );
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
    fetchFriends();
  }, [networkInstance.current]);

  useEffect(() => {
    console.log(
      "loginedUser, roommatesData, neighborsData, roommatesWithNeighbors something changed"
    );
    console.log("roommatesData : ", roommatesData);
    console.log("neighborsData : ", neighborsData);
    console.log("roommatesWithNeighbors : ", roommatesWithNeighbors);
    if (
      loginedUser &&
      roommatesData.length > 0 &&
      neighborsData.length > 0 &&
      roommatesWithNeighbors.length > 0
    ) {
      console.log(
        "networkinstance.current in instance useEffect: ",
        networkInstance.current
      );
      const nodes = generateNodes(loginedUser, roommatesData, neighborsData);
      const edges = generateEdges(
        loginedUser,
        roommatesData,
        roommatesWithNeighbors
      );
      updateNetwork(nodes, edges);
    }
  }, [loginedUser, roommatesData, neighborsData, roommatesWithNeighbors]);

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
          alert("로그아웃합니다.");
          window.location.href = "/";
        }
      }
    } catch (error) {
      alert("unknown error occurred in onLogoutButtonClickHandler");
    }
  };

  return (
    <>
      {!showLoginedPage && (
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

      {showLoginedPage && (
        <>
          <div>
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
    </>
  );
}
