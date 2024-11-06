//NetworkManager.ts
import { Network, Node, Edge, Position } from 'vis-network';
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
import { getLoggedInUserPosition, getRoommatesPosition, getRoommatesByNeighborsPositions } from './getNodePosition';

export class NetworkManager {
  private network: Network;
  private loggedInUser: User;
  private roommatesData: RoomMateData[];
  private neighborsData: User[];
  private roommatesWithNeighbors: RoommateWithNeighbors[];
  private nodesDataSet: DataSet<Node> = new DataSet<Node>();
  private edgesDataSet: DataSet<Edge> = new DataSet<Edge>();

  constructor(
    network: Network,
    loggedInUser: User,
    roommatesData: RoomMateData[],
    neighborsData: User[],
    roommatesWithNeighbors: RoommateWithNeighbors[],
    callbacks: { [key: string]: (node_id: string) => void },
  ) {
    this.network = network;
    this.loggedInUser = loggedInUser;
    this.roommatesData = roommatesData;
    this.neighborsData = neighborsData;
    this.roommatesWithNeighbors = roommatesWithNeighbors;

    const data = { nodes: this.nodesDataSet, edges: this.edgesDataSet };
    network.setData(data);
    this.nodesDataSet.add(this.generateNodes(loggedInUser, roommatesData, neighborsData));
    this.edgesDataSet.add(this.generateEdges(loggedInUser, roommatesData, roommatesWithNeighbors));

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
  public getLoggeInUser() {
    return this.loggedInUser;
  }
  public setLoggeInUser() {}
  public getRoommatesData() {
    return this.roommatesData;
  }
  public setRoommatesData() {}
  public getNeighborsData() {
    return this.neighborsData;
  }
  public setNeighborsData() {}
  public getRoommatesWithNeighbors() {
    return this.roommatesWithNeighbors;
  }
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
  declare getLoggedInUserPosition: () => Position;
  declare getRoommatesPosition: () => Position[];
  declare getRoommatesByNeighborsPositions: () => { [x: string]: Position[] }[];

  private bind() {
    this.zoomIn = zoomIn.bind(this);
    this.zoomOut = zoomOut.bind(this);
    this.resetPosition = resetPosition.bind(this);
    this.disableGraphInteraction = disableGraphInteraction.bind(this);
    this.enableGraphInteraction = enableGraphInteraction.bind(this);
    this.hardenGraph = hardenGraph.bind(this);
    this.softenGraph = softenGraph.bind(this);
    this.getLoggedInUserPosition = getLoggedInUserPosition.bind(this);
    this.getRoommatesPosition = getRoommatesPosition.bind(this);
    this.getRoommatesByNeighborsPositions = getRoommatesByNeighborsPositions.bind(this);
  }
}

NetworkManager.prototype.generateNodes = generateNodes;
NetworkManager.prototype.generateEdges = generateEdges;
