// Define the type for a single cast
type Cast = {
  message: string;
  duration: number;
  createdAt: string;
};

// Define the type for InitData 
// 백엔드에서 가져오는 데이터
type InitData = {
  creator: string;
  message: string;
  duration: number;
  created_at: string;
}[];

// Define the type for CastData
type CastData = {
  [creator: string]: {
    userId: string;
    content: Cast[];
  };
};

// Define the type for ContextMenuState
type ContextMenuState = {
  position: { x: number; y: number } | null;
  items: [string, () => void][];
  userId: string | null;
};

export type { Cast, InitData, CastData, ContextMenuState }; 