import { Network, Node, Edge } from 'vis-network';
import { DataSet } from 'vis-data';
import { RoomMateData, User, RoommateWithNeighbors } from '@/lib/types/landingPage.type';

export class NetworkManager {
  private network: Network;

  private loggedInUser: User;
  private roommatesData: RoomMateData[];
  private neighborsData: User[];
  private roommatesWithNeighborsRef: RoommateWithNeighbors[];

  private nodesDataSet: DataSet<Node> = new DataSet<Node>();
  private edgesDataSet: DataSet<Edge> = new DataSet<Edge>();

  private isCasting = false;

  constructor(
    network: Network,
    loggedInUser: User,
    roommatesData: RoomMateData[],
    neighborsData: User[],
    roommatesWithNeighborsRef: RoommateWithNeighbors[],
    callbacks: { [key: string]: (nodeId: string) => void },
  ) {
    this.network = network;
    this.loggedInUser = loggedInUser;
    this.roommatesData = roommatesData;
    this.neighborsData = neighborsData;
    this.roommatesWithNeighborsRef = roommatesWithNeighborsRef;

    const data = { nodes: this.nodesDataSet, edges: this.edgesDataSet };
    network.setData(data);
    this.nodesDataSet.add(this.generateNodes(loggedInUser, roommatesData, neighborsData));
    this.edgesDataSet.add(this.generateEdges(loggedInUser, roommatesData, roommatesWithNeighborsRef));

    this.network.on('doubleClick', (event: { nodes: string[] }) => {
      const { nodes: clickedNodes } = event;
      if (clickedNodes.length > 0) {
        const clickedNodeId = clickedNodes[0];

        this.network.focus(clickedNodeId, {
          scale: 100,
          animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad',
          },
        });

        setTimeout(() => {
          callbacks.onNodeDoubleClick(clickedNodeId);
        }, 800);
      }
    });
  }

  public destroy() {
    console.log('NetworkManager is being destroyed.');

    if (this.network) {
      this.network.destroy();
      console.log('Network destroyed.');
    }

    this.nodesDataSet.clear();
    this.edgesDataSet.clear();
    console.log('Nodes and edges cleared.');
  }

  private generateNodes(loggedInUser: User, roommatesData: RoomMateData[], neighborsData: User[]): Node[] {
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

  private generateEdges(
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

  public resetPosition = () => {
    if (!this.isCasting) {
      this.network.fit({
        animation: {
          duration: 1000,
          easingFunction: 'easeInOutQuad',
        },
      });
    }
  };
}
