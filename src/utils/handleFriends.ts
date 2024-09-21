import { User, RoommateWithNeighbors } from "../types/landingPage.type"; // Import your types
import getAPIURL from "./getAPIURL"; // Utility to get API URL
import { Node, Edge } from "vis-network"; // Import vis-network types

export const fetchFriends = async (): Promise<{
  loggedInUser: User | undefined;
  roommates: User[];
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
    size: 20,
  };

  const roommateNodes = roommates.map((roommate) => ({
    id: roommate.node_id,
    label: roommate.nickname,
    group: "roommate",
    size: 13,
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
