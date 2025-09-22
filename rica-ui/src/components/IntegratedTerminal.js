import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import './TerminalPanel.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function IntegratedTerminal() {
  const [activeTab, setActiveTab] = useState('terminal');
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [commandInput, setCommandInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [problems, setProblems] = useState([]);
  const [output, setOutput] = useState([]);
  const [debugOutput, setDebugOutput] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [terminalHeight, setTerminalHeight] = useState(300);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [taskList, setTaskList] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [terminalTheme, setTerminalTheme] = useState('dark'); // dark, light, or custom
  
  // Load initial problems on component mount
  useEffect(() => {
    // Scan for problems in the codebase
    scanCodebase();
    
    // Add initial output message
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setOutput([
      { text: '[System] Output console initialized', timestamp },
      { text: '[System] Connected to Rica API server', timestamp }
    ]);
    
    // Add initial debug message
    setDebugOutput([
      { text: 'Debug console initialized', timestamp },
      { text: 'Waiting for debug events...', timestamp }
    ]);
    
    // Load command history from localStorage
    try {
      const savedHistory = localStorage.getItem('terminalCommandHistory');
      if (savedHistory) {
        setCommandHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Error loading command history:', e);
    }
    
    // Load terminal preferences
    try {
      const savedHeight = localStorage.getItem('terminalHeight');
      if (savedHeight) {
        setTerminalHeight(parseInt(savedHeight));
      }
      
      const savedTheme = localStorage.getItem('terminalTheme');
      if (savedTheme) {
        setTerminalTheme(savedTheme);
      }
    } catch (e) {
      console.error('Error loading terminal preferences:', e);
    }
    
    // Initialize task list
    setTaskList([
      { id: 'build', name: 'npm: build', status: 'success', output: ['Build completed successfully'] },
      { id: 'test', name: 'npm: test', status: 'running', output: ['Running tests...'] },
      { id: 'lint', name: 'npm: lint', status: 'error', output: ['Error: ESLint found 3 errors and 2 warnings'] }
    ]);
  }, []);
  
  // Function to scan codebase for problems
  const scanCodebase = async () => {
    try {
      // In a real implementation, this would call an API endpoint
      // that would scan the codebase for problems
      
      // For now, we'll add some realistic problems that might be found
      setProblems([
        { 
          id: 1,
          type: 'warning',
          title: 'Unused variable \'result\'',
          location: 'CenterGraph.js:45:10',
          code: 'no-unused-vars',
          message: 'Variable is defined but never used'
        },
        { 
          id: 2,
          type: 'error',
          title: 'Missing dependency in useEffect',
          location: 'StarrySidebar.js:32:6',
          code: 'react-hooks/exhaustive-deps',
          message: 'React Hook useEffect has a missing dependency: \'messages\''
        },
        { 
          id: 3,
          type: 'warning',
          title: 'Prop \'className\' is not used',
          location: 'LeftNav.js:31:24',
          code: 'react/no-unused-prop-types',
          message: 'Prop is defined but never used in the component'
        }
      ]);
      
      // In a real implementation, we would also listen for file changes
      // and update the problems list accordingly
    } catch (error) {
      console.error('Error scanning codebase:', error);
    }
  };
  
  // Function to add a log message to the output
  const addOutputLog = (text, className) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setOutput(prev => [...prev, { text, className, timestamp }]);
  };
  
  // Function to add a debug message
  const addDebugLog = (text, className) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setDebugOutput(prev => [...prev, { text, className, timestamp }]);
  };
  
  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);
  
  // Load initial terminal history on component mount
  useEffect(() => {
    // Get system information as initial output
    executeCommand('echo "Rica Terminal - Connected to API server"');
  }, []);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!commandInput.trim() || isExecuting) return;
    
    // Add the command to history
    setTerminalHistory(prev => [
      ...prev, 
      { type: 'command', text: commandInput }
    ]);
    
    // Add to command history for up/down navigation
    const newHistory = [
      commandInput,
      ...commandHistory.filter(cmd => cmd !== commandInput).slice(0, 49) // Keep last 50 unique commands
    ];
    setCommandHistory(newHistory);
    setHistoryIndex(-1);
    
    // Save to localStorage
    try {
      localStorage.setItem('terminalCommandHistory', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Error saving command history:', e);
    }
    
    // Execute the command
    executeCommand(commandInput);
    
    // Clear input
    setCommandInput('');
  };
  
  const executeCommand = async (command) => {
    const cmd = command.trim();
    
    // Handle built-in commands
    if (cmd === 'clear') {
      setTerminalHistory([]);
      return;
    }
    
    if (cmd === 'help') {
      setTerminalHistory(prev => [
        ...prev,
        { type: 'output', text: 'Available commands:' },
        { type: 'output', text: '  help - Show this help message' },
        { type: 'output', text: '  clear - Clear terminal history' },
        { type: 'output', text: '  ls - List files in current directory' },
        { type: 'output', text: '  scan - Run security scan' },
        { type: 'output', text: '  threat-actors - List threat actors from OpenCTI' },
        { type: 'output', text: '  simulate - Run a simulation via OpenBAS' }
      ]);
      return;
    }
    
    setIsExecuting(true);
    
    try {
      if (cmd === 'threat-actors') {
        // Fetch threat actors from the API
        try {
          const response = await axios.get(`${API}/threat-actors`);
          const actors = response.data.items;
          
          setTerminalHistory(prev => [
            ...prev,
            { type: 'output', text: 'Fetching threat actors from OpenCTI...' },
            { type: 'output', text: `Found ${actors.length} threat actors:`, className: 'success' },
            ...actors.map(actor => ({ 
              type: 'output', 
              text: `  - ${actor.name}${actor.description ? ': ' + actor.description.substring(0, 50) + '...' : ''}` 
            }))
          ]);
          
          // Also add to problems if any suspicious actors found
          const suspiciousActors = actors.filter(a => a.name.includes('APT'));
          if (suspiciousActors.length > 0) {
            setProblems(prev => [
              ...prev,
              ...suspiciousActors.map(actor => ({
                id: Date.now() + Math.random(),
                type: 'warning',
                title: `Suspicious threat actor: ${actor.name}`,
                location: 'threat-intel:' + actor.id,
                code: 'security/apt-detection',
                message: actor.description?.substring(0, 100) || 'Advanced Persistent Threat detected'
              }))
            ]);
          }
        } catch (error) {
          setTerminalHistory(prev => [
            ...prev,
            { type: 'output', text: `Error fetching threat actors: ${error.message}`, className: 'error' }
          ]);
        }
      } else if (cmd.startsWith('simulate')) {
        // Run a simulation via the API
        try {
          const simName = cmd.split(' ')[1] || 'default-sim';
          const response = await axios.post(`${API}/simulate`, { 
            name: simName,
            target: { name: 'Test Target' },
            scenario: { name: 'Basic Scenario' },
            org: 'demo'
          });
          
          setTerminalHistory(prev => [
            ...prev,
            { type: 'output', text: `Running simulation: ${simName}...` },
            { type: 'output', text: 'Simulation started successfully', className: 'success' },
            { type: 'output', text: `Credits remaining: ${response.data.credits}` }
          ]);
          
          // Update credits display
          document.getElementById('bal').innerText = response.data.credits;
          
          // Add simulation output
          setOutput(prev => [
            ...prev,
            { 
              text: `[Simulation] Started: ${simName}`, 
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
            },
            { 
              text: '[Simulation] Running attack vectors...', 
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
            },
            { 
              text: '[Simulation] Completed with findings', 
              className: 'success',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
            }
          ]);
        } catch (error) {
          setTerminalHistory(prev => [
            ...prev,
            { type: 'output', text: `Error running simulation: ${error.message}`, className: 'error' }
          ]);
        }
      } else if (cmd === 'scan') {
        // Run a security scan
        setTerminalHistory(prev => [
          ...prev,
          { type: 'output', text: 'Starting security scan...' },
          { type: 'output', text: 'Scanning network endpoints...' },
          { type: 'output', text: 'Checking for vulnerabilities...' }
        ]);
        
        // Simulate API call delay
        setTimeout(() => {
          setTerminalHistory(prev => [
            ...prev,
            { type: 'output', text: 'Found potential security issues:', className: 'warning' },
            { type: 'output', text: '  - Outdated dependency: react-scripts (5.0.1)' },
            { type: 'output', text: '  - Insecure API endpoint: /api/wallet/refill' },
            { type: 'output', text: 'Scan complete. See Problems tab for details.' }
          ]);
          
          // Add to problems
          setProblems(prev => [
            ...prev,
            { 
              id: Date.now(),
              type: 'warning',
              title: 'Outdated dependency: react-scripts (5.0.1)',
              location: 'package.json:8:5',
              code: 'security/outdated-dependency',
              message: 'This version has known vulnerabilities'
            },
            { 
              id: Date.now() + 1,
              type: 'warning',
              title: 'Insecure API endpoint: /api/wallet/refill',
              location: 'rica-api/index.js:112:3',
              code: 'security/insecure-endpoint',
              message: 'Endpoint lacks proper authentication'
            }
          ]);
          
          setIsExecuting(false);
        }, 2000);
        return;
      } else {
        // For other commands, try to execute via API or show error
        setTerminalHistory(prev => [
          ...prev,
          { type: 'output', text: `Executing: ${cmd}` }
        ]);
        
        // In a real implementation, you would send the command to a backend API
        // that would execute it and return the result
        setTimeout(() => {
          if (cmd === 'ls') {
            setTerminalHistory(prev => [
              ...prev,
              { type: 'output', text: 'package.json  README.md  src/  public/  node_modules/' }
            ]);
          } else if (cmd.startsWith('npm')) {
            setTerminalHistory(prev => [
              ...prev,
              { type: 'output', text: 'Executing npm command...' },
              { type: 'output', text: 'This command would execute in a real environment.' }
            ]);
          } else {
            setTerminalHistory(prev => [
              ...prev,
              { type: 'output', text: `Command executed: ${cmd}` },
              { type: 'output', text: 'To execute real system commands, connect to a backend API with command execution capabilities.' }
            ]);
          }
          setIsExecuting(false);
        }, 1000);
      }
    } catch (error) {
      setTerminalHistory(prev => [
        ...prev,
        { type: 'output', text: `Error: ${error.message}`, className: 'error' }
      ]);
      setIsExecuting(false);
    }
  };
  
  const focusTerminal = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const clearTerminal = () => {
    setTerminalHistory([]);
  };
  
  const clearProblems = () => {
    setProblems([]);
  };
  
  const clearOutput = () => {
    setOutput([]);
  };
  
  const clearDebug = () => {
    setDebugOutput([]);
  };
  
  const getTabContent = () => {
    switch(activeTab) {
      case 'terminal':
        return (
          <div className="terminal-panel" onClick={focusTerminal}>
            <div className="terminal-content">
              <div className="terminal-output" ref={terminalRef}>
                {terminalHistory.map((item, index) => {
                  if (item.type === 'command') {
                    return (
                      <div key={index} className="command-line">
                        <span className="command-prompt">$</span>
                        <span className="command-text">{item.text}</span>
                      </div>
                    );
                  } else {
                    return (
                      <div key={index} className="output-line">
                        <span className="output-text">{item.text}</span>
                      </div>
                    );
                  }
                })}
                {isExecuting && (
                  <div className="command-executing">
                    <span className="loading-indicator">...</span>
                  </div>
                )}
              </div>
              <form onSubmit={handleCommandSubmit} className="terminal-input-container">
                <span className="terminal-prompt">$</span>
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="terminal-input"
                  placeholder="Type a command..."
                  disabled={isExecuting}
                  ref={inputRef}
                  autoFocus
                />
              </form>
            </div>
          </div>
        );
      
      case 'problems':
        return (
          <div className="problems-panel">
            <div className="panel-header">
              <span>{problems.length} Problems</span>
              <div className="panel-actions">
                <button className="panel-action-btn" onClick={clearProblems} title="Clear All">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="problems-content">
              {problems.length === 0 ? (
                <div className="empty-state">No problems to display!</div>
              ) : (
                problems.map(problem => (
                  <div key={problem.id} className={`problem-item ${problem.type}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {problem.type === 'warning' ? (
                        <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      ) : (
                        <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      )}
                      {problem.type === 'warning' ? (
                        <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      ) : (
                        <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      )}
                      {problem.type === 'warning' && (
                        <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.6415 19.6871 1.81442 19.9905C1.98734 20.2939 2.23675 20.5467 2.53773 20.7238C2.83871 20.9009 3.18082 20.9961 3.53 21H20.47C20.8192 20.9961 21.1613 20.9009 21.4623 20.7238C21.7633 20.5467 22.0127 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      )}
                    </svg>
                    <div className="problem-details">
                      <div className="problem-title">{problem.title}</div>
                      <div className="problem-location">{problem.location}</div>
                      <div className="problem-message">{problem.message}</div>
                      <div className="problem-code">{problem.code}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      
      case 'output':
        return (
          <div className="output-panel">
            <div className="panel-header">
              <span>Output</span>
              <div className="panel-actions">
                <button className="panel-action-btn" onClick={clearOutput} title="Clear Output">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="output-content">
              {output.length === 0 ? (
                <div className="empty-state">No output to display!</div>
              ) : (
                output.map((line, index) => (
                  <div key={index} className={`output-line ${line.className || ''}`}>
                    <span className="timestamp">{line.timestamp}</span>
                    <span>{line.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      
      case 'debug':
        return (
          <div className="debug-panel">
            <div className="panel-header">
              <span>Debug Console</span>
              <div className="panel-actions">
                <button className="panel-action-btn" onClick={clearDebug} title="Clear Console">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="debug-content">
              {debugOutput.length === 0 ? (
                <div className="empty-state">No debug output to display!</div>
              ) : (
                debugOutput.map((line, index) => (
                  <div key={index} className={`debug-line ${line.className || ''}`}>
                    <span className="timestamp">{line.timestamp}</span>
                    <span>{line.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      
      case 'tasks':
        return (
          <div className="tasks-panel">
            <div className="panel-header">
              <span>Tasks</span>
              <div className="panel-actions">
                <button className="panel-action-btn" title="Run Task">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 3L19 12L5 21V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="panel-action-btn" title="Restart Task">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 4V10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3.51 9.00001C4.01717 7.56455 4.87913 6.2854 6.01547 5.27543C7.1518 4.26547 8.52547 3.55978 10.0083 3.22427C11.4911 2.88877 13.0348 2.93436 14.4952 3.35679C15.9556 3.77922 17.2853 4.56473 18.36 5.64001L23 10M1 14L5.64 18.36C6.71475 19.4353 8.04437 20.2208 9.50481 20.6432C10.9652 21.0657 12.5089 21.1112 13.9917 20.7757C15.4745 20.4402 16.8482 19.7346 17.9845 18.7246C19.1209 17.7146 19.9828 16.4355 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="tasks-list">
              {taskList.length === 0 ? (
                <div className="empty-state">No tasks to display!</div>
              ) : (
                taskList.map((task) => (
                  <div 
                    key={task.id} 
                    className={`task-item ${activeTask === task.id ? 'active' : ''}`}
                    onClick={() => selectTask(task.id)}
                  >
                    <div className={`task-status ${task.status}`}></div>
                    <div className="task-name">{task.name}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Handle keyboard navigation in command history
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCommandInput(commandHistory[newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommandInput(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion for common commands
      const commonCommands = ['help', 'clear', 'ls', 'scan', 'threat-actors', 'simulate'];
      if (commandInput) {
        const match = commonCommands.find(cmd => cmd.startsWith(commandInput));
        if (match) {
          setCommandInput(match);
        }
      }
    }
  }, [commandHistory, historyIndex, commandInput]);

  // Handle terminal resize
  const startResize = useCallback((e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = terminalHeight;
    
    const handleMouseMove = (moveEvent) => {
      const newHeight = Math.max(100, startHeight - (moveEvent.clientY - startY));
      setTerminalHeight(newHeight);
      
      // Save preference
      try {
        localStorage.setItem('terminalHeight', newHeight.toString());
      } catch (err) {
        console.error('Error saving terminal height:', err);
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [terminalHeight]);

  // Toggle terminal maximize/restore
  const toggleMaximize = useCallback(() => {
    setIsMaximized(!isMaximized);
  }, [isMaximized]);

  // Toggle terminal visibility
  const toggleVisibility = useCallback(() => {
    setIsVisible(!isVisible);
  }, [isVisible]);

  // Change terminal theme
  const changeTheme = useCallback((theme) => {
    setTerminalTheme(theme);
    try {
      localStorage.setItem('terminalTheme', theme);
    } catch (err) {
      console.error('Error saving terminal theme:', err);
    }
  }, []);

  // Handle task selection
  const selectTask = useCallback((taskId) => {
    setActiveTask(taskId);
    setActiveTab('output');
  }, []);

  return (
    <div 
      className={`integrated-terminal ${terminalTheme}-theme ${isMaximized ? 'maximized' : ''} ${isVisible ? '' : 'hidden'}`}
      style={{ height: isMaximized ? '100%' : `${terminalHeight}px` }}
    >
      <div className="terminal-resize-handle" onMouseDown={startResize}></div>
      
      <div className="terminal-tabs">
        <button 
          className={`terminal-tab ${activeTab === 'terminal' ? 'active' : ''}`}
          onClick={() => setActiveTab('terminal')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 17L10 11L4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Terminal</span>
        </button>
        <button 
          className={`terminal-tab ${activeTab === 'problems' ? 'active' : ''}`}
          onClick={() => setActiveTab('problems')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.6415 19.6871 1.81442 19.9905C1.98734 20.2939 2.23675 20.5467 2.53773 20.7238C2.83871 20.9009 3.18082 20.9961 3.53 21H20.47C20.8192 20.9961 21.1613 20.9009 21.4623 20.7238C21.7633 20.5467 22.0127 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Problems</span>
          {problems.length > 0 && <span className="badge">{problems.length}</span>}
        </button>
        <button 
          className={`terminal-tab ${activeTab === 'output' ? 'active' : ''}`}
          onClick={() => setActiveTab('output')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Output</span>
        </button>
        <button 
          className={`terminal-tab ${activeTab === 'debug' ? 'active' : ''}`}
          onClick={() => setActiveTab('debug')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Debug Console</span>
        </button>
        <button 
          className={`terminal-tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Tasks</span>
          <span className="badge">{taskList.filter(t => t.status === 'running').length}</span>
        </button>
        
        <div className="terminal-actions">
          <div className="terminal-theme-selector">
            <button 
              className={`theme-btn ${terminalTheme === 'dark' ? 'active' : ''}`} 
              onClick={() => changeTheme('dark')} 
              title="Dark Theme"
            >
              <span>🌙</span>
            </button>
            <button 
              className={`theme-btn ${terminalTheme === 'light' ? 'active' : ''}`} 
              onClick={() => changeTheme('light')} 
              title="Light Theme"
            >
              <span>☀️</span>
            </button>
          </div>
          <button className="terminal-action-btn" onClick={toggleMaximize} title={isMaximized ? "Restore" : "Maximize Panel"}>
            {isMaximized ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 14H10V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 10H14V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 10L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 21L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 8V5C21 4.46957 20.7893 3.96086 20.4142 3.58579C20.0391 3.21071 19.5304 3 19 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 16V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <button className="terminal-action-btn" onClick={toggleVisibility} title="Hide Panel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="terminal-content-area">
        {getTabContent()}
      </div>
      
      {/* Terminal status bar */}
      <div className="terminal-status-bar">
        <div className="status-item">
          <span className="status-icon">⚡</span>
          <span>Rica Terminal</span>
        </div>
        <div className="status-item">
          <span className="status-icon">📁</span>
          <span>c:\Users\kelvin\Desktop\Rica</span>
        </div>
        <div className="status-item">
          <span className="status-icon">🔌</span>
          <span>Connected</span>
        </div>
        <div className="status-spacer"></div>
        <div className="status-item">
          <span className="encoding-indicator">UTF-8</span>
        </div>
        <div className="status-item">
          <span className="line-ending-indicator">CRLF</span>
        </div>
      </div>
    </div>
  );
}
