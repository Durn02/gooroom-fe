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

type NetworkEvent = { event: string; data?: unknown; scale?: number };

export class NetworkManager {
  private network: Network;
  private loggedInUser: User;
  private roommatesData: RoomMateData[];
  private neighborsData: User[];
  private roommatesWithNeighbors: RoommateWithNeighbors[];
  private nodesDataSet: DataSet<Node> = new DataSet<Node>();
  private edgesDataSet: DataSet<Edge> = new DataSet<Edge>();
  private interactedNodeId: string | null = null;
  
  private observer? : (event: NetworkEvent) => void;
  private lock: number = 0;


  setObserver(observer: (event: NetworkEvent) => void) {
    this.observer = observer;
  }
  
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
      console.log('double click event');
      if (this.interactedNodeId) return;
      if (clickedNodes.length > 0) {
        this.interactedNodeId = clickedNodes[0];

        this.network.focus(this.interactedNodeId, {
          scale: 100,
          animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad',
          },
        });

        setTimeout(() => {
          callbacks.onNodeDoubleClick(this.interactedNodeId? this.interactedNodeId : '');
        }, 800);

        this.interactedNodeId = null;
      }
    });

    this.network.on('click', (event: { nodes: string[] }) => {
      console.log('click event');
      const { nodes: clickedNodes } = event;
      if (clickedNodes.length > 0) {
        const nodeId = clickedNodes[0];
        if (this.interactedNodeId === nodeId) {
          this.observer?.({
            event: "nodeClicked",
            data: null,
            scale: this.network.getScale(),
          });
          this.interactedNodeId = null;
          return;
        }
        const position = this.getPositions()[nodeId];

        this.observer?.({
          event: "nodeClicked",
          data: {[nodeId]: position},
          scale: this.network.getScale(),
        });

        this.interactedNodeId = nodeId;
      }
      else {
        this.observer?.({
          event: "nodeClicked",
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
      event: "startDrawing", // div 제거 이벤트
      data: null,
      scale: this.network.getScale(),
    });
  }

  public stopObservation() {
    this.removeLock();
    if (this.lock > 0) return;
    this.observer?.({
      event: "finishDrawing", // div 재생성 이벤트
      data: this.getPositions(), // 추후 cast get positions 로 변경
      scale: this.network.getScale(),
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
  declare zoomIn: ()  => void;
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
  }
}

NetworkManager.prototype.generateNodes = generateNodes;
NetworkManager.prototype.generateEdges = generateEdges;
