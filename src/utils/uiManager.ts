import { NetworkManager } from '../lib/VisnetGraph/NetworkManager';


export class UIManager {
  // 상태 관리 변수
  private cast_positions: Record<string, { x: number; y: number }> = {}; // 모든 위치 정보
  // private contextMenuPosition: { x: number; y: number } | null = null;
  // private contextMenuItems: string[] = [];
  // private contextMenuUserId: string | null = null;

  private scale: number = 1; // 기본 배율
  private isDrawing: boolean = false;

  constructor(networkManager: NetworkManager) {
    networkManager.setObserver(({ event, data = {}, scale = 1 }) => {
      this.handleEvent(
        event,
        data as Record<string, { x: number; y: number }>, // 타입 단언
        scale, // 기본값 1
      );
    });
  }
  // private showContextMenu(x: number, y: number, items: string[], userId: string | null) {
  //   this.contextMenuPosition = { x, y };
  //   this.contextMenuItems = items;
  //   this.contextMenuUserId = userId;
  // }
  // private hideContextMenu() {
  //   this.contextMenuPosition = null;
  //   this.contextMenuItems = [];
  //   this.contextMenuUserId = null;
  // }
  /**
   * 이벤트 처리 핸들러
   */
  public handleEvent(eventType: string, data: Record<string, { x: number; y: number }> = {}, scale: number) {
    this.scale = scale; // 배율 업데이트
    switch (eventType) {
      case 'startDrawing':
        if (this.isDrawing) return;
        
        this.hideCasts(); // Cast용 div 제거
        this.isDrawing = true;
        break;

      case 'finishDrawing':
        this.cast_positions = data; // 위치 정보 업데이트
        this.isDrawing = false;
        break;

      
      default:
        console.warn(`Unhandled event type: ${eventType}`);
    }
  }

  // private createUI(x: number, y: number, id: string) {
  //   // 기존 요소 제거 (중복 방지)
  //   const existing = document.getElementById(id);
  //   if (existing) existing.remove();

  //   const div = document.createElement('div');

  //   const offset = 50 * this.scale; // 크기 조정

  //   div.classList.add('ui'); // 클래스 추가
  //   div.id = id;
  //   div.style.position = 'absolute';
  //   div.style.left = `${x - 50 * offset}px`;
  //   div.style.top = `${y - 50 * offset}px`;
  //   div.style.width = `${offset}px`;
  //   div.style.height = `${offset}px`;
  //   div.style.borderRadius = '50%';
  //   div.style.border = '2px solid red';

  //   const parent = document.getElementById('NetworkContainer');
  //   if (parent) {
  //     parent.appendChild(div);
  //   } else {
  //     console.error('Container element not found!');
  //   }
  // }

  /**
   * 아이콘 UI 생성
   */
  private updateCastPositions() {
    // CastContainer의 prop으로 전달 this.cast_positions를
    // CastContainer의 state로 전달
    // CastContainer의 state를 이용해 CastUI 생성
    // CastUI는 CastContainer에서 생성
    // CastUI는 CastContainer의 state를 prop으로 받아서 생성
    // CastContainer는 CastUI를 생성할 때 this.cast_positions를 prop으로 전달
    // CastUI는 this.cast_positions를 받아서 UI 생성


  }


  // Cast용 div 제거
  private hideCasts() {
    const elements = document.querySelectorAll('.cast'); // Cast 전용 클래스 선택
    elements.forEach((el) => el.remove());
  }
}
