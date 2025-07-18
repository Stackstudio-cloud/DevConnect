import { useState, useRef } from "react";

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }: UseSwipeOptions) {
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setStartY(touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startX || !startY) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    // Add visual feedback during swipe
    if (elementRef.current) {
      const rotation = deltaX * 0.1;
      const opacity = Math.max(0.7, 1 - Math.abs(deltaX) / 300);
      elementRef.current.style.transform = `translateX(${deltaX * 0.5}px) rotate(${rotation}deg)`;
      elementRef.current.style.opacity = opacity.toString();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!startX || !startY) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    // Reset visual state
    if (elementRef.current) {
      elementRef.current.style.transform = "";
      elementRef.current.style.opacity = "";
    }

    // Check if it's a horizontal swipe (not vertical scroll)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < -threshold && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setStartX(null);
    setStartY(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setStartY(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!startX || !startY) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Add visual feedback during swipe
    if (elementRef.current) {
      const rotation = deltaX * 0.1;
      const opacity = Math.max(0.7, 1 - Math.abs(deltaX) / 300);
      elementRef.current.style.transform = `translateX(${deltaX * 0.5}px) rotate(${rotation}deg)`;
      elementRef.current.style.opacity = opacity.toString();
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!startX || !startY) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Reset visual state
    if (elementRef.current) {
      elementRef.current.style.transform = "";
      elementRef.current.style.opacity = "";
    }

    // Check if it's a horizontal swipe (not vertical scroll)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < -threshold && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setStartX(null);
    setStartY(null);
  };

  return {
    swipeProps: {
      ref: elementRef,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: startX ? handleMouseMove : undefined,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp, // Treat mouse leaving as end of gesture
    },
  };
}
