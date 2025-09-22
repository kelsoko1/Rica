import React, { useRef, useEffect } from 'react';
import './HorizontalResizer.css';

const HorizontalResizer = ({ 
  width, 
  setWidth, 
  height, 
  setHeight, 
  minWidth = 300, 
  maxWidth = 1200,
  minHeight = 100,
  maxHeight = 800,
  position = 'right' // 'right', 'left', 'top', 'bottom'
}) => {
  const resizerRef = useRef(null);
  
  useEffect(() => {
    const handleMouseDown = (e) => {
      e.preventDefault();
      document.body.classList.add('resizing-horizontal');
      
      // Store initial positions
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = width;
      const startHeight = height;
      
      const handleMouseMove = (moveEvent) => {
        // Handle horizontal resizing (width)
        if (position === 'right' || position === 'left') {
          // Calculate new width
          const deltaX = position === 'right' ? 
            moveEvent.clientX - startX : 
            startX - moveEvent.clientX;
          
          const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));
          
          if (setWidth) {
            setWidth(newWidth);
            // Store in localStorage for persistence
            localStorage.setItem('ricaTerminalWidth', newWidth);
          }
        }
        
        // Handle vertical resizing (height)
        if (position === 'top' || position === 'bottom') {
          // Calculate new height
          const deltaY = position === 'bottom' ? 
            moveEvent.clientY - startY : 
            startY - moveEvent.clientY;
          
          const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
          
          if (setHeight) {
            setHeight(newHeight);
            // Store in localStorage for persistence
            localStorage.setItem('ricaTerminalHeight', newHeight);
          }
        }
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.classList.remove('resizing-horizontal');
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    // Load saved dimensions from localStorage if available
    if (setWidth) {
      const savedWidth = localStorage.getItem('ricaTerminalWidth');
      if (savedWidth) {
        const parsedWidth = parseInt(savedWidth, 10);
        if (!isNaN(parsedWidth) && parsedWidth >= minWidth && parsedWidth <= maxWidth) {
          setWidth(parsedWidth);
        }
      }
    }
    
    if (setHeight) {
      const savedHeight = localStorage.getItem('ricaTerminalHeight');
      if (savedHeight) {
        const parsedHeight = parseInt(savedHeight, 10);
        if (!isNaN(parsedHeight) && parsedHeight >= minHeight && parsedHeight <= maxHeight) {
          setHeight(parsedHeight);
        }
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
      document.body.classList.remove('resizing-horizontal');
    };
  }, [width, setWidth, height, setHeight, minWidth, maxWidth, minHeight, maxHeight, position]);
  
  const getClassNames = () => {
    const baseClass = 'horizontal-resizer';
    const positionClass = `position-${position}`;
    return `${baseClass} ${positionClass}`;
  };
  
  return (
    <div ref={resizerRef} className={getClassNames()}>
      <div className={`resizer-handle-${position}`}></div>
    </div>
  );
};

export default HorizontalResizer;
