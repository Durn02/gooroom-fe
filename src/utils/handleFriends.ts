import {
  User,
  RoomMateData,
  RoommateWithNeighbors,
  Group,
} from "../types/landingPage.type"; // Import your types
import getAPIURL from "./getAPIURL"; // Utility to get API URL
import { Node, Edge } from "vis-network"; // Import vis-network types
import { DataSet } from "vis-data";

export const parseGroups = (groupsString: string | undefined): Group[] => {
  try {
    // Replace single quotes around values with double quotes and add double quotes around keys
    const validJsonString = groupsString
      ?.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Add quotes around keys
      .replace(/'/g, '"'); // Replace single quotes around values with double quotes
    
    // Parse the corrected JSON string
    const groups: Record<string, string> = validJsonString ? JSON.parse(validJsonString) : {};
    
    // Convert the object to an array of Group objects
    return Object.entries(groups).map(([group_name, group_color]) => ({
      group_name,
      group_color,
    }));
  } catch (error) {
    console.error("Failed to parse groups:", error);
    return [];
  }
};

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
      console.log("Data: ", data);
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

const generateNodes = (
  loggedInUser: User | undefined,
  roommates: RoomMateData[],
  neighbors: User[],
): Node[] => {
  if (!loggedInUser) {
    console.error("Logged in user is undefined");
    return [];
  }

  const groupArray: Group[] = parseGroups(loggedInUser.groups);
  console.log("Group array: ", groupArray);
  const groupCenterNodes: Node[] = groupArray.map((group) => ({
    id: `center-${group.group_name}`, // Create unique IDs for each center node
    label: group.group_name,
    group: group.group_name,
    size: 30,
    mass: 10,
    color: {
      background: group.group_color,
      border: group.group_color,
    },
    hidden:true,
  }));

  const userNode: Node = {
    id: loggedInUser.node_id,
    label: loggedInUser.nickname,
    group: "me",
    size: 20,
  };

  const roommateNodes = roommates.map((roommate) => ({
    id: roommate.roommate.node_id,
    label: roommate.roommate.nickname,
    group: roommate.is_roommate_edge.group || "center-default",
    size: 15,
    color: {
      background: groupArray.find((g) => g.group_name === roommate.is_roommate_edge.group)?.group_color || "#cccccc",
    },
  }));

  const neighborNodes = neighbors.map((neighbor) => ({
    id: neighbor.node_id,
    label: neighbor.nickname,
    group: "neighbor",
    size: 10,
  }));

  return [userNode, ...groupCenterNodes, ...roommateNodes, ...neighborNodes];
};

const generateEdges = (
  loggedInUser: User | undefined,
  roommates: RoomMateData[],
  roommatesWithNeighbors: RoommateWithNeighbors[]
): Edge[] => {
  if (!loggedInUser) {
    console.error("Logged in user is undefined");
    return [];
  }

  const groupArray: Group[] = parseGroups(loggedInUser.groups);

  const edges: Edge[] = [];
  const edgeSet = new Set<string>();

  roommates.forEach((roommate) => {
    const groupName = roommate.is_roommate_edge.group || "default";
    const groupColor = groupArray.find((g) => g.group_name === groupName)?.group_color || "#dddddd";


    edges.push({
      from: `center-${groupName}`, 
      to: roommate.roommate.node_id,
      color: {
        color: groupColor,
        opacity: 0.2,
      },
      hidden:true,
    });


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

export const initDataset = (
  friendsData: {
    loggedInUser: User | undefined;
    roommates: RoomMateData[];
    neighbors: User[];
    roommatesWithNeighbors: RoommateWithNeighbors[];
  },
  nodesDataset: DataSet<Node>, // Reference to DataSet for nodes
  edgesDataset: DataSet<Edge> // Reference to DataSet for edges
) => {
  // Generate initial nodes and edges
  const initialNodes = generateNodes(
    friendsData.loggedInUser,
    friendsData.roommates,
    friendsData.neighbors
  );

  const initialEdges = generateEdges(
    friendsData.loggedInUser,
    friendsData.roommates,
    friendsData.roommatesWithNeighbors
  );

  // Add the generated nodes and edges to the datasets
  nodesDataset.add(initialNodes);
  edgesDataset.add(initialEdges);
  console.log(initialEdges);
  console.log("Initial nodes and edges added to the dataset");
};

export const reloadDataset = (
  currentFriendsData: {
    loggedInUser: User | undefined;
    roommates: RoomMateData[];
    neighbors: User[];
    roommatesWithNeighbors: RoommateWithNeighbors[];
  },
  newFriendsData: {
    loggedInUser: User | undefined;
    roommates: RoomMateData[];
    neighbors: User[];
    roommatesWithNeighbors: RoommateWithNeighbors[];
  },
  nodesDataset: DataSet<Node>, // Reference to DataSet for nodes
  edgesDataset: DataSet<Edge> // Reference to DataSet for edges
) => {
  // Generate new nodes and edges based on the new and current friends data
  const currentNodes: Node[] = generateNodes(
    currentFriendsData.loggedInUser,
    currentFriendsData.roommates,
    currentFriendsData.neighbors
  );

  const newNodes: Node[] = generateNodes(
    newFriendsData.loggedInUser,
    newFriendsData.roommates,
    newFriendsData.neighbors
  );

  const currentEdges: Edge[] = generateEdges(
    currentFriendsData.loggedInUser,
    currentFriendsData.roommates,
    currentFriendsData.roommatesWithNeighbors
  );

  const newEdges: Edge[] = generateEdges(
    newFriendsData.loggedInUser,
    newFriendsData.roommates,
    newFriendsData.roommatesWithNeighbors
  );

  // Convert currentNodes and newNodes arrays into hash maps for fast lookup
  const currentNodeMap: { [key: string]: Node } = currentNodes.reduce(
    (map, node) => {
      if (node.id) {
        map[node.id] = node;
      }
      return map;
    },
    {} as { [key: string]: Node }
  );

  const newNodeMap: { [key: string]: Node } = newNodes.reduce(
    (map, node) => {
      if (node.id) {
        map[node.id] = node;
      }
      return map;
    },
    {} as { [key: string]: Node }
  );

  // Convert currentEdges and newEdges into hash maps for fast lookup
  const currentEdgeMap: { [key: string]: Edge } = currentEdges.reduce(
    (map, edge) => {
      const edgeKey = `${edge.from}-${edge.to}`;
      map[edgeKey] = edge;
      return map;
    },
    {} as { [key: string]: Edge }
  );

  const newEdgeMap: { [key: string]: Edge } = newEdges.reduce(
    (map, edge) => {
      const edgeKey = `${edge.from}-${edge.to}`;
      map[edgeKey] = edge;
      return map;
    },
    {} as { [key: string]: Edge }
  );

  // Get the current node and edge IDs
  const currentNodeIds = Object.keys(currentNodeMap);
  const currentEdgeIds = Object.keys(currentEdgeMap);

  // Get new node and edge IDs
  const newNodeIds = Object.keys(newNodeMap);
  const newEdgeIds = Object.keys(newEdgeMap);

  // 1. Identify nodes to add, update, and remove
  const nodesToAdd = newNodeIds
    .filter((id) => !currentNodeMap[id]) // Nodes that don't exist in current data
    .map((id) => newNodeMap[id]);

  const nodesToUpdate = newNodeIds
    .filter(
      (id) =>
        currentNodeMap[id] &&
        JSON.stringify(currentNodeMap[id]) !== JSON.stringify(newNodeMap[id])
    ) // Nodes that have changed
    .map((id) => newNodeMap[id]);

  const nodesToRemove = currentNodeIds.filter((id) => !newNodeMap[id]); // Nodes that exist in current data but not in new data

  // 2. Identify edges to add, update, and remove
  const edgesToAdd = newEdgeIds
    .filter((id) => !currentEdgeMap[id]) // Edges that don't exist in current data
    .map((id) => newEdgeMap[id]);

  const edgesToUpdate = newEdgeIds
    .filter(
      (id) =>
        currentEdgeMap[id] &&
        JSON.stringify(currentEdgeMap[id]) !== JSON.stringify(newEdgeMap[id])
    ) // Edges that have changed
    .map((id) => newEdgeMap[id]);

  const edgesToRemove = currentEdgeIds.filter((id) => !newEdgeMap[id]); // Edges that exist in current data but not in new data

  // Add new nodes and edges
  if (nodesToAdd.length > 0) {
    nodesDataset.add(nodesToAdd);
    console.log("Added nodes: ", nodesToAdd);
  }

  if (edgesToAdd.length > 0) {
    edgesDataset.add(edgesToAdd);
    console.log("Added edges: ", edgesToAdd);
  }

  // Update existing nodes and edges
  if (nodesToUpdate.length > 0) {
    nodesDataset.update(nodesToUpdate);
    console.log("Updated nodes: ", nodesToUpdate);
  }

  if (edgesToUpdate.length > 0) {
    edgesDataset.update(edgesToUpdate);
    console.log("Updated edges: ", edgesToUpdate);
  }

  // Remove old nodes and edges
  if (nodesToRemove.length > 0) {
    nodesDataset.remove(nodesToRemove);
    console.log("Removed nodes: ", nodesToRemove);
  }

  if (edgesToRemove.length > 0) {
    edgesDataset.remove(edgesToRemove);
    console.log("Removed edges: ", edgesToRemove);
  }
};
