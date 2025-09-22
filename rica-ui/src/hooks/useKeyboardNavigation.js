import { useEffect } from 'react';

export function useKeyboardNavigation({
  fileTreeRef,
  selectedFile,
  setSelectedFile,
  expandedFolders,
  setExpandedFolders,
  fileStructure
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!fileTreeRef.current) return;

      const findNextItem = (currentPath, direction) => {
        const flattenItems = (items, parentPath = '') => {
          return items.reduce((acc, item) => {
            const itemPath = parentPath ? `${parentPath}/${item.name}` : item.name;
            acc.push(itemPath);
            if (item.type === 'folder' && expandedFolders[itemPath] && item.children) {
              acc.push(...flattenItems(item.children, itemPath));
            }
            return acc;
          }, []);
        };

        const allItems = flattenItems(fileStructure);
        const currentIndex = allItems.indexOf(currentPath);
        
        if (currentIndex === -1) return allItems[0];
        
        if (direction === 'up') {
          return allItems[Math.max(0, currentIndex - 1)];
        } else {
          return allItems[Math.min(allItems.length - 1, currentIndex + 1)];
        }
      };

      const findItemByPath = (path) => {
        const parts = path.split('/');
        let current = fileStructure;
        let item = null;

        for (const part of parts) {
          item = current.find(i => i.name === part);
          if (!item) break;
          current = item.children || [];
        }

        return item;
      };

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (selectedFile) {
            const nextItem = findNextItem(selectedFile, 'up');
            setSelectedFile(nextItem);
          } else {
            setSelectedFile(findNextItem(null, 'up'));
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (selectedFile) {
            const nextItem = findNextItem(selectedFile, 'down');
            setSelectedFile(nextItem);
          } else {
            setSelectedFile(findNextItem(null, 'down'));
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (selectedFile) {
            const item = findItemByPath(selectedFile);
            if (item?.type === 'folder') {
              setExpandedFolders(prev => ({
                ...prev,
                [selectedFile]: true
              }));
            }
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (selectedFile) {
            const item = findItemByPath(selectedFile);
            if (item?.type === 'folder' && expandedFolders[selectedFile]) {
              setExpandedFolders(prev => ({
                ...prev,
                [selectedFile]: false
              }));
            } else {
              const parentPath = selectedFile.split('/').slice(0, -1).join('/');
              if (parentPath) {
                setSelectedFile(parentPath);
              }
            }
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedFile) {
            const item = findItemByPath(selectedFile);
            if (item?.type === 'folder') {
              setExpandedFolders(prev => ({
                ...prev,
                [selectedFile]: !prev[selectedFile]
              }));
            }
          }
          break;

        default:
          break;
      }
    };

    fileTreeRef.current?.addEventListener('keydown', handleKeyDown);
    return () => {
      fileTreeRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [fileTreeRef, selectedFile, setSelectedFile, expandedFolders, setExpandedFolders, fileStructure]);
}
