//NetworkManager.ts
import { Network, Node, Edge } from 'vis-network';
import { DataSet } from 'vis-data';
import { RoomMateData, User, RoommateWithNeighbors } from '@/lib/types/landingPage.type';
import { generateNodes, generateEdges } from './constructNetwork';
import {
  zoomIn,
  zoomOut,
  resetPosition,
  disableGraphInteraction,
  enableGraphInteraction,
  hardenGraph,
  softenGraph,
} from './graphInteraction';

export class NetworkManager {
  private network: Network;
  private loggedInUser: User;
  private roommatesData: RoomMateData[];
  private neighborsData: User[];
  private roommatesWithNeighborsRef: RoommateWithNeighbors[];
  private nodesDataSet: DataSet<Node> = new DataSet<Node>();
  private edgesDataSet: DataSet<Edge> = new DataSet<Edge>();

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

    this.bind();

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
    if (this.network) {
      this.network.destroy();
      console.log('Network destroyed.');
    }
    this.nodesDataSet.clear();
    this.edgesDataSet.clear();
    console.log('Nodes and edges cleared.');
  }

  public getNetwork() {
    return this.network;
  }
  public setNetwork() {}
  public getLoggeInUser() {}
  public setLoggeInUser() {}
  public getRoommatesData() {}
  public setRoommatesData() {}
  public getNeighborsata() {}
  public setNeighborsata() {}
  public getRoommatesWithNeighbors() {}
  public setRoommatesWithNeighbors() {}
  public getNodesDataSet() {}
  public setNodesDataSet() {}
  public getEdgesDataSet() {}
  public setEdgesDataSet() {}

  declare generateNodes: (loggedInUser: User, roommatesData: RoomMateData[], neighborsData: User[]) => Node[];
  declare generateEdges: (
    loggedInUser: User,
    roommates: RoomMateData[],
    roommatesWithNeighbors: RoommateWithNeighbors[],
  ) => Edge[];
  declare zoomIn: () => void;
  declare zoomOut: () => void;
  declare resetPosition: () => void;
  declare disableGraphInteraction: () => void;
  declare enableGraphInteraction: () => void;
  declare hardenGraph: () => void;
  declare softenGraph: () => void;

  private bind() {
    this.zoomIn = zoomIn.bind(this);
    this.zoomOut = zoomOut.bind(this);
    this.resetPosition = resetPosition.bind(this);
    this.disableGraphInteraction = disableGraphInteraction.bind(this);
    this.enableGraphInteraction = enableGraphInteraction.bind(this);
    this.hardenGraph = hardenGraph.bind(this);
    this.softenGraph = softenGraph.bind(this);
  }
}

NetworkManager.prototype.generateNodes = generateNodes;
NetworkManager.prototype.generateEdges = generateEdges;
