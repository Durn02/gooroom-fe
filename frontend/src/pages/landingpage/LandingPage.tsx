import React, { useEffect, useState, useRef } from "react";
import { Network, Node } from "vis-network";
import { Link } from "react-router-dom";
import DefaultButton from "../../components/Button/DefaultButton";
import style from "./LandingPage.module.css";

interface Roommate {
  roommate: {
    username: string[];
    nickname: string[];
    concern: string[];
    my_memo: string[];
  };
  memo: string;
  posts: string[];
  stickers: string[];
  is_roommate: string[];
}
interface NeighBor {
  neighbor: {
    username: string[];
    nickname: string[];
    concern: string[];
  };
  posts: string[];
  stickers: string[];
}
interface Friends {
  roommates: Record<string, Roommate>;
  neighbors: Record<string, NeighBor>;
}

export default function Landing() {
  const [showLoginedPage, setShowLoginedPage] = useState<boolean>(false);

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
      alert("unknown error occurred");
    }
  };

  useEffect(() => {
    verifyAccessToken();
  }, []);

  const networkContainer = useRef(null);
  const networkInstance = useRef<Network | null>(null);

  const friends: Friends = {
    roommates: {
      lsh2: {
        roommate: {
          username: ["lsh1"],
          nickname: ["lsh1"],
          concern: ['["c1","c2"]'],
          my_memo: ["a_memo"],
        },
        memo: "memo about lsh2",
        posts: [],
        stickers: [],
        is_roommate: ["lsh3"],
      },
      lsh3: {
        roommate: {
          username: ["lsh3"],
          nickname: ["lsh3"],
          concern: ['["lsh2 concern1", "lsh2 concern2"]'],
          my_memo: ["a_memo"],
        },
        memo: "",
        posts: [],
        stickers: ["70c86fc0-6ba4-00fe-8453-a76f56961582"],
        is_roommate: ["lsh2"],
      },
      lsh4: {
        roommate: {
          username: ["lsh4"],
          nickname: ["lsh4"],
          concern: ['["c1","c2"]'],
          my_memo: ["a_memo"],
        },
        memo: "",
        posts: [],
        stickers: [],
        is_roommate: ["lsh6"],
      },
      lsh5: {
        roommate: {
          username: ["lsh5"],
          nickname: ["lsh5"],
          concern: ['["c1","c2"]'],
          my_memo: ["a_memo"],
        },
        memo: "",
        posts: [],
        stickers: [],
        is_roommate: ["lsh6"],
      },
    },
    neighbors: {
      lsh6: {
        neighbor: {
          username: ["lsh6"],
          nickname: ["lsh6"],
          concern: ['["c1","c2"]'],
        },
        posts: [],
        stickers: [],
      },
    },
  };

  const roommates = Object.keys(friends.roommates);
  const neighbors = Object.keys(friends.neighbors);

  const nodes: Node[] = [
    {
      id: "lsh1",
      label: "lsh1",
    },
  ];
  roommates.forEach((roommateId) => {
    const currentRoommate = friends.roommates[roommateId];
    nodes.push({
      id: roommateId,
      label: currentRoommate.memo
        ? currentRoommate.memo
        : currentRoommate.roommate.nickname[0],
    });
  });
  neighbors.forEach((neighborId) => {
    nodes.push({
      id: neighborId,
      label: friends.neighbors[neighborId].neighbor.nickname[0],
    });
  });

  const edges = [{}];
  const existEdges: Set<string> = new Set();

  roommates.forEach((roommateId) => {
    edges.push({
      from: "lsh1",
      to: roommateId,
      label: "lsh1",
    });

    const is_roommate = friends.roommates[roommateId].is_roommate;
    is_roommate.forEach((neighborId) => {
      if (!existEdges.has(neighborId.concat(roommateId))) {
        edges.push({
          from: roommateId,
          to: neighborId,
          label: neighborId.concat(roommateId),
        });
      }
      existEdges.add(roommateId.concat(neighborId));
    });
  });

  const options = {
    nodes: {
      shape: "dot",
      size: 12,
      shadow: true,
      color: {
        border: "white",
        background: "skyblue",
      },
      font: {
        color: "#000",
      },
    },
    edges: {
      color: "gray",
    },
    interaction: {
      hover: true,
    },
  };
  const data = {
    nodes,
    edges,
  };
  // create topology using edges, nodes, options
  useEffect(() => {
    const network: Network | null | undefined = networkContainer.current
      ? new Network(networkContainer.current, { nodes, edges }, options)
      : null;
    // Use `network` here to configure events, etc
    network?.on("doubleClick", (event: { nodes: number[] }) => {
      const { nodes: clickedNodes } = event;
      alert(`id ${clickedNodes} node is clicked.`);
    });
    if (networkContainer.current) {
      networkInstance.current = new Network(
        networkContainer.current,
        data,
        options
      );
    }
    return () => {
      // 컴포넌트 언마운트 시 네트워크 인스턴스 정리
      if (networkInstance.current) {
        networkInstance.current.destroy();
      }
    };
  }, [networkContainer, nodes, edges]);

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
