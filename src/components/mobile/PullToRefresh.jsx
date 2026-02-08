import { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function PullToRefresh({ onRefresh, children }) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef(null);
  
  const threshold = 80;
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    let touchId = null;
    
    const handleTouchStart = (e) => {
      if (container.scrollTop === 0) {
        touchId = e.touches[0].identifier;
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };
    
    const handleTouchMove = (e) => {
      if (!isPulling || touchId === null) return;
      
      const touch = Array.from(e.touches).find(t => t.identifier === touchId);
      if (!touch) return;
      
      const currentY = touch.clientY;
      const distance = currentY - startY.current;
      
      if (distance > 0 && container.scrollTop === 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance * 0.5, threshold + 20));
      }
    };
    
    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
            setIsPulling(false);
          }, 500);
        }
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
      touchId = null;
    };
    
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, isRefreshing, onRefresh]);
  
  const rotation = isRefreshing ? 360 : (pullDistance / threshold) * 360;
  const opacity = Math.min(pullDistance / threshold, 1);
  
  return (
    <div ref={containerRef} className="relative h-full overflow-auto">
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-50 transition-all"
        style={{ 
          height: pullDistance,
          opacity: opacity
        }}
      >
        <RefreshCw 
          className={cn(
            "w-6 h-6 text-slate-600 dark:text-slate-400 transition-transform",
            isRefreshing && "animate-spin"
          )}
          style={{ 
            transform: `rotate(${rotation}deg)` 
          }}
        />
      </div>
      <div style={{ transform: `translateY(${Math.min(pullDistance, threshold)}px)`, transition: isPulling ? 'none' : 'transform 0.3s' }}>
        {children}
      </div>
    </div>
  );
}