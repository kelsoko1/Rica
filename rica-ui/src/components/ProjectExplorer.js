import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { useFileOperations } from '../hooks/useFileOperations';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useGitStatus } from '../hooks/useGitStatus';
import './ProjectExplorer.css';

export default function ProjectExplorer() {
  const [expandedFolders, setExpandedFolders] = useState({
    'src': true,
    'src/components': true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null });
  const [viewMode, setViewMode] = useState('explorer'); // explorer, search, git
  const fileTreeRef = useRef(null);
  const searchInputRef = useRef(null);
  
  const { gitStatus, getFileStatus, refreshStatus } = useGitStatus();
  
  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, item: null });
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  // Focus search input when switching to search view
  useEffect(() => {
    if (viewMode === 'search' && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [viewMode]);

  const toggleFolder = useCallback((path, e) => {
    e?.stopPropagation();
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  }, []);
  
  const { openFile, createFile, createFolder, deleteItem, renameItem } = useFileOperations();

  const selectFile = useCallback(async (file, e) => {
    e?.stopPropagation();
    setSelectedFile(file.path);
    try {
      await openFile(file.path);
    } catch (err) {
      setError(`Error opening file: ${err.message}`);
    }
  }, [openFile]);
  
  const handleContextMenu = useCallback((e, item) => {
    e.preventDefault();
    e.stopPropagation();
    // Ensure menu doesn't go off screen
    const x = Math.min(e.clientX, window.innerWidth - 160);
    const y = Math.min(e.clientY, window.innerHeight - 200);
    setContextMenu({
      visible: true,
      x,
      y,
      item
    });
  }, []);
  
  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
    setLoading(true);
    // Debounce search for better performance
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  
  const collapseAll = useCallback(() => {
    setExpandedFolders({});
  }, []);
  
  const expandAll = useCallback(() => {
    const allFolders = {};
    const addFolders = (items, path = '') => {
      items.forEach(item => {
        if (item.type === 'folder') {
          const itemPath = path ? `${path}/${item.name}` : item.name;
          allFolders[itemPath] = true;
          if (item.children) {
            addFolders(item.children, itemPath);
          }
        }
      });
    };
    
    addFolders(fileStructure);
    setExpandedFolders(allFolders);
  }, []);
  
  const switchView = useCallback((mode) => {
    setViewMode(mode);
  }, []);
  
  // Mock file structure
  const fileStructure = [
    {
      type: 'folder',
      name: 'src',
      path: 'src',
      children: [
        {
          type: 'folder',
          name: 'components',
          path: 'src/components',
          children: [
            { type: 'file', name: 'App.js', path: 'src/components/App.js', icon: 'js' },
            { type: 'file', name: 'CenterGraph.js', path: 'src/components/CenterGraph.js', icon: 'js' },
            { type: 'file', name: 'LeftNav.js', path: 'src/components/LeftNav.js', icon: 'js' },
            { type: 'file', name: 'ProjectExplorer.js', path: 'src/components/ProjectExplorer.js', icon: 'js' },
            { type: 'file', name: 'Starfield.js', path: 'src/components/Starfield.js', icon: 'js' },
            { type: 'file', name: 'StarrySidebar.js', path: 'src/components/StarrySidebar.js', icon: 'js' }
          ]
        },
        { type: 'file', name: 'index.js', path: 'src/index.js', icon: 'js' },
        { type: 'file', name: 'styles.css', path: 'src/styles.css', icon: 'css' }
      ]
    },
    {
      type: 'folder',
      name: 'public',
      path: 'public',
      children: [
        { type: 'file', name: 'index.html', path: 'public/index.html', icon: 'html' },
        { type: 'file', name: 'favicon.ico', path: 'public/favicon.ico', icon: 'image' }
      ]
    },
    { type: 'file', name: 'package.json', path: 'package.json', icon: 'json' },
    { type: 'file', name: 'README.md', path: 'README.md', icon: 'md' }
  ];
  
  const getFileIcon = (icon) => {
    switch(icon) {
      case 'js':
        return (
          <svg className="file-icon js" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'css':
        return (
          <svg className="file-icon css" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'html':
        return (
          <svg className="file-icon html" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'json':
        return (
          <svg className="file-icon json" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'md':
        return (
          <svg className="file-icon md" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'image':
        return (
          <svg className="file-icon image" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg className="file-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };
  
  const renderFileTree = (items, level = 0) => {
    return items.map((item, index) => {
      if (item.type === 'folder') {
        const isExpanded = expandedFolders[item.path] || false;
        
        return (
          <div key={item.path} className="file-tree-item">
            <div 
              className={`folder-item ${isExpanded ? 'expanded' : ''}`} 
              style={{ paddingLeft: `${level * 16}px` }}
              onClick={() => toggleFolder(item.path)}
            >
              <svg className="folder-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {isExpanded ? (
                  <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                ) : (
                  <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                )}
              </svg>
              <span className="item-name">{item.name}</span>
              <svg className="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d={isExpanded ? "M19 9L12 16L5 9" : "M9 18L15 12L9 6"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {isExpanded && item.children && (
              <div className="folder-children">
                {renderFileTree(item.children, level + 1)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div 
            key={item.path} 
            className="file-tree-item"
          >
            <div 
              className="file-item" 
              style={{ paddingLeft: `${level * 16}px` }}
            >
              {getFileIcon(item.icon)}
              <span className="item-name">{item.name}</span>
            </div>
          </div>
        );
      }
    });
  };
  
  // Filter files based on search query
  const filteredFileStructure = useCallback(() => {
    if (!searchQuery) return fileStructure;
    
    const searchResults = [];
    
    const searchInItems = (items, parentPath = '') => {
      items.forEach(item => {
        const itemPath = parentPath ? `${parentPath}/${item.name}` : item.name;
        
        if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          searchResults.push({
            ...item,
            path: itemPath,
            parentPath
          });
        }
        
        if (item.type === 'folder' && item.children) {
          searchInItems(item.children, itemPath);
        }
      });
    };
    
    searchInItems(fileStructure);
    return searchResults;
  }, [searchQuery]);
  
  // Render context menu
  const renderContextMenu = () => {
    if (!contextMenu.visible) return null;
    
    return (
      <div 
        className="context-menu" 
        style={{ top: contextMenu.y, left: contextMenu.x }}
        onClick={e => e.stopPropagation()}
      >
        {contextMenu.item?.type === 'folder' ? (
          // Folder context menu items
          <>
            <div className="context-menu-item" onClick={() => createFile(contextMenu.item.path)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              New File
            </div>
            <div className="context-menu-item" onClick={() => createFolder(contextMenu.item.path)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              New Folder
            </div>
            <div className="context-menu-separator"></div>
            <div className="context-menu-item" onClick={() => renameItem(contextMenu.item.path)}>Rename</div>
            <div className="context-menu-item" onClick={() => deleteItem(contextMenu.item.path)}>Delete</div>
          </>
        ) : (
          // File context menu items
          <>
            <div className="context-menu-item" onClick={() => openFile(contextMenu.item.path)}>Open</div>
            <div className="context-menu-item" onClick={() => openFile(contextMenu.item.path, true)}>Open to the Side</div>
            <div className="context-menu-separator"></div>
            <div className="context-menu-item" onClick={() => navigator.clipboard.writeText(contextMenu.item.path)}>Copy Path</div>
            <div className="context-menu-item" onClick={() => renameItem(contextMenu.item.path)}>Rename</div>
            <div className="context-menu-item" onClick={() => deleteItem(contextMenu.item.path)}>Delete</div>
          </>
        )}
      </div>
    );
  };

  // Initialize keyboard navigation
  useKeyboardNavigation({
    fileTreeRef,
    selectedFile,
    setSelectedFile,
    expandedFolders,
    setExpandedFolders,
    fileStructure
  });

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => setError(null)}>Dismiss</button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="project-explorer" 
           role="tree"
           aria-label="Project Files">
      {/* Explorer header with view buttons */}
      <div className="explorer-header">
        <h3>EXPLORER</h3>
        <div className="explorer-actions">
          <button 
            className="explorer-action-btn" 
            title="New File"
            onClick={() => console.log('New file')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className="explorer-action-btn" 
            title="Refresh"
            onClick={() => console.log('Refresh')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 4V10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.51 9.00001C4.01717 7.56645 4.87913 6.2788 6.01547 5.27543C7.1518 4.27206 8.52547 3.58489 10.0083 3.28545C11.4911 2.98601 13.0348 3.08436 14.4761 3.56895C15.9175 4.05354 17.2137 4.90521 18.24 6.00001L23 10M1 14L5.76 18C6.78632 19.0948 8.08252 19.9465 9.5239 20.4311C10.9653 20.9157 12.5089 21.014 13.9917 20.7146C15.4745 20.4151 16.8482 19.728 17.9845 18.7246C19.1209 17.7212 19.9828 16.4336 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className="explorer-action-btn" 
            title="Collapse All"
            onClick={collapseAll}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      {/* View selector tabs */}
      <div className="view-selector">
        <button 
          className={`view-btn ${viewMode === 'explorer' ? 'active' : ''}`}
          onClick={() => switchView('explorer')}
          title="Explorer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          className={`view-btn ${viewMode === 'search' ? 'active' : ''}`}
          onClick={() => switchView('search')}
          title="Search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          className={`view-btn ${viewMode === 'git' ? 'active' : ''}`}
          onClick={() => switchView('git')}
          title="Source Control"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 21V14H18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 10V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 14.01V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="18" cy="11" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 9C6 9 9 11 12 11C15 11 18 9 18 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 15C6 15 9 17 12 17C13.7509 17 15.5018 16.3333 17 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      {/* Search box - only visible in search view */}
      {viewMode === 'search' && (
        <div className="explorer-search">
          <div className="search-input-container">
            <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search in files"
              value={searchQuery}
              onChange={handleSearch}
              ref={searchInputRef}
            />
          </div>
        </div>
      )}
      
      {/* File tree */}
      <div className="file-tree" ref={fileTreeRef}>
        {viewMode === 'search' && searchQuery ? (
          // Search results view
          loading ? (
            <div className="loading-overlay">
              <div className="loading-spinner" />
            </div>
          ) : filteredFileStructure().length === 0 ? (
            <div className="empty-state">
              <p>No matching files found</p>
            </div>
          ) : filteredFileStructure().map((item) => (
            <div 
              key={item.path} 
              className={`file-item ${selectedFile === item.path ? 'active' : ''}`}
              onClick={(e) => selectFile(item, e)}
              onContextMenu={(e) => handleContextMenu(e, item)}
            >
              {getFileIcon(item.icon)}
              <span className="item-name">{item.name}</span>
              <span className="file-badge">{item.parentPath}</span>
            </div>
          ))
        ) : viewMode === 'git' ? (
          // Git view
          <div className="git-view">
            <div className="section-header">Changes</div>
            {gitStatus.loading ? (
              <div className="loading-overlay">
                <div className="loading-spinner" />
              </div>
            ) : gitStatus.error ? (
              <div className="error-container">
                <p>{gitStatus.error}</p>
                <button onClick={refreshStatus}>Retry</button>
              </div>
            ) : (
              <>
                {gitStatus.modified.map(file => (
                  <div key={file} className="file-item" onClick={() => selectFile({ path: file })}>
                    {getFileIcon(file.split('.').pop())}
                    <span className="item-name">{file.split('/').pop()}</span>
                    <span className="file-badge modified">M</span>
                  </div>
                ))}
                {gitStatus.added.map(file => (
                  <div key={file} className="file-item" onClick={() => selectFile({ path: file })}>
                    {getFileIcon(file.split('.').pop())}
                    <span className="item-name">{file.split('/').pop()}</span>
                    <span className="file-badge added">A</span>
                  </div>
                ))}
                {gitStatus.deleted.map(file => (
                  <div key={file} className="file-item" onClick={() => selectFile({ path: file })}>
                    {getFileIcon(file.split('.').pop())}
                    <span className="item-name">{file.split('/').pop()}</span>
                    <span className="file-badge deleted">D</span>
                  </div>
                ))}
                {gitStatus.renamed.map(file => (
                  <div key={file} className="file-item" onClick={() => selectFile({ path: file })}>
                    {getFileIcon(file.split('.').pop())}
                    <span className="item-name">{file.split('/').pop()}</span>
                    <span className="file-badge renamed">R</span>
                  </div>
                ))}
                {!gitStatus.modified.length && !gitStatus.added.length && 
                 !gitStatus.deleted.length && !gitStatus.renamed.length && (
                  <div className="empty-state">
                    <p>No changes detected</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          // Normal explorer view
          renderFileTree(fileStructure)
        )}
      </div>
      
      {/* Context menu */}
      {renderContextMenu()}
      </div>
    </ErrorBoundary>
  );
}
