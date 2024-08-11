import React, { useEffect, useRef } from "react";
import { Network, Node } from "vis-network";
import DefaultButton from "../../components/Button/DefaultButton";
import { Link } from "react-router-dom";
import style from "./MainPage.module.css";

export default function MainPage() {
  const container = useRef(null);

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

  // create topology using edges, nodes, options
  useEffect(() => {
    const network: Network | null | undefined = container.current
      ? new Network(container.current, { nodes, edges }, options)
      : null;
    // Use `network` here to configure events, etc
    network?.on("doubleClick", (event: { nodes: number[] }) => {
      const { nodes: clickedNodes } = event;
      alert(`id ${clickedNodes} node is clicked.`);
    });
  }, [container, nodes, edges]);

  return (
    <div>
      <div className={style.toMainPageButtonContainer}>
        <Link to={"/"}>
          <DefaultButton placeholder="메인화면으로" />
        </Link>
      </div>
      <div ref={container} style={{ height: "100vh", width: "100%" }} />
    </div>
  );
}
