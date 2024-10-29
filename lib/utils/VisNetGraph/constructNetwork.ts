// constructNetwork.ts
import { Node, Edge } from 'vis-network';
import { RoomMateData, User, RoommateWithNeighbors } from '@/lib/types/landingPage.type';

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

// NetworkManager.prototype.generateEdges = function (
//   loggedInUser: User,
//   roommates: RoomMateData[],
//   roommatesWithNeighbors: RoommateWithNeighbors[],
// ): Edge[] {
//   const edges: Edge[] = [];
//   const edgeSet = new Set<string>();

//   roommates.forEach((roommate) => {
//     const edgeKey = `${loggedInUser.node_id}-${roommate.roommate.node_id}`;
//     edges.push({
//       from: loggedInUser.node_id,
//       to: roommate.roommate.node_id,
//     });
//     edgeSet.add(edgeKey);
//   });

//   roommatesWithNeighbors.forEach((roommateWithNeighbor) => {
//     const roommateId = roommateWithNeighbor.roommate;
//     roommateWithNeighbor.neighbors.forEach((neighborId) => {
//       const edgeKey = `${roommateId}-${neighborId}`;
//       const reverseEdgeKey = `${neighborId}-${roommateId}`;

//       if (!edgeSet.has(reverseEdgeKey)) {
//         edges.push({
//           from: roommateId,
//           to: neighborId,
//         });
//         edgeSet.add(edgeKey);
//       }
//     });
//   });
//   return edges;
// };

// NetworkManager.prototype.generateNodes = function (
//   loggedInUser: User,
//   roommatesData: RoomMateData[],
//   neighborsData: User[],
// ): Node[] {
//   const userNode: Node = {
//     id: loggedInUser.node_id,
//     label: loggedInUser.nickname,
//     group: 'me',
//     size: 20,
//   };

//   const roommateNodes: Node[] = roommatesData.map((roommate) => ({
//     id: roommate.roommate.node_id,
//     label: roommate.roommate.nickname,
//     group: roommate.is_roommate_edge.group ? roommate.is_roommate_edge.group : 'friend',
//     size: 15,
//   }));

//   const neighborNodes: Node[] = neighborsData.map((neighbor) => ({
//     id: neighbor.node_id,
//     label: neighbor.nickname,
//     group: 'neighbor',
//     size: 10,
//   }));

//   return [userNode, ...roommateNodes, ...neighborNodes];
// };
