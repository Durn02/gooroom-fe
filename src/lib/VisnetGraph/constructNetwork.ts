// constructNetwork.ts
import { Node, Edge } from 'vis-network';
import { User, RoommateWithNeighbors } from '@/src/types/landingPage.type';
// import { DataSet } from 'vis-data';

export function generateNodes(
  loggedInUser: User,
  roommatesWithNeighbors: RoommateWithNeighbors[],
  neighborsData: User[],
): Node[] {
  const userNode: Node = {
    id: loggedInUser.node_id,
    label: loggedInUser.nickname,
    group: 'me',
    size: 20,
  };

  const roommateNodes: Node[] = roommatesWithNeighbors.map((e) => ({
    id: e.roommate.node_id,
    label: e.roommate.nickname,
    group: e.roommate_edge.group ? e.roommate_edge.group : 'friend',
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

export function generateEdges(loggedInUser: User, roommatesWithNeighbors: RoommateWithNeighbors[]): Edge[] {
  const edges: Edge[] = [];
  const edgeSet = new Set<string>();

  roommatesWithNeighbors.forEach((e) => {
    const edgeKey = `${loggedInUser.node_id}-${e.roommate.node_id}`;
    edges.push({
      from: loggedInUser.node_id,
      to: e.roommate.node_id,
    });
    edgeSet.add(edgeKey);
  });

  roommatesWithNeighbors.forEach((roommateWithNeighbor) => {
    const roommateId = roommateWithNeighbor.roommate.node_id;
    roommateWithNeighbor.neighbors.forEach((neighborId, index) => {
      const edgeKey = `${roommateId}-${neighborId}`;
      const reverseEdgeKey = `${neighborId}-${roommateId}`;

      if (!edgeSet.has(reverseEdgeKey)) {
        edges.push({
          id: edgeKey + index,
          from: roommateId,
          to: neighborId,
        });
        edgeSet.add(edgeKey);
      }
    });
  });
  return edges;
}
