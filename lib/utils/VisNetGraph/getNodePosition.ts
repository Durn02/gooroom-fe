// constructNetwork.ts
import { Node, Edge } from 'vis-network';
import { RoomMateData, User, RoommateWithNeighbors } from '@/lib/types/landingPage.type';
import { DataSet } from 'vis-data';

export function generateNodes(loggedInUser: User, roommatesData: RoomMateData[], neighborsData: User[]): Node[] {
  const userNode: Node = {
    id: loggedInUser.node_id,
    label: loggedInUser.nickname,
    group: 'me',
    size: 20,
  };

  const roommateNodes: Node[] = roommatesData.map((roommate) => ({
    id: roommate.roommate.node_id,
    label: roommate.roommate.nickname,
    group: roommate.is_roommate_edge.group ? roommate.is_roommate_edge.group : 'friend',
    size: 15,
  }));

  const neighborNodes: Node[] = neighborsData.map((neighbor) => ({
    id: neighbor.node_id,
    label: neighbor.nickname,
    group: 'neighbor',
    size: 10,
  }));

  return [userNode, ...roommateNodes, ...neighborNodes];
}

export function generateEdges(
  loggedInUser: User,
  roommates: RoomMateData[],
  roommatesWithNeighbors: RoommateWithNeighbors[],
): Edge[] {
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
}

export const addFriend = (
  currentFriendsData: {
    loggedInUser: User;
    roommates: RoomMateData[];
    neighbors: User[];
    roommatesWithNeighbors: RoommateWithNeighbors[];
  },
  newFriendsData: {
    loggedInUser: User;
    roommates: RoomMateData[];
    neighbors: User[];
    roommatesWithNeighbors: RoommateWithNeighbors[];
  },
  currentNodesDataset: DataSet<Node>,
  currentEdgesDataset: DataSet<Edge>,
) => {
  const newNodes: Node[] = generateNodes(
    newFriendsData.loggedInUser,
    newFriendsData.roommates,
    newFriendsData.neighbors,
  );

  const newEdges: Edge[] = generateEdges(
    newFriendsData.loggedInUser,
    newFriendsData.roommates,
    newFriendsData.roommatesWithNeighbors,
  );

  const newNodesDataset: DataSet<Node> = new DataSet<Node>();
  newNodesDataset.add(newNodes);

  const currentNodesIds = new Set(currentNodesDataset.getIds());
  const newNodesIds = new Set(newNodesDataset.getIds());
  const nodesToAdd = newNodesIds.difference(currentNodesIds);
  const arrNodesToAdd = Array.from(nodesToAdd);

  const newEdgesDataset: DataSet<Edge> = new DataSet<Edge>();
  newEdgesDataset.add(newEdges);

  const currentEdgesIds = new Set(currentEdgesDataset.getIds());
  const newEdgesIds = new Set(newEdgesDataset.getIds());
  const edgesToAdd = newEdgesIds.difference(currentEdgesIds);
  const arrEdgesToAdd = Array.from(edgesToAdd);

  currentNodesDataset.add(newNodesDataset.get(arrNodesToAdd));
  currentEdgesDataset.add(newEdgesDataset.get(arrEdgesToAdd));

  currentFriendsData.loggedInUser = newFriendsData.loggedInUser;
  currentFriendsData.roommates = newFriendsData.roommates;
  currentFriendsData.neighbors = newFriendsData.neighbors;
  currentFriendsData.roommatesWithNeighbors = newFriendsData.roommatesWithNeighbors;

  // Convert currentNodes and newNodes arrays into hash maps for fast lookup
  // const currentNodeMap: { [key: string]: Node } = currentNodes.reduce(
  //   (map, node) => {
  //     if (node.id) {
  //       map[node.id] = node;
  //     }
  //     return map;
  //   },
  //   {} as { [key: string]: Node },
  // );

  // currentNodesDataset.getIds()

  // const newNodeMap: { [key: string]: Node } = newNodes.reduce(
  //   (map, node) => {
  //     if (node.id) {
  //       map[node.id] = node;
  //     }
  //     return map;
  //   },
  //   {} as { [key: string]: Node },
  // );

  // // Convert currentEdges and newEdges into hash maps for fast lookup
  // const currentEdgeMap: { [key: string]: Edge } = currentEdges.reduce(
  //   (map, edge) => {
  //     const edgeKey = `${edge.from}-${edge.to}`;
  //     map[edgeKey] = edge;
  //     return map;
  //   },
  //   {} as { [key: string]: Edge },
  // );

  // const newEdgeMap: { [key: string]: Edge } = newEdges.reduce(
  //   (map, edge) => {
  //     const edgeKey = `${edge.from}-${edge.to}`;
  //     map[edgeKey] = edge;
  //     return map;
  //   },
  //   {} as { [key: string]: Edge },
  // );

  // // Get the current node and edge IDs
  // const currentNodeIds = Object.keys(currentNodeMap);
  // const currentEdgeIds = Object.keys(currentEdgeMap);

  // // Get new node and edge IDs
  // const newNodeIds = Object.keys(newNodeMap);
  // const newEdgeIds = Object.keys(newEdgeMap);

  // // 1. Identify nodes to add, update, and remove
  // const nodesToAdd = newNodeIds
  //   .filter((id) => !currentNodeMap[id]) // Nodes that don't exist in current data
  //   .map((id) => newNodeMap[id]);

  // const nodesToUpdate = newNodeIds
  //   .filter((id) => currentNodeMap[id] && JSON.stringify(currentNodeMap[id]) !== JSON.stringify(newNodeMap[id])) // Nodes that have changed
  //   .map((id) => newNodeMap[id]);

  // const nodesToRemove = currentNodeIds.filter((id) => !newNodeMap[id]); // Nodes that exist in current data but not in new data

  // // 2. Identify edges to add, update, and remove
  // // const edgesToAdd = newEdgeIds
  // //   .filter((id) => !currentEdgeMap[id]) // Edges that don't exist in current data
  // //   .map((id) => newEdgeMap[id]);

  // const edgesToUpdate = newEdgeIds
  //   .filter((id) => currentEdgeMap[id] && JSON.stringify(currentEdgeMap[id]) !== JSON.stringify(newEdgeMap[id])) // Edges that have changed
  //   .map((id) => newEdgeMap[id]);

  // const edgesToRemove = currentEdgeIds.filter((id) => !newEdgeMap[id]); // Edges that exist in current data but not in new data

  // Add new nodes and edges
  // if (nodesToAdd.length > 0) {
  //   nodesDataset.add(nodesToAdd);
  //   console.log('Added nodes: ', nodesToAdd);
  // }

  // if (edgesToAdd.length > 0) {
  //   edgesDataset.add(edgesToAdd);
  //   console.log('Added edges: ', edgesToAdd);
  // }

  // // Update existing nodes and edges
  // if (nodesToUpdate.length > 0) {
  //   nodesDataset.update(nodesToUpdate);
  //   console.log('Updated nodes: ', nodesToUpdate);
  // }

  // if (edgesToUpdate.length > 0) {
  //   edgesDataset.update(edgesToUpdate);
  //   console.log('Updated edges: ', edgesToUpdate);
  // }

  // // Remove old nodes and edges
  // if (nodesToRemove.length > 0) {
  //   nodesDataset.remove(nodesToRemove);
  //   console.log('Removed nodes: ', nodesToRemove);
  // }

  // if (edgesToRemove.length > 0) {
  //   edgesDataset.remove(edgesToRemove);
  //   console.log('Removed edges: ', edgesToRemove);
  // }
};