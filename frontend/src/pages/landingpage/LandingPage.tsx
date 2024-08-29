import React, { useEffect, useState, useRef } from "react";
// import { Network, Node } from "vis-network";
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

const networkContainer = useRef<HTMLDivElement | null>(null);
const networkInstance = useRef<Network | null>(null);

const generateNodes = (roommates: User[], neighbors: User[]): NodeData[] => {
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

  return [...roommateNodes, ...neighborNodes];
};

const generateEdges = (
  roommatesWithNeighbors: RoommateWithNeighbors[]
): EdgeData[] => {
  const edges: EdgeData[] = [];

  roommatesWithNeighbors.forEach((group) => {
    const roommateId = group.roommate.node_id;
    group.neighbors.forEach((neighbor) => {
      edges.push({
        from: roommateId,
        to: neighbor.node_id,
      });
    });
  });

  return edges;
};

const updateNetwork = (nodes: NodeData[], edges: EdgeData[]) => {
  if (networkInstance.current) {
    const data = { nodes, edges };
    networkInstance.current.setData(data);
  }
};

export default function Landing() {
  const [showLoginedPage, setShowLoginedPage] = useState<boolean>(false);
  const [roommates, setRoommates] = useState<User[]>([]);
  const [neighbors, setNeighbors] = useState<User[]>([]);
  const [roommatesWithNeighbors, setRoommatesWithNeighbors] = useState<
    RoommateWithNeighbors[]
  >([]);

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
          await fetch_friends();
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
          await fetch_friends();
          // window.location.href = "/main";
        }
      }
    } catch (error) {
      alert("unknown error occurred");
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
      alert("unknown error occurred");
    }
  };

  useEffect(() => {
    verifyAccessToken();
  }, []);

  const fetch_friends = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/domain/service/friend",
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
        setRoommates(data.roommates);
        setNeighbors(data.neighbors);
        setRoommatesWithNeighbors(data.roommates_with_neighbors);

        const nodes = generateNodes(roommates, neighbors);
        const edges = generateEdges(roommatesWithNeighbors);
        updateNetwork(nodes, edges);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  // const data = {
  //   nodes,
  //   edges,
  // };

  // useEffect(() => {
  //   const network: Network | null | undefined = networkContainer.current
  //     ? new Network(networkContainer.current, { nodes, edges }, visnet_options)
  //     : null;
  //   // Use `network` here to configure events, etc
  //   network?.on("doubleClick", (event: { nodes: number[] }) => {
  //     const { nodes: clickedNodes } = event;
  //     alert(`id ${clickedNodes} node is clicked.`);
  //   });
  //   if (networkContainer.current) {
  //     networkInstance.current = new Network(
  //       networkContainer.current,
  //       data,
  //       visnet_options
  //     );
  //   }
  //   return () => {
  //     // 컴포넌트 언마운트 시 네트워크 인스턴스 정리
  //     if (networkInstance.current) {
  //       networkInstance.current.destroy();
  //     }
  //   };
  // }, [networkContainer, nodes, edges]);

  // 네트워크 초기화 및 이벤트 설정
  useEffect(() => {
    if (networkContainer.current) {
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

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
      }
    };
  }, [networkContainer]);

  useEffect(() => {
    if (
      roommates.length > 0 &&
      neighbors.length > 0 &&
      roommatesWithNeighbors.length > 0
    ) {
      const nodes = generateNodes(roommates, neighbors);
      const edges = generateEdges(roommatesWithNeighbors);
      updateNetwork(nodes, edges);
    }
  }, [roommates, neighbors, roommatesWithNeighbors]);

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
      alert("unknown error occurred");
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
