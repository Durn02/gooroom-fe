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
} from '../graphInteraction';

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

  declare generateNodes: (loggedInUser: User, roommatesData: RoomMateData[], neighborsData: User[]) => Node[];

  declare generateEdges: (
    loggedInUser: User,
    roommates: RoomMateData[],
    roommatesWithNeighbors: RoommateWithNeighbors[],
  ) => Edge[];

  declare zoomIn: (network: Network) => void;
  declare zoomOut: (network: Network) => void;
  declare resetPosition: (network: Network) => void;
  declare disableGraphInteraction: (network: Network) => void;
  declare enableGraphInteraction: (network: Network) => void;
  declare hardenGraph: (network: Network) => void;
  declare softenGraph: (network: Network) => void;
}

NetworkManager.prototype.generateNodes = generateNodes;
NetworkManager.prototype.generateEdges = generateEdges;
NetworkManager.prototype.zoomIn = zoomIn;
NetworkManager.prototype.zoomOut = zoomOut;
NetworkManager.prototype.resetPosition = resetPosition;
NetworkManager.prototype.disableGraphInteraction = disableGraphInteraction;
NetworkManager.prototype.enableGraphInteraction = enableGraphInteraction;
NetworkManager.prototype.hardenGraph = hardenGraph;
NetworkManager.prototype.softenGraph = softenGraph;
