import React, { useRef, useEffect, useState } from 'react';
import './ResizablePanel.css';

const ResizablePanel = ({ children, initialWidth = 240, minWidth = 64, maxWidth = 500 }) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const resizerRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleMouseDown = (e) => {
      e.preventDefault();
      setIsResizing(true);
      document.body.classList.add('resizing');
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('resizing');
    };

    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      // Calculate new width based on mouse position
      const newWidth = e.clientX;
      
      // Apply constraints
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
        
        // Store the width in localStorage for persistence
        localStorage.setItem('ricaLeftNavWidth', newWidth);
      }
    };

    // Load saved width from localStorage if available
    const savedWidth = localStorage.getItem('ricaLeftNavWidth');
    if (savedWidth) {
      const parsedWidth = parseInt(savedWidth, 10);
      if (!isNaN(parsedWidth) && parsedWidth >= minWidth && parsedWidth <= maxWidth) {
        setWidth(parsedWidth);
      }
    }

    // Add event listeners
    const resizer = resizerRef.current;
    if (resizer) {
      resizer.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove);
    }

    // Clean up
    return () => {
      if (resizer) {
        resizer.removeEventListener('mousedown', handleMouseDown);
      }
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.classList.remove('resizing');
    };
  }, [isResizing, minWidth, maxWidth]);

  return (
    <div 
      ref={panelRef} 
      className="resizable-container" 
      style={{ width: `${width}px` }}
    >
      {children}
      <div 
        ref={resizerRef} 
        className={`resizer ${isResizing ? 'active' : ''}`}
        style={{ left: `${width}px` }}
      />
    </div>
  );
};

export default ResizablePanel;
