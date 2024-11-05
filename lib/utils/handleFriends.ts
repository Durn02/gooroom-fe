'use client';

import { User, RoomMateData, RoommateWithNeighbors } from '../types/landingPage.type'; // Import your types
import { Node, Edge } from 'vis-network'; // Import vis-network types
import { DataSet } from 'vis-data';
import { API_URL } from './config';

export const fetchFriends = async (): Promise<{
  loggedInUser: User | undefined;
  roommates: RoomMateData[];
  neighbors: User[];
  roommatesWithNeighbors: RoommateWithNeighbors[];
}> => {
  const APIURL = API_URL;
  console.log('API URL: ', APIURL);
  console.log('fetchFriends called!');
  try {
    const response = await fetch(`${APIURL}/domain/friend/get-members`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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

const generateNodes = (loggedInUser: User | undefined, roommates: RoomMateData[], neighbors: User[]): Node[] => {
  if (!loggedInUser) {
    console.error('Logged in user is undefined');
    return [];
  }

  const userNode: Node = {
    id: loggedInUser.node_id,
    label: loggedInUser.nickname,
    group: 'me',
    size: 20,
  };

  const roommateNodes = roommates.map((roommate) => ({
    id: roommate.roommate.node_id,
    label: roommate.roommate.nickname,
    group: roommate.is_roommate_edge.group ? roommate.is_roommate_edge.group : 'friend',
    size: 15,
  }));

  const neighborNodes = neighbors.map((neighbor) => ({
    id: neighbor.node_id,
    label: neighbor.nickname,
    group: 'neighbor',
    size: 10,
  }));
  console.log('Nodes generated: ', [userNode, ...roommateNodes, ...neighborNodes]);
  return [userNode, ...roommateNodes, ...neighborNodes];
};

const generateEdges = (
  loggedInUser: User | undefined,
  roommates: RoomMateData[],
  roommatesWithNeighbors: RoommateWithNeighbors[],
): Edge[] => {
  if (!loggedInUser) {
    console.error('Logged in user is undefined');
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
  console.log(edges);
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
  edgesDataset: DataSet<Edge>, // Reference to DataSet for edges
) => {
  // Generate initial nodes and edges
  const initialNodes = generateNodes(friendsData.loggedInUser, friendsData.roommates, friendsData.neighbors);

  const initialEdges = generateEdges(
    friendsData.loggedInUser,
    friendsData.roommates,
    friendsData.roommatesWithNeighbors,
  );

  // Add the generated nodes and edges to the datasets
  nodesDataset.add(initialNodes);
  edgesDataset.add(initialEdges);

  console.log('Initial nodes and edges added to the dataset');
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
  edgesDataset: DataSet<Edge>, // Reference to DataSet for edges
) => {
  // Generate new nodes and edges based on the new and current friends data
  const currentNodes: Node[] = generateNodes(
    currentFriendsData.loggedInUser,
    currentFriendsData.roommates,
    currentFriendsData.neighbors,
  );

  const newNodes: Node[] = generateNodes(
    newFriendsData.loggedInUser,
    newFriendsData.roommates,
    newFriendsData.neighbors,
  );

  const currentEdges: Edge[] = generateEdges(
    currentFriendsData.loggedInUser,
    currentFriendsData.roommates,
    currentFriendsData.roommatesWithNeighbors,
  );

  const newEdges: Edge[] = generateEdges(
    newFriendsData.loggedInUser,
    newFriendsData.roommates,
    newFriendsData.roommatesWithNeighbors,
  );

  // Convert currentNodes and newNodes arrays into hash maps for fast lookup
  const currentNodeMap: { [key: string]: Node } = currentNodes.reduce(
    (map, node) => {
      if (node.id) {
        map[node.id] = node;
      }
      return map;
    },
    {} as { [key: string]: Node },
  );

  const newNodeMap: { [key: string]: Node } = newNodes.reduce(
    (map, node) => {
      if (node.id) {
        map[node.id] = node;
      }
      return map;
    },
    {} as { [key: string]: Node },
  );

  // Convert currentEdges and newEdges into hash maps for fast lookup
  const currentEdgeMap: { [key: string]: Edge } = currentEdges.reduce(
    (map, edge) => {
      const edgeKey = `${edge.from}-${edge.to}`;
      map[edgeKey] = edge;
      return map;
    },
    {} as { [key: string]: Edge },
  );

  const newEdgeMap: { [key: string]: Edge } = newEdges.reduce(
    (map, edge) => {
      const edgeKey = `${edge.from}-${edge.to}`;
      map[edgeKey] = edge;
      return map;
    },
    {} as { [key: string]: Edge },
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
    .filter((id) => currentNodeMap[id] && JSON.stringify(currentNodeMap[id]) !== JSON.stringify(newNodeMap[id])) // Nodes that have changed
    .map((id) => newNodeMap[id]);

  const nodesToRemove = currentNodeIds.filter((id) => !newNodeMap[id]); // Nodes that exist in current data but not in new data

  // 2. Identify edges to add, update, and remove
  const edgesToAdd = newEdgeIds
    .filter((id) => !currentEdgeMap[id]) // Edges that don't exist in current data
    .map((id) => newEdgeMap[id]);

  const edgesToUpdate = newEdgeIds
    .filter((id) => currentEdgeMap[id] && JSON.stringify(currentEdgeMap[id]) !== JSON.stringify(newEdgeMap[id])) // Edges that have changed
    .map((id) => newEdgeMap[id]);

  const edgesToRemove = currentEdgeIds.filter((id) => !newEdgeMap[id]); // Edges that exist in current data but not in new data

  // Add new nodes and edges
  if (nodesToAdd.length > 0) {
    nodesDataset.add(nodesToAdd);
    console.log('Added nodes: ', nodesToAdd);
  }

  if (edgesToAdd.length > 0) {
    edgesDataset.add(edgesToAdd);
    console.log('Added edges: ', edgesToAdd);
  }

  // Update existing nodes and edges
  if (nodesToUpdate.length > 0) {
    nodesDataset.update(nodesToUpdate);
    console.log('Updated nodes: ', nodesToUpdate);
  }

  if (edgesToUpdate.length > 0) {
    edgesDataset.update(edgesToUpdate);
    console.log('Updated edges: ', edgesToUpdate);
  }

  // Remove old nodes and edges
  if (nodesToRemove.length > 0) {
    nodesDataset.remove(nodesToRemove);
    console.log('Removed nodes: ', nodesToRemove);
  }

  if (edgesToRemove.length > 0) {
    edgesDataset.remove(edgesToRemove);
    console.log('Removed edges: ', edgesToRemove);
  }
};
