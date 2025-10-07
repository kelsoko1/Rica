$content = @'
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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingMessage]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: '👋 Hello! I\'m Starry AI, powered by Ollama. I can help you with code, debugging, and technical questions. What can I help you with today?',
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
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${error.message}. Please make sure Ollama is running on port 2022.`, timestamp: new Date().toISOString(), isError: true }]);
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
    setMessages([{ role: 'assistant', content: '👋 Conversation cleared! How can I help you?', timestamp: new Date().toISOString() }]);
    setConversationHistory([]);
    setStreamingMessage('');
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
  };

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
          <button className="model-selector-btn" onClick={() => setShowModelSelector(!showModelSelector)} title="Select AI Model">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3H15M3 9V15M21 9V15M9 21H15M12 3V21M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="clear-btn" onClick={clearConversation} title="Clear conversation">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="close-btn" onClick={onClose} title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      {showModelSelector && (
        <div className="model-selector-dropdown">
          <div className="model-selector-header">
            <h4>Select AI Model</h4>
            <span className="model-count">{AVAILABLE_MODELS.length} models</span>
          </div>
          <div className="model-list">
            {AVAILABLE_MODELS.map(model => (
              <button key={model.id} className={`model-item ${selectedModel === model.id ? 'active' : ''}`} onClick={() => { setSelectedModel(model.id); setShowModelSelector(false); }}>
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
                <div className="user-avatar">U</div>
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
            <circle cx="12" cy="12" r="10" fill="#4ade80"/>
          </svg>
          <span>{AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}</span>
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
'@

Set-Content -Path 'C:\Users\kelvin\Desktop\Rica\rica-ui\src\components\StarrySidebar.js' -Value $content -Force
