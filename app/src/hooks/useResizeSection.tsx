import { useState, useCallback, useEffect } from 'react';

interface UseResizableProps {
  minWidth: number;
  maxWidth: number;
  initialWidth: number;
  sectionSide: 'left' | 'right' | 'top' | 'bottom';
}

export const useResizeSection = ({ minWidth, maxWidth, initialWidth, sectionSide }: UseResizableProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [initialX, setInitialX] = useState(0);
  const [width, setWidth] = useState(initialWidth);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setInitialX(e.clientX);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        requestAnimationFrame(() => {
          const delta = ((e.clientX - initialX) / window.innerWidth) * 100;
          const newWidth = sectionSide === 'left' ? width + delta : sectionSide === 'right' ? width - delta : width;
          if (newWidth >= minWidth && newWidth <= maxWidth) {
            setWidth(newWidth);
          }
          setInitialX(e.clientX);
        });
      }
    },
    [isResizing, initialX, width, minWidth, maxWidth],
  );

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return {
    width,
    handleMouseDown,
  };
};
