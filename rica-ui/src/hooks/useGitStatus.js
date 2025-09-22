import { useState, useEffect, useCallback } from 'react';

export function useGitStatus() {
  const [gitStatus, setGitStatus] = useState({
    modified: [],
    added: [],
    deleted: [],
    renamed: [],
    loading: false,
    error: null
  });

  const fetchGitStatus = useCallback(async () => {
    setGitStatus(prev => ({ ...prev, loading: true, error: null }));
    try {
      // TODO: Implement actual Git status check
      // This is a mock implementation
      const mockStatus = {
        modified: ['src/components/App.js'],
        added: ['src/components/ProjectExplorer.css'],
        deleted: [],
        renamed: []
      };
      setGitStatus(prev => ({
        ...prev,
        ...mockStatus,
        loading: false
      }));
    } catch (error) {
      setGitStatus(prev => ({
        ...prev,
        loading: false,
        error: `Failed to fetch Git status: ${error.message}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchGitStatus();
    // Set up polling for Git status updates
    const interval = setInterval(fetchGitStatus, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchGitStatus]);

  const getFileStatus = useCallback((filePath) => {
    if (gitStatus.modified.includes(filePath)) return 'modified';
    if (gitStatus.added.includes(filePath)) return 'added';
    if (gitStatus.deleted.includes(filePath)) return 'deleted';
    if (gitStatus.renamed.includes(filePath)) return 'renamed';
    return null;
  }, [gitStatus]);

  return {
    gitStatus,
    getFileStatus,
    refreshStatus: fetchGitStatus
  };
}
