// constructNetwork.ts
import { Node, Edge } from 'vis-network';
import { User, RoommateWithNeighbors } from '@/src/types/DomainObject/landingPage.type';
import { NetworkManager } from './NetworkManager';
import { saveRoommates, saveDatas, deleteData } from '@/src/utils/indexedDB';

export function generateNodes(
  loggedInUser: User,
  roommatesWithNeighbors: RoommateWithNeighbors[],
  neighborsData: User[],
): Node[] {
  const userNode: Node = {
    id: loggedInUser.nodeId,
    label: loggedInUser.nickname,
    group: 'me',
    size: 20,
  };

  const roommateNodes: Node[] = roommatesWithNeighbors.map((e) => ({
    id: e.roommate.nodeId,
    label: e.roommate.nickname,
    group: e.roommateEdge.group ? e.roommateEdge.group : 'roommate',
    size: 15,
  }));

  const neighborNodes: Node[] = neighborsData.map((neighbor) => ({
    id: neighbor.nodeId,
    label: neighbor.nickname,
    group: 'neighbor',
    size: 10,
  }));

  console.log('userNode : ', userNode);
  console.log('roommateNodes : ', roommateNodes);
  console.log('neighborNodes : ', neighborNodes);

  return [userNode, ...roommateNodes, ...neighborNodes];
}

export function generateEdges(loggedInUser: User, roommatesWithNeighbors: RoommateWithNeighbors[]): Edge[] {
  const edges: Edge[] = [];
  const edgeSet = new Set<string>();

  roommatesWithNeighbors.forEach((e) => {
    const edgeKey = `${loggedInUser.nodeId}-${e.roommate.nodeId}`;
    edges.push({
      id: edgeKey,
      from: loggedInUser.nodeId,
      to: e.roommate.nodeId,
    });
    edgeSet.add(edgeKey);
  });

  roommatesWithNeighbors.forEach((roommateWithNeighbor) => {
    const roommateId = roommateWithNeighbor.roommate.nodeId;
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

export function addRoommate(this: NetworkManager, newRoommate: User, newNeighbors: User[]) {
  const roommatesWithNeighbors = this.getRoommatesWithNeighbors();
  const neighborsData = this.getNeighborsData();
  const nodes = this.getNodesDataSet();
  const edges = this.getEdgesDataSet();

  // 1. roommatesWithNeighbors에 newRoommate에 newNeighbors의 node_id들을 property로 붙여서 추가
  const newRoommateWithNeighbors: RoommateWithNeighbors = {
    roommate: newRoommate,
    roommateEdge: {
      memo: '',
      edgeId: '',
      group: '',
    },
    neighbors: newNeighbors.map((neighbor) => neighbor.nodeId),
  };
  roommatesWithNeighbors.set(newRoommate.nodeId, newRoommateWithNeighbors);

  // 2. newRoommate가 기존 neighborsData에 존재했었다면 제거
  neighborsData.delete(newRoommate.nodeId);

  // 3. newNeighbors를 순회하면서 roommatesWithNeighbors와 neighborsData에 존재하지 않으면 추가, 별도의 Node[]에 저장
  const newNeighborNodes: Node[] = [];
  const newNeighborsForIdb: User[] = [];
  newNeighbors.forEach((neighbor) => {
    if (!(neighborsData.get(neighbor.nodeId) || roommatesWithNeighbors.get(neighbor.nodeId))) {
      neighborsData.set(neighbor.nodeId, neighbor);
      newNeighborNodes.push({
        id: neighbor.nodeId,
        label: neighbor.nickname,
        group: 'neighbor',
        size: 10,
      });
      newNeighborsForIdb.push(neighbor);
    }
  });

  // 4. NodeDataSet에 newRoommate_id를 가진 노드가 존재했다면(Roommate,Neighbor 어떻든 상관없음) update. 그렇지 않다면 추가
  nodes.update({
    id: newRoommate.nodeId,
    label: newRoommate.nickname,
    group: 'roommate',
    size: 15,
  });

  // 5. newRoommate와 newNeighbors의 Edges를 생성. 기존 EdgeDataSet을 참고해서 nR->nN,nN->nR edge가 존재하지 않으면 생성
  const newEdges: Edge[] = [];
  newNeighbors.forEach((neighbor) => {
    if (
      !edges.get(`${newRoommate.nodeId}-${neighbor.nodeId}0`) &&
      !edges.get(`${neighbor.nodeId}-${newRoommate.nodeId}0`)
    ) {
      newEdges.push({
        id: `${newRoommate.nodeId}-${neighbor.nodeId}0`,
        from: newRoommate.nodeId,
        to: neighbor.nodeId,
      });
    }
  });

  // 6. loggedInUser와 newRoommate 연결
  const loggedInUserId = this.getLoggedInUser().nodeId;
  newEdges.push({
    id: `${loggedInUserId}-${newRoommate.nodeId}`,
    from: loggedInUserId,
    to: newRoommate.nodeId,
  });

  // 7. NodeDataSet에 3에서 추가된 newNeighbors Nodes를 추가, 구성해놓은 edges 추가가
  nodes.add(newNeighborNodes);
  edges.add(newEdges);

  console.log('newRoommateWithNeighbors : ', newRoommateWithNeighbors);
  deleteData('neighbors', newRoommate.nodeId);
  saveRoommates([newRoommateWithNeighbors]);
  saveDatas('neighbors', newNeighborsForIdb);
}
