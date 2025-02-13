//NetworkManager.ts
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

type NetworkEvent = { event: string; data?: unknown; scale?: number };

export class NetworkManager {
  private network: Network;
  private loggedInUser: User;
  private neighborsData: User[];
  private roommatesWithNeighbors: RoommateWithNeighbors[];
  private nodesDataSet: DataSet<Node> = new DataSet<Node>();
  private edgesDataSet: DataSet<Edge> = new DataSet<Edge>();
  private interactedNodeId: string | null = null;

  private observer?: (event: NetworkEvent) => void;
  private lock: number = 0;

  setObserver(observer: (event: NetworkEvent) => void) {
    console.log('set Observer called');
    this.observer = observer;
    console.debug(observer);
  }

  constructor(
    networkContainer: HTMLDivElement,
    loggedInUser: User,
    neighborsData: User[],
    roommatesWithNeighbors: RoommateWithNeighbors[],
    callbacks: { [key: string]: (node_id: string) => void },
  ) {
    this.loggedInUser = loggedInUser;
    this.neighborsData = neighborsData;
    this.roommatesWithNeighbors = roommatesWithNeighbors;

    this.nodesDataSet.add(this.generateNodes(loggedInUser, roommatesWithNeighbors, neighborsData));
    this.edgesDataSet.add(this.generateEdges(loggedInUser, roommatesWithNeighbors, neighborsData));

    this.network = new Network(
      networkContainer,
      {
        nodes: this.nodesDataSet,
        edges: this.edgesDataSet,
      },
      visnet_options,
    );

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

    this.network.on('click', (event: { nodes: string[]; pointer: { DOM: { x: number; y: number } } }) => {
      const { nodes: clickedNodes, pointer } = event;
      if (clickedNodes.length > 0) {
        const nodeId = clickedNodes[0];
        if (nodeId === this.getLoggeInUser().node_id) {
          this.observer?.({
            event: 'loggedInUserClicked',
            data: { x: pointer.DOM.x, y: pointer.DOM.y },
            scale: this.network.getScale(),
          });
        } else if (this.roommatesWithNeighbors.some((roommate) => roommate.roommate.node_id === nodeId)) {
          this.observer?.({
            event: 'roommateNodeClicked',
            data: { x: pointer.DOM.x, y: pointer.DOM.y, userId: nodeId },
            scale: this.network.getScale(),
          });
        } else {
          this.observer?.({
            event: 'neighborNodeClicked',
            data: { x: pointer.DOM.x, y: pointer.DOM.y, userId: nodeId },
            scale: this.network.getScale(),
          });
        }
      } else {
        this.observer?.({
          event: 'backgroundClicked',
          data: null,
          scale: this.network.getScale(),
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
      this.startObservation(); // 첫 번째 메서드 즉시 실행

      // 500ms(0.5초) 후 두 번째 메서드 실행
      setTimeout(() => {
        this.stopObservation();
      }, 200); // 텀 조절 (밀리초 단위)
    });
  }
  public addLock() {
    this.lock++;
    console.log('lock:', this.lock);
  }
  public removeLock() {
    if (this.lock > 0) {
      this.lock--;
      console.log('lock:', this.lock);
    }
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
      event: 'startDrawing', // div 제거 이벤트
      data: null,
      scale: this.network.getScale(),
    });
  }

  public stopObservation() {
    this.removeLock();
    if (this.lock > 0) return;
    this.observer?.({
      event: 'finishDrawing', // div 재생성 이벤트
      data: this.getPositions(), // 추후 cast get positions 로 변경
      scale: this.network.getScale(),
    });
    console.log(this.network.getScale());
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

  declare generateNodes: (
    loggedInUser: User,
    roommatesWithNeighbors: RoommateWithNeighbors[],
    neighborsData: User[],
  ) => Node[];
  declare generateEdges: (
    loggedInUser: User,
    roommatesWithNeighbors: RoommateWithNeighbors[],
    neighborsData: User[],
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
