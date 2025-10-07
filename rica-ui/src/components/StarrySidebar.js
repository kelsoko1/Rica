import React, {useState, useEffect, useRef} from 'react';
import ollamaService from '../services/OllamaService';
import './StarrySidebar.css';

const AVAILABLE_MODELS = [
  { id: 'deepseek-r1:1.5b', name: 'DeepSeek R1 1.5B', description: 'Fast, lightweight model' },
  { id: 'deepseek-r1:7b', name: 'DeepSeek R1 7B', description: 'Balanced performance' },
  { id: 'llama3.2:3b', name: 'Llama 3.2 3B', description: 'Meta\'s efficient model' },
  { id: 'qwen2.5-coder:7b', name: 'Qwen 2.5 Coder 7B', description: 'Optimized for coding' },
  { id: 'codellama:7b', name: 'Code Llama 7B', description: 'Specialized code assistant' }
];

export default function StarrySidebar({open, onClose}){
  const sidebarRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [savedChats, setSavedChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingMessage]);

  // Load saved chats from localStorage
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

  // Save current chat when messages change
  useEffect(() => {
    if (messages.length > 1 && currentChatId) {
      const chatToSave = {
        id: currentChatId,
        title: messages[1]?.content.substring(0, 50) + '...' || 'New Chat',
        messages: messages,
        timestamp: new Date().toISOString(),
        model: selectedModel
      };
      
      setSavedChats(prev => {
        const updated = prev.filter(chat => chat.id !== currentChatId);
        const newChats = [chatToSave, ...updated].slice(0, 20); // Keep last 20 chats
        localStorage.setItem('starry-chat-history', JSON.stringify(newChats));
        return newChats;
      });
    }
  }, [messages, currentChatId, selectedModel]);

  useEffect(() => {
    if (messages.length === 0) {
      const newChatId = Date.now().toString();
      setCurrentChatId(newChatId);
      setMessages([{
        role: 'assistant',
        content: '👋 Hello Kelvin! I\'m Starry AI, your intelligent coding assistant powered by Ollama.\n\n🚀 I can help you with:\n• Code explanation and debugging\n• Writing and refactoring code\n• Best practices and optimization\n• Technical questions and documentation\n\nWhat would you like to work on today?',
        timestamp: new Date().toISOString()
      }]);
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
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Connection Error: ${error.message}\n\nPlease make sure Ollama is running at http://72.60.133.11:2022\n\nTroubleshooting:\n• Check if the Ollama server is running\n• Verify the model is installed: ollama pull ${selectedModel}\n• Check network connectivity`, timestamp: new Date().toISOString(), isError: true }]);
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
    const modelToUse = chat.model || AVAILABLE_MODELS[0].id;
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

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
    ollamaService.setModel(modelId);
    setShowModelSelector(false);
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
  };

  // Sync selected model with OllamaService on mount and when model changes
  useEffect(() => {
    ollamaService.setModel(selectedModel);
  }, [selectedModel]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
              <path d="M9 3H15M3 9V15M21 9V15M9 21H15M12 3V21M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="clear-btn" onClick={clearConversation} title="New conversation">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                      <span className="history-item-model">{AVAILABLE_MODELS.find(m => m.id === chat.model)?.name || chat.model}</span>
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
            <span className="model-count">{AVAILABLE_MODELS.length} models</span>
          </div>
          <div className="model-list">
            {AVAILABLE_MODELS.map(model => (
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
              <div className="message-header">
                <span className="message-role">{msg.role === 'user' ? 'You' : 'Starry AI'}</span>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
              <div className="message-text">{msg.content}</div>
              <div className="message-actions">
                <button className="action-btn" onClick={() => copyToClipboard(msg.content)} title="Copy to clipboard">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 4V16C8 17.1 8.9 18 10 18H18C19.1 18 20 17.1 20 16V7.83C20 7.3 19.79 6.79 19.41 6.42L16.58 3.59C16.21 3.21 15.7 3 15.17 3H10C8.9 3 8 3.9 8 5V4ZM16 20H4V8H6V20H16ZM10 5H15L19 9V16H10V5Z" fill="currentColor"/>
                  </svg>
                </button>
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
          <span>{AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}</span>
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