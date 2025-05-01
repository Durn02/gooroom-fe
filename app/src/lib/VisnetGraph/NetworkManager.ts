// NetworkManager.ts ../lib/VisnetGraph/NetworkManager
import { Network, Node, Edge, Position } from 'vis-network';
import { DataSet } from 'vis-data';
import { User, RoommateWithNeighbors } from '@/src/types/landingPage.type';
import { generateNodes, generateEdges } from './constructNetwork';
import visnet_options from '@/src/assets/styles/visnetGraphOptions';
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
import { addRoommate } from './constructNetwork';

type NetworkEvent = { event: string; data?: unknown };

export class NetworkManager {
  private network: Network;
  private loggedInUser: User;
  private neighborsData: Map<string, User>;
  private roommatesWithNeighbors: Map<string, RoommateWithNeighbors>;
  private nodesDataSet: DataSet<Node> = new DataSet<Node>();
  private edgesDataSet: DataSet<Edge> = new DataSet<Edge>();
  private interactedNodeId: string | null = null;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;

  private observer?: (event: NetworkEvent) => void;
  private lock: number = 0;

  setObserver(observer: (event: NetworkEvent) => void) {
    this.observer = observer;
  }

  constructor(
    networkContainer: HTMLDivElement,
    loggedInUser: User,
    neighborsData: User[],
    roommatesWithNeighbors: RoommateWithNeighbors[],
    callbacks: { [key: string]: (node_id: string) => void },
  ) {
    this.loggedInUser = loggedInUser;
    this.neighborsData = new Map(neighborsData.map((neighbor) => [neighbor.node_id, neighbor]));
    this.roommatesWithNeighbors = new Map(
      roommatesWithNeighbors.map((roommateWithNeighbors) => [
        roommateWithNeighbors.roommate.node_id,
        roommateWithNeighbors,
      ]),
    );

    this.nodesDataSet.add(this.generateNodes(loggedInUser, roommatesWithNeighbors, neighborsData));
    this.edgesDataSet.add(this.generateEdges(loggedInUser, roommatesWithNeighbors));

    this.network = new Network(
      networkContainer,
      {
        nodes: this.nodesDataSet,
        edges: this.edgesDataSet,
      },
      visnet_options,
    );
    this.network.fit({ animation: true });

    this.bind();

    this.network.on('doubleClick', (event: { nodes: string[] }) => {
      const { nodes: clickedNodes } = event;
      if (clickedNodes.length > 0) {
        const clickedNodeId = clickedNodes[0];
        this.observer?.({
          event: 'doubleClick',
          data: { nodeId: clickedNodeId },
        });
        this.network.focus(clickedNodeId, {
          scale: 100,
          animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad',
          },
        });
        setTimeout(() => callbacks.onNodeDoubleClick(clickedNodeId), 800);
      }
    });

    this.network.on('click', (event: { nodes: string[]; pointer: { DOM: { x: number; y: number } } }) => {
      const { nodes: clickedNodes, pointer } = event;
      if (clickedNodes.length > 0) {
        const nodeId = clickedNodes[0];
        if (nodeId === this.getLoggeInUser().node_id) {
          this.observer?.({
            event: 'loggedInUserClicked',
            data: { x: pointer.DOM.x, y: pointer.DOM.y },
          });
        } else if (this.roommatesWithNeighbors.keys().some((roommateId) => roommateId === nodeId)) {
          this.observer?.({
            event: 'roommateNodeClicked',
            data: { x: pointer.DOM.x, y: pointer.DOM.y, userId: nodeId },
          });
        } else {
          this.observer?.({
            event: 'neighborNodeClicked',
            data: { x: pointer.DOM.x, y: pointer.DOM.y, userId: nodeId },
          });
        }
      } else {
        this.observer?.({
          event: 'backgroundClicked',
          data: null,
        });
      }
    });
    this.network.on('dragStart', () => this.startObservation());
    this.network.on('dragEnd', () => this.stopObservation());
    this.network.on('startStabilizing', () => this.startObservation());
    this.network.on('stabilized', () => this.stopObservation());
    this.network.on('zoom', () => {
      this.startObservation();
      setTimeout(() => {
        this.stopObservation();
      }, 200);
    });
    this.network.on('resize', () => {
      this.startObservation();

      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.network.fit({
          animation: {
            duration: 500,
            easingFunction: 'easeInOutQuad',
          },
        });
        this.stopObservation();
      }, 300);
    });
  }

  public addLock() {
    this.lock++;
  }
  public removeLock() {
    if (this.lock > 0) {
      this.lock--;
    }
  }
  public getScale() {
    return this.network.getScale();
  }

  public getPositions() {
    // 모든 노드의 원래 위치 가져오기
    const positions = this.network.getPositions(); // { node1: {x, y}, node2: {x, y} }

    // 각 위치를 DOM 좌표로 변환
    const domPositions: Record<string, { x: number; y: number }> = {};
    Object.entries(positions).forEach(([nodeId, pos]) => {
      domPositions[nodeId] = this.network.canvasToDOM(pos); // 변환된 좌표 저장
    });

    return domPositions; // 모든 변환된 위치 반환
  }

  public startObservation() {
    this.addLock();
    this.observer?.({
      event: 'startObservation', // div 제거 이벤트
      data: null,
    });
  }

  public stopObservation() {
    this.removeLock();
    if (this.lock > 0) return;
    this.observer?.({
      event: 'finishObservation', // div 재생성 이벤트
      data: this.getPositions(), // 추후 cast get positions 로 변경
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

  public getSize(nodeId: string) {
    return this.nodesDataSet.get(nodeId).size;
  }

  public getPosition(nodeId: string) {
    const pos = this.network.getPositions()[nodeId];
    if (!pos) return null;
    return this.network.canvasToDOM(pos);
  }

  public getNetwork() {
    return this.network;
  }

  public getLoggeInUser() {
    return this.loggedInUser;
  }

  public getNeighborsData() {
    return this.neighborsData;
  }

  public getRoommatesWithNeighbors() {
    return this.roommatesWithNeighbors;
  }

  public getRoommateData(): { nickname: string; node_id: string }[] {
    return Array.from(this.roommatesWithNeighbors.values()).map((r) => ({
      nickname: r.roommate.nickname,
      node_id: r.roommate.node_id,
    }));
  }

  public getNodesDataSet() {
    return this.nodesDataSet;
  }

  public getEdgesDataSet() {
    return this.edgesDataSet;
  }

  public getAddRoommate() {
    return this.addRoommate;
  }

  declare generateNodes: (
    loggedInUser: User,
    roommatesWithNeighbors: RoommateWithNeighbors[],
    neighborsData: User[],
  ) => Node[];
  declare generateEdges: (loggedInUser: User, roommatesWithNeighbors: RoommateWithNeighbors[]) => Edge[];
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
  declare addRoommate: (newRoommate: User, newNeighbors: User[]) => void;

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
    this.addRoommate = addRoommate.bind(this);
  }
}

NetworkManager.prototype.generateNodes = generateNodes;
NetworkManager.prototype.generateEdges = generateEdges;
