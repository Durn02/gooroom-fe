// Define the type for a single cast
type Cast = {
  message: string;
  duration: number;
  createdAt: string;
};

// Define the type for ContextMenuState
type ContextMenuState = {
  position: { x: number; y: number } | null;
  items: [string, () => void][];
  userId: string | null;
};

// export type { Cast, InitData, CastData, ContextMenuState };
export type { Cast, ContextMenuState };
