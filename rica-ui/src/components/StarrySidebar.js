import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import ollamaService from '../services/OllamaService';
import './StarrySidebar.css';
const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Available commands for automation
const COMMANDS = {
  EXPLAIN: 'explain',
  EDIT: 'edit',
  CREATE: 'create',
  TEST: 'test',
  REFACTOR: 'refactor',
  FIND: 'find',
  DEBUG: 'debug'
};

export default function StarrySidebar({open, onClose, currentFile, onFileEdit}){
  // Add a ref to the sidebar element
  const sidebarRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [val, setVal] = useState('');
  const [credits, setCredits] = useState(25);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCommand, setActiveCommand] = useState(null);
  const [fileContext, setFileContext] = useState(null);
  const [suggestions, setSuggestions] = useState([
    "Explain this code",
    "Find bugs in this file",
    "Add error handling",
    "Refactor this function",
    "Generate unit tests",
    "Make this code more performant"
  ]);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Ensure the sidebar takes up the full height
    if (sidebarRef.current && open) {
      sidebarRef.current.style.height = '100vh';
    }

    // Add click outside handler
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && open) {
        onClose();
      }
    };

    // Add escape key handler
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [messages, open, onClose]);

  // Initialize with welcome message and context
  useEffect(() => {
    setMessages([
      {
        from: 'starry',
        text: 'Welcome to Starry AI. I can help you write, edit, and understand code. I can also help with debugging, testing, and refactoring. What would you like me to help you with?',
        timestamp: new Date().toISOString()
      }
    ]);

    // Set initial file context if a file is open
    if (currentFile) {
      setFileContext(currentFile);
    }
  }, [currentFile]);

  useEffect(() => { 
    // Fetch wallet balance
    fetchCredits();
  }, []);
  
  const fetchCredits = async () => {
    try {
      const r = await axios.get(API + '/wallet?org=demo');
      setCredits(r.data.credits);
      document.getElementById('bal').innerText = r.data.credits;
    } catch(e) {
      console.error('Failed to fetch wallet:', e);
    }
  };

  // Parse command from user input
  const parseCommand = (input) => {
    const words = input.toLowerCase().split(' ');
    for (const [cmd, value] of Object.entries(COMMANDS)) {
      if (words.includes(value)) {
        return value;
      }
    }
    return null;
  };

  // Handle code editing commands
  const handleCodeCommand = async (command, context) => {
    try {
      const response = await axios.post(API + '/starry', {
        prompt: context,
        command,
        file: fileContext,
        org: 'demo'
      });

      const suggestion = response.data.reply.content;
      if (command === COMMANDS.EDIT || command === COMMANDS.REFACTOR) {
        // Extract code changes and apply them
        const codeMatch = suggestion.match(/```(?:javascript|js|jsx|ts|tsx)?\n([\s\S]*?)\n```/);
        if (codeMatch && codeMatch[1] && onFileEdit) {
          onFileEdit(codeMatch[1]);
        }
      }

      return suggestion;
    } catch (error) {
      console.error('Error executing code command:', error);
      throw error;
    }
  };

  async function send() {
    if (!val || isLoading) return;
    
    const userMessage = val.trim();
    setMessages(m => [...m, {from: 'user', text: userMessage, timestamp: new Date().toISOString()}]);
    setVal('');
    setIsLoading(true);
    
    try {
      // Parse command from user message
      const command = parseCommand(userMessage);
      setActiveCommand(command);

      let responseText;
      
      // Use Ollama for AI responses
      const messages = ollamaService.formatCodeAssistanceMessages(
        userMessage,
        fileContext ? JSON.stringify(fileContext, null, 2) : null
      );
      
      responseText = await ollamaService.chat(messages, {
        temperature: 0.7,
        model: 'deepseek-r1:1.5b'
      });
      
      // Handle code editing commands if applicable
      if (command && (command === COMMANDS.EDIT || command === COMMANDS.REFACTOR)) {
        const codeMatch = responseText.match(/```(?:javascript|js|jsx|ts|tsx)?\n([\s\S]*?)\n```/);
        if (codeMatch && codeMatch[1] && onFileEdit) {
          onFileEdit(codeMatch[1]);
        }
      }
      
      // Generate new suggestions based on the conversation
      generateSuggestions(userMessage, responseText, command);
      
      // Add the response to messages
      setMessages(m => [...m, {
        from: 'starry', 
        text: responseText.slice(0, 1000),
        timestamp: new Date().toISOString(),
        command
      }]);
      
      // Update credits
      const r = await axios.get(API + '/wallet?org=demo');
      setCredits(r.data.credits);
      document.getElementById('bal').innerText = r.data.credits;
    } catch(e) {
      setMessages(m => [...m, {
        from: 'starry', 
        text: 'Error: ' + (e.response?.data?.error || e.message),
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
      setActiveCommand(null);
    }
  }
  
  // Generate new suggestions based on conversation context
  const generateSuggestions = (userMessage, aiResponse, command) => {
    const codingSuggestions = [
      "Explain this code",
      "Find bugs in this file",
      "Add error handling",
      "Refactor this function",
      "Generate unit tests",
      "Make this code more performant"
    ];
    
    const debuggingSuggestions = [
      "Debug this error",
      "Add logging",
      "Check for edge cases",
      "Validate input parameters",
      "Add try-catch blocks"
    ];
    
    const refactoringSuggestions = [
      "Extract this into a function",
      "Simplify this logic",
      "Convert to async/await",
      "Add TypeScript types",
      "Improve variable names"
    ];
    
    const testingSuggestions = [
      "Generate unit tests",
      "Add test cases",
      "Test edge cases",
      "Add integration test",
      "Mock external dependencies"
    ];
    
    // Select suggestions based on context and command
    const lowerUserMsg = userMessage.toLowerCase();
    const lowerAiResp = aiResponse.toLowerCase();
    
    if (command === COMMANDS.DEBUG || lowerUserMsg.includes('debug') || 
        lowerAiResp.includes('error') || lowerAiResp.includes('bug')) {
      setSuggestions(debuggingSuggestions);
    } else if (command === COMMANDS.REFACTOR || lowerUserMsg.includes('refactor') || 
               lowerUserMsg.includes('improve') || lowerUserMsg.includes('clean')) {
      setSuggestions(refactoringSuggestions);
    } else if (command === COMMANDS.TEST || lowerUserMsg.includes('test') || 
               lowerAiResp.includes('test') || lowerAiResp.includes('coverage')) {
      setSuggestions(testingSuggestions);
    } else {
      setSuggestions(codingSuggestions);
    }
  }

  // Refill credits function
  const refillCredits = async () => {
    try {
      await axios.post(API + '/wallet/refill', { org: 'demo', amount: 100 });
      await fetchCredits();
    } catch(e) {
      console.error('Failed to refill credits:', e);
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setVal(suggestion);
  };

  function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div ref={sidebarRef} className={`starry-sidebar ${open ? 'open' : ''}`}>
      <button onClick={onClose} className="starry-collapse-btn" title="Toggle Starry AI">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="starry-header">
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 17.75L5.82799 20.995L7.00699 14.122L2.00699 9.255L8.90699 8.255L11.993 2.002L15.079 8.255L21.979 9.255L16.979 14.122L18.158 20.995L12 17.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Starry AI
        </h2>
        <button onClick={onClose} className="starry-close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="starry-body">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 14C8.5 15.5 10 16.5 12 16.5C14 16.5 15.5 15.5 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 9H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 9H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h4>Welcome to Starry AI</h4>
            <p>Your intelligent assistant for cybersecurity analysis. Ask questions about threats, vulnerabilities, or request analysis of security data.</p>
            <div className="suggestion-chips">
              <button className="chip" onClick={() => setVal("Analyze recent threat actors targeting financial sector")}>Analyze threats</button>
              <button className="chip" onClick={() => setVal("Explain CVE-2023-38831 vulnerability")}>Explain vulnerability</button>
              <button className="chip" onClick={() => setVal("Summarize latest phishing campaigns")}>Phishing summary</button>
            </div>
          </div>
        ) : (
          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={'msg ' + (m.from === 'user' ? 'user' : 'starry') + (m.isError ? ' error' : '')}>
                <div className="meta">
                  {m.from === 'user' ? 'You' : 'Starry AI'}
                  <span className="timestamp">{formatTime(m.timestamp)}</span>
                </div>
                <div className="text">{m.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="msg starry loading">
                <div className="meta">Starry AI</div>
                <div className="loading-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="starry-input-container">
          {/* Suggestions */}
          <div className="starry-suggestions">
            {suggestions.map((suggestion, index) => (
              <button 
                key={index} 
                className="starry-suggestion" 
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
          
          {/* Input area */}
          <textarea 
            ref={textareaRef}
            className="starry-input"
            value={val} 
            onChange={e => setVal(e.target.value)} 
            placeholder="Ask Starry..."
            onKeyDown={e => { if(e.key === 'Enter' && e.ctrlKey) send(); }}
            disabled={isLoading}
          />
          <button 
            onClick={send} 
            disabled={!val.trim() || isLoading}
            className="starry-send"
          >
            {isLoading ? (
              <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60 30" strokeDashoffset="0">
                  <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                </path>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
