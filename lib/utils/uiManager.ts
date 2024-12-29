import { NetworkManager } from "../utils/VisNetGraph/NetworkManager";


export class UIManager {
  // 상태 관리 변수
  
  private ui_position: { x: number; y: number } | null = null; // 선택된 UI 위치
  private cast_positions: Record<string, { x: number; y: number; nodeId: number }> = {}; // 모든 위치 정보
  private scale: number = 1; // 기본 배율

  private isDrowing: boolean = false; 


  constructor(networkManager: NetworkManager) {
    networkManager.setObserver(({ event, data = {}, scale = 1 }) => {
      this.handleEvent(
        event,
        data as Record<string, { x: number; y: number }>, // 타입 단언
        scale // 기본값 1
      );
    });
    
  }
  

  /**
   * 이벤트 처리 핸들러
   */
  public handleEvent(eventType: string, data: Record<string, { x: number; y: number }> = {}, scale: number) { 
    this.scale = scale; // 배율 업데이트
    switch (eventType) {
      case "startDrawing":
        if (this.isDrowing) return;
        this.destroyUI(); // UI용 div 제거
        this.destroyAllCasts(); // Cast용 div 제거
        this.isDrowing = true;
        break;
      case "finishDrawing":
        this.cast_positions = Object.entries(data).reduce((acc, [nodeId, pos]) => {
          // 위치 데이터 저장
          acc[nodeId] = { x: pos.x, y: pos.y, nodeId: parseInt(nodeId) };
          // UI 아이콘 생성
          this.createCasts(pos.x, pos.y, `cast-${nodeId}`);
          return acc;
        }, {} as Record<string, { x: number; y: number; nodeId: number }>);
        
        this.isDrowing = false;
        break;
      case "clickNode":
        if (!data || Object.keys(data).length === 0) {
          this.ui_position = null; // UI 상태 초기화
        } else {
          // 2. 단일 nodeId: position 쌍 처리
          const [nodeId, pos] = Object.entries(data)[0]; // 첫 번째 항목 가져오기
          if (pos) {
            // UI 아이콘 생성
            this.createUI(pos.x, pos.y, `ui-${nodeId}`);
          } else {
            console.warn(`Invalid position data for node ${nodeId}.`);
          }
        }
        break;

      case "zoomEvent":
        this.destroyUI(); // UI용 div 제거
        this.destroyAllCasts(); // Cast용 div 제거
        if (!data || Object.keys(data).length === 0) {
          this.ui_position = null; // UI 상태 초기화
          return;
        }
        this.cast_positions = Object.entries(data).reduce((acc, [nodeId, pos]) => {
          // 위치 데이터 저장
          acc[nodeId] = { x: pos.x, y: pos.y, nodeId: parseInt(nodeId) };
          // UI 아이콘 생성
          this.createCasts(pos.x, pos.y, `cast-${nodeId}`);
          return acc;
        }, {} as Record<string, { x: number; y: number; nodeId: number }>);
        break;

      default:
        console.warn(`Unhandled event type: ${eventType}`);
    }
  }

  private createUI(x: number, y: number, id: string) {
    // 기존 요소 제거 (중복 방지)
    const existing = document.getElementById(id);
    if (existing) existing.remove();
  
    const div = document.createElement("div");

    const offset = 50 * this.scale; // 크기 조정

    div.classList.add("ui"); // 클래스 추가
    div.id = id;
    div.style.position = "absolute";
    div.style.left = `${x - 50*offset}px`;
    div.style.top = `${y - 50*offset}px`;
    div.style.width = `${offset}px`;
    div.style.height = `${offset}px`;
    div.style.borderRadius = "50%";
    div.style.border = "2px solid red";
  
    const parent = document.getElementById("NetworkContainer");
    if (parent) {
      parent.appendChild(div);
    } else {
      console.error("Container element not found!");
    }
  }

  /**
   * 아이콘 UI 생성
   */
  private createCasts(x: number, y: number, id: string) {
    const img = document.createElement("img");
    const offset = 60 * Math.min(this.scale, 3);

    img.classList.add("cast");
    img.id = id;
    img.src = "/lib/assets/icons/cast.png"; // 수정된 경로
    img.style.position = "absolute";
    img.style.left = `${x - 0.3*offset}px`;
    img.style.top = `${y - 0.01*offset}px`;
    img.style.width = `${0.5*offset}px`;
    img.style.height = `${0.5*offset}px`;
  
    // 부모 요소 추가 (document.body가 아닌 특정 컨테이너)
    const container = document.getElementById("NetworkContainer");
    if (container) {
      container.appendChild(img);
      this.animateCast(img, y - 1.2*offset);
    } else {
      console.error("Container element not found!");
    }
  }

  private animateCast(element: HTMLElement, baseY: number) {
    let direction = 1; // 방향 (위/아래 전환)
    let opacity = 0.7; // 초기 투명도
    let position = baseY; // 초기 위치
    const offset = Math.min(this.scale, 2);
    // 애니메이션 반복 설정
    setInterval(() => {
      // 위치 변경 (위아래 10px 이동)
      position += direction * 0.5 * offset;
  
      // 투명도 전환
      opacity -= direction * 0.02;

  
      // 적용
      element.style.top = `${position}px`;
      element.style.opacity = `${opacity}`;
  
      // 방향 전환
      if (position > baseY || position < baseY - 5 * offset) {
        direction *= -1;
      }
    }, 30); // 500ms 간격으로 반복
  }

  // UI용 div 제거
  private destroyUI() {
    const elements = document.querySelectorAll(".ui"); // UI 전용 클래스 선택
    elements.forEach((el) => el.remove());
  }

  // Cast용 div 제거
  private destroyAllCasts() {
    const elements = document.querySelectorAll(".cast"); // Cast 전용 클래스 선택
    elements.forEach((el) => el.remove());
  }
}
