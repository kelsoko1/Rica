import React, { useRef, useEffect } from 'react';
import './VerticalResizer.css';

const VerticalResizer = ({ height, setHeight, minHeight = 100, maxHeight = 800 }) => {
  const resizerRef = useRef(null);
  
  useEffect(() => {
    const handleMouseDown = (e) => {
      e.preventDefault();
      document.body.classList.add('resizing-vertical');
      
      const startY = e.clientY;
      const startHeight = height;
      
      const handleMouseMove = (moveEvent) => {
        // Calculate new height (moving up decreases height)
        const deltaY = startY - moveEvent.clientY;
        const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
        
        setHeight(newHeight);
        
        // Store in localStorage for persistence
        localStorage.setItem('ricaTerminalHeight', newHeight);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.classList.remove('resizing-vertical');
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    // Load saved height from localStorage if available
    const savedHeight = localStorage.getItem('ricaTerminalHeight');
    if (savedHeight) {
      const parsedHeight = parseInt(savedHeight, 10);
      if (!isNaN(parsedHeight) && parsedHeight >= minHeight && parsedHeight <= maxHeight) {
        setHeight(parsedHeight);
      }
    }
    
    const resizer = resizerRef.current;
    if (resizer) {
      resizer.addEventListener('mousedown', handleMouseDown);
    }
    
    return () => {
      if (resizer) {
        resizer.removeEventListener('mousedown', handleMouseDown);
      }
      document.body.classList.remove('resizing-vertical');
    };
  }, [height, setHeight, minHeight, maxHeight]);
  
  return (
    <div ref={resizerRef} className="vertical-resizer">
      <div className="resizer-handle"></div>
    </div>
  );
};

export default VerticalResizer;
