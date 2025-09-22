import React, { useRef, useEffect } from 'react';
import './TopMenuResizer.css';

const TopMenuResizer = ({ height, setHeight, minHeight = 40, maxHeight = 120 }) => {
  const resizerRef = useRef(null);
  
  useEffect(() => {
    // Mouse event handlers
    const handleMouseDown = (e) => {
      e.preventDefault();
      document.body.classList.add('resizing-top-menu');
      
      const startY = e.clientY;
      const startHeight = height;
      
      const handleMouseMove = (moveEvent) => {
        // Calculate new height
        const deltaY = moveEvent.clientY - startY;
        const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
        
        setHeight(newHeight);
        
        // Store in localStorage for persistence
        localStorage.setItem('ricaTopMenuHeight', newHeight);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.classList.remove('resizing-top-menu');
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    // Touch event handlers for mobile devices
    const handleTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      
      e.preventDefault();
      document.body.classList.add('resizing-top-menu');
      
      const touch = e.touches[0];
      const startY = touch.clientY;
      const startHeight = height;
      
      const handleTouchMove = (moveEvent) => {
        if (moveEvent.touches.length !== 1) return;
        
        const touch = moveEvent.touches[0];
        const deltaY = touch.clientY - startY;
        const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
        
        setHeight(newHeight);
        localStorage.setItem('ricaTopMenuHeight', newHeight);
      };
      
      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.body.classList.remove('resizing-top-menu');
      };
      
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    };
    
    // Load saved height from localStorage if available
    const savedHeight = localStorage.getItem('ricaTopMenuHeight');
    if (savedHeight) {
      const parsedHeight = parseInt(savedHeight, 10);
      if (!isNaN(parsedHeight) && parsedHeight >= minHeight && parsedHeight <= maxHeight) {
        setHeight(parsedHeight);
      }
    }
    
    const resizer = resizerRef.current;
    if (resizer) {
      // Add mouse event listeners
      resizer.addEventListener('mousedown', handleMouseDown);
      
      // Add touch event listeners
      resizer.addEventListener('touchstart', handleTouchStart, { passive: false });
    }
    
    return () => {
      if (resizer) {
        // Remove mouse event listeners
        resizer.removeEventListener('mousedown', handleMouseDown);
        
        // Remove touch event listeners
        resizer.removeEventListener('touchstart', handleTouchStart);
      }
      document.body.classList.remove('resizing-top-menu');
    };
  }, [height, setHeight, minHeight, maxHeight]);
  
  return (
    <div ref={resizerRef} className="top-menu-resizer">
      <div className="resizer-handle-horizontal-line"></div>
    </div>
  );
};

export default TopMenuResizer;
