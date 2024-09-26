import {
  User,
  RoomMateData,
  RoommateWithNeighbors,
} from "../types/landingPage.type"; // Import your types
import getAPIURL from "./getAPIURL"; // Utility to get API URL
import { Node, Edge } from "vis-network"; // Import vis-network types

export const fetchFriends = async (): Promise<{
  loggedInUser: User | undefined;
  roommates: RoomMateData[];
  neighbors: User[];
  roommatesWithNeighbors: RoommateWithNeighbors[];
}> => {
  const APIURL = getAPIURL();
  console.log("API URL: ", APIURL);
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
        return {
          loggedInUser: data.u,
          roommates: data.roommates,
          neighbors: data.neighbors,
          roommatesWithNeighbors: data.roommates_with_neighbors,
        };
      }
    }
    // If response is not OK or data is not as expected, return empty values
    return {
      loggedInUser: undefined,
      roommates: [],
      neighbors: [],
      roommatesWithNeighbors: [],
    };
  } catch (error) {
    alert(`Failed to fetch friends: ${error}`);
    return {
      loggedInUser: undefined,
      roommates: [],
      neighbors: [],
      roommatesWithNeighbors: [],
    };
  }
};

export const generateNodes = (
  loggedInUser: User | undefined,
  roommates: RoomMateData[],
  neighbors: User[]
): Node[] => {
  if (!loggedInUser) {
    console.error("Logged in user is undefined");
    return [];
  }

  const userNode: Node = {
    id: loggedInUser.node_id,
    label: loggedInUser.nickname,
    group: "me",
    size: 20,
  };

  const roommateNodes = roommates.map((roommate) => ({
    id: roommate.roommate.node_id,
    label: roommate.roommate.nickname,
    group: roommate.is_roommate_edge.group
      ? roommate.is_roommate_edge.group
      : "friend",
    size: 15,
  }));

  const neighborNodes = neighbors.map((neighbor) => ({
    id: neighbor.node_id,
    label: neighbor.nickname,
    group: "neighbor",
    size: 10,
  }));

  return [userNode, ...roommateNodes, ...neighborNodes];
};

export const generateEdges = (
  loggedInUser: User | undefined,
  roommates: RoomMateData[],
  roommatesWithNeighbors: RoommateWithNeighbors[]
): Edge[] => {
  if (!loggedInUser) {
    console.error("Logged in user is undefined");
    return [];
  }

  const edges: Edge[] = [];
  const edgeSet = new Set<string>();

  roommates.forEach((roommate) => {
    const edgeKey = `${loggedInUser.node_id}-${roommate.roommate.node_id}`;
    edges.push({
      from: loggedInUser.node_id,
      to: roommate.roommate.node_id,
    });
    edgeSet.add(edgeKey);
  });

  roommatesWithNeighbors.forEach((roommateWithNeighbor) => {
    const roommateId = roommateWithNeighbor.roommate;
    roommateWithNeighbor.neighbors.forEach((neighborId) => {
      const edgeKey = `${roommateId}-${neighborId}`;
      const reverseEdgeKey = `${neighborId}-${roommateId}`;

      if (!edgeSet.has(reverseEdgeKey)) {
        edges.push({
          from: roommateId,
          to: neighborId,
        });
        edgeSet.add(edgeKey);
      }
    });
  });

  return edges;
};
