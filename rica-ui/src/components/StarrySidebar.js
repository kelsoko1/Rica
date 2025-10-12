import React, {useState, useEffect, useRef} from 'react';
import ollamaService from '../services/OllamaService';
import terminalService from '../services/TerminalService';
import activepiecesService from '../services/activepiecesService';
import vircadiaService from '../services/vircadiaService';
import './StarrySidebar.css';

const StarrySidebar = ({open, onClose, codeContext, onApplyEdit}) => {
  const sidebarRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState(''); 
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(Date.now().toString());
  const [availableModels, setAvailableModels] = useState([]); 
  const [savedChats, setSavedChats] = useState([]);
  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('Loading models from Ollama service...');
        const models = await ollamaService.listModels();
        
        if (models && models.length > 0) {
          console.log('Available models:', models);
          
          // Transform models for the UI
          const transformedModels = models.map(model => ({
            id: model.model || model.name,
            name: model.name,
            description: model.details?.description || model.details?.family || model.name,
            details: model.details
          }));
          
          console.log('Transformed models:', transformedModels);
          
          setAvailableModels(transformedModels);
          
          // Set the first model as default if none is selected
          if (!selectedModel && transformedModels.length > 0) {
            const defaultModel = transformedModels[0].id;
            console.log('Setting default model:', defaultModel);
            setSelectedModel(defaultModel);
            await ollamaService.setModel(defaultModel);
          }
        } else {
          console.warn('No models found, using fallback models');
          // Fallback to default models if none found
          const defaultModels = [
            { 
              id: 'deepseek-r1:1.5b', 
              name: 'DeepSeek R1 1.5B', 
              description: 'Fast and efficient model for general use',
              details: { family: 'DeepSeek' }
            }
          ];
          
          setAvailableModels(defaultModels);
          setSelectedModel('deepseek-r1:1.5b');
          await ollamaService.setModel('deepseek-r1:1.5b');
        }
      } catch (error) {
        console.error('Failed to load models:', error);
        // Fallback to a minimal working model on error
        const defaultModels = [
          { 
            id: 'deepseek-r1:1.5b', 
            name: 'DeepSeek R1 1.5B', 
            description: 'Fast and efficient model for general use',
            details: { family: 'DeepSeek' }
          }
        ];
        
        setAvailableModels(defaultModels);
        setSelectedModel('deepseek-r1:1.5b');
        await ollamaService.setModel('deepseek-r1:1.5b');
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingMessage]);

  useEffect(() => {
    const saved = localStorage.getItem('starry-chat-history');
    if (saved) {
      try {
        setSavedChats(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1 && currentChatId) {
      const chatToSave = {
        id: currentChatId,
        title: messages[1]?.content.substring(0, 50) + '...' || 'New Chat',
        messages: messages,
        timestamp: new Date().toISOString(),
        model: selectedModel,
      };
      
      setSavedChats(prev => {
        const updated = prev.filter(chat => chat.id !== currentChatId);
        const newChats = [chatToSave, ...updated].slice(0, 20); 
        localStorage.setItem('starry-chat-history', JSON.stringify(newChats));
        return newChats;
      });
    }
  }, [messages, currentChatId, selectedModel]);

  useEffect(() => {
    if (messages.length === 0) {
      const newChatId = Date.now().toString();
      setCurrentChatId(newChatId);
      setMessages([{ role: 'assistant', content: '👋 Hello Kelvin! I\'m Starry AI, your intelligent coding assistant powered by Ollama.\n\n🚀 I can help you with:\n• Code explanation and debugging\n• Writing and refactoring code\n• Best practices and optimization\n• Technical questions and documentation\n\nWhat would you like to work on today?', timestamp: new Date().toISOString() }]);
    }
  }, [messages.length]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [open, onClose]);

  useEffect(() => {
    if (codeContext && open) {
      const { code, language, selection } = codeContext;
      const contextMessage = {
        role: 'system',
        content: `Code context provided (${language}):\n\`\`\`${language}\n${selection || code}\n\`\`\``
      };
      
      // Only add if we haven't already
      if (!messages.some(msg => msg.content === contextMessage.content)) {
        setMessages(prev => [contextMessage, ...prev]);
        setInputValue('/edit ');
      }
    }
  }, [codeContext, open]);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const workflows = await activepiecesService.listWorkflows();
        setWorkflows(workflows);
      } catch (error) {
        console.error('Failed to load workflows', error);
      }
    };
    
    fetchWorkflows();
  }, []);

  const getWorkflow = (command) => {
    return workflows.find(wf => 
      wf.name.toLowerCase().includes(command) ||
      wf.description.toLowerCase().includes(command)
    );
  };

  const parseParameters = (command, workflow) => {
    const params = {};
    workflow.parameters.forEach(param => {
      const regex = new RegExp(`${param}=([^\\s]+)`);
      const match = command.match(regex);
      if (match) params[param] = match[1];
    });
    return params;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMessage = inputValue.trim();
    setInputValue('');
    const newUserMessage = { role: 'user', content: userMessage, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingMessage('');
    try {
      const chatHistory = [...conversationHistory, newUserMessage];
      if (userMessage.startsWith('/automate ')) {
        const command = userMessage.replace('/automate ', '');
        const workflow = getWorkflow(command);
        
        if (!workflow) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `❌ No workflow found matching: "${command}"`,
            isError: true,
            timestamp: new Date().toISOString()
          }]);
          return;
        }
        
        const inputs = parseParameters(command, workflow);
        
        try {
          const result = await activepiecesService.runWorkflow(workflow.id, inputs);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `✅ Workflow executed: ${workflow.id}\nInputs: ${JSON.stringify(inputs)}\nResult: ${JSON.stringify(result)}`,
            timestamp: new Date().toISOString()
          }]);
        } catch (error) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `❌ Workflow failed: ${error.message}`,
            isError: true,
            timestamp: new Date().toISOString()
          }]);
        }
        return;
      }
      if (userMessage.startsWith('/vircadia ')) {
        const commandText = userMessage.replace('/vircadia ', '');
        const [command, ...args] = commandText.split(' ');
        
        try {
          const params = {};
          args.forEach(arg => {
            const [key, value] = arg.split('=');
            params[key] = value;
          });
          
          const result = await vircadiaService.sendCommand(command, params);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `✅ Vircadia command executed: ${command}\nResult: ${JSON.stringify(result)}`,
            timestamp: new Date().toISOString()
          }]);
        } catch (error) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `❌ Vircadia command failed: ${error.message}`,
            isError: true,
            timestamp: new Date().toISOString()
          }]);
        }
        return;
      }
      let fullResponse = '';
      await ollamaService.streamChat(chatHistory, (chunk) => {
        fullResponse += chunk;
        setStreamingMessage(fullResponse);
      }, { model: selectedModel, temperature: 0.7 });
      const assistantMessage = { role: 'assistant', content: fullResponse, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMessage]);
      setConversationHistory([...chatHistory, assistantMessage]);
      setStreamingMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setIsConnected(false);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Connection Error: ${error.message}\n\nPlease make sure Ollama is running at http://72.60.133.11:2022\n\nTroubleshooting:\n• Check if the Ollama server is running\n• Verify the model is installed: ollama pull ${selectedModel}\n• Check network connectivity`, 
        timestamp: new Date().toISOString(), 
        isError: true 
      }]);
      setTimeout(() => setIsConnected(true), 5000);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setMessages([{ role: 'assistant', content: '👋 Conversation cleared! How can I help you?', timestamp: new Date().toISOString() }]);
    setConversationHistory([]);
    setStreamingMessage('');
  };

  const loadChat = (chat) => {
    setCurrentChatId(chat.id);
    setMessages(chat.messages);
    setConversationHistory(chat.messages.filter(m => m.role !== 'assistant' || !m.isError));
    const modelToUse = chat.model || availableModels[0].id;
    setSelectedModel(modelToUse);
    ollamaService.setModel(modelToUse);
    setShowHistory(false);
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    setSavedChats(prev => {
      const updated = prev.filter(chat => chat.id !== chatId);
      localStorage.setItem('starry-chat-history', JSON.stringify(updated));
      return updated;
    });
  };

  const startNewChat = () => {
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setMessages([{ role: 'assistant', content: '👋 Hello! How can I help you today?', timestamp: new Date().toISOString() }]);
    setConversationHistory([]);
    setStreamingMessage('');
    setShowHistory(false);
  };

  const handleModelChange = async (modelId) => {
    try {
      // Update the model in the Ollama service
      await ollamaService.setModel(modelId);
      // Update the local state
      setSelectedModel(modelId);
      setShowModelSelector(false);
      
      // Add a system message to inform about the model change
      const modelInfo = availableModels.find(m => m.id === modelId) || { name: modelId };
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Model changed to: ${modelInfo.name || modelId}`,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Failed to switch model:', error);
      // Revert to the previous model if the switch fails
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Failed to switch model: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
  };

  useEffect(() => {
    ollamaService.setModel(selectedModel);
  }, [selectedModel]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleApplyEdit = (codeBlock) => {
    if (onApplyEdit) {
      onApplyEdit(codeBlock);
    }
  };

  const runTerminalCommand = async (command) => {
    try {
      const result = await terminalService.runCommand(command, process.cwd());
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: result,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Error: ${error.message}`,
        isError: true,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  if (!open) return null;

  return (
    <div ref={sidebarRef} className={`starry-sidebar ${open ? 'open' : ''}`}>
      <div className="starry-header">
        <div className="starry-header-left">
          <div className="starry-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17.75L5.82799 20.995L7.00699 14.122L2.00699 9.255L8.90699 8.255L11.993 2.002L15.079 8.255L21.979 9.255L16.979 14.122L18.158 20.995L12 17.75Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="starry-title">
            <h3>Starry AI</h3>
            <span className="starry-subtitle">Powered by Ollama</span>
          </div>
        </div>
        <div className="starry-header-right">
          <button className="history-btn" onClick={() => setShowHistory(!showHistory)} title="Chat History">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {savedChats.length > 0 && <span className="history-badge">{savedChats.length}</span>}
          </button>
          <button className="model-selector-btn" onClick={() => setShowModelSelector(!showModelSelector)} title="Select AI Model">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3H15M3 9V15M21 9V15M9 21H15M12 3V21M3 12H21M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="clear-btn" onClick={clearConversation} title="New conversation">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19M6 6V20C6 21 5 22 4 22H2C1 22 0 21 0 20V7.83C0 7.3 0.79 6.79 1.41 6.42L4.42 3.59C4.84 3.21 5.33 3 5.93 3H10C12.1 3 13 3.9 13 5V4ZM16 20H4V8H6V20H16ZM10 5H15L19 9V16H10V5Z" fill="currentColor"/>
            </svg>
          </button>
          <button className="close-btn" onClick={onClose} title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      {showHistory && (
        <div className="history-panel">
          <div className="history-header">
            <h4>Chat History</h4>
            <button className="new-chat-btn" onClick={startNewChat}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19M6 6V20C6 21 5 22 4 22H2C1 22 0 21 0 20V7.83C0 7.3 0.79 6.79 1.41 6.42L4.42 3.59C4.84 3.21 5.33 3 5.93 3H10C12.1 3 13 3.9 13 5V4ZM16 20H4V8H6V20H16ZM10 5H15L19 9V16H10V5Z" fill="currentColor"/>
              </svg>
              New Chat
            </button>
          </div>
          <div className="history-list">
            {savedChats.length === 0 ? (
              <div className="history-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p>No chat history yet</p>
                <span>Start a conversation to see it here</span>
              </div>
            ) : (
              savedChats.map(chat => (
                <div key={chat.id} className={`history-item ${currentChatId === chat.id ? 'active' : ''}`} onClick={() => loadChat(chat)}>
                  <div className="history-item-content">
                    <div className="history-item-title">{chat.title}</div>
                    <div className="history-item-meta">
                      <span className="history-item-model">{availableModels.find(m => m.id === chat.model)?.name || chat.model}</span>
                      <span className="history-item-time">{new Date(chat.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="history-item-preview">
                      {chat.messages.length} messages
                    </div>
                  </div>
                  <button className="history-item-delete" onClick={(e) => deleteChat(chat.id, e)} title="Delete chat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {showModelSelector && (
        <div className="model-selector-dropdown">
          <div className="model-selector-header">
            <h4>Select AI Model</h4>
            <span className="model-count">{availableModels.length} models</span>
          </div>
          <div className="model-list">
            {availableModels.map(model => (
              <button key={model.id} className={`model-item ${selectedModel === model.id ? 'active' : ''}`} onClick={() => handleModelChange(model.id)}>
                <div className="model-info">
                  <div className="model-name">{model.name}</div>
                  <div className="model-description">{model.description}</div>
                </div>
                {selectedModel === model.id && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="starry-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? (
                <div className="user-avatar">KD</div>
              ) : (
                <div className="ai-avatar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 17.75L5.82799 20.995L7.00699 14.122L2.00699 9.255L8.90699 8.255L11.993 2.002L15.079 8.255L21.979 9.255L16.979 14.122L18.158 20.995L12 17.75Z" fill="currentColor"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="message-content">
              {msg.role === 'assistant' && (
                <div className="message-header">
                  <div className="message-role">Starry AI</div>
                  <div className="message-time">{formatTime(msg.timestamp)}</div>
                </div>
              )}
              <div className="message-text">
                {msg.isError ? (
                  <pre>{msg.content}</pre>
                ) : (
                  <>
                    {msg.content}
                    {!msg.isError && msg.content.includes('```') && onApplyEdit && (
                      <button className="apply-edit-btn" onClick={() => handleApplyEdit(msg.content)}>
                        Apply Edit
                      </button>
                    )}
                    {msg.role === 'assistant' && msg.content.startsWith('$ ') && (
                      <button className="run-command-btn" onClick={() => runTerminalCommand(msg.content.substring(2))}>
                        Run Command
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {isStreaming && streamingMessage && (
          <div className="message assistant streaming">
            <div className="message-avatar">
              <div className="ai-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 17.75L5.82799 20.995L7.00699 14.122L2.00699 9.255L8.90699 8.255L11.993 2.002L15.079 8.255L21.979 9.255L16.979 14.122L18.158 20.995L12 17.75Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-role">Starry AI</span>
                <span className="typing-indicator">
                  <span></span><span></span><span></span>
                </span>
              </div>
              <div className="message-text">{streamingMessage}</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="starry-input-container">
        <div className="model-indicator">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill={isConnected ? "#4ade80" : "#ef4444"}/>
          </svg>
          <span>{availableModels.find(m => m.id === selectedModel)?.name}</span>
          <span style={{marginLeft: '8px', fontSize: '10px', opacity: 0.6}}>({isConnected ? 'Connected' : 'Disconnected'})</span>
        </div>
        <div className="input-wrapper">
          <textarea ref={textareaRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask me anything..." rows="1" disabled={isLoading} />
          <button className="send-btn" onClick={sendMessage} disabled={!inputValue.trim() || isLoading}>
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
        <div className="input-hint">
          Press <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
}

export default StarrySidebar;