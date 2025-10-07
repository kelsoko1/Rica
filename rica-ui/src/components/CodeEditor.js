import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './CodeEditor.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function CodeEditor({ file, content, onContentChange }) {
  const [code, setCode] = useState(content || '');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState(file?.path || 'untitled');
  const [openTabs, setOpenTabs] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });
  const [activeLine, setActiveLine] = useState(0);
  const [theme, setTheme] = useState('dark');
  const [showMinimap, setShowMinimap] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [lineWrapping, setLineWrapping] = useState(false);
  const [diagnostics, setDiagnostics] = useState([]);
  
  const editorRef = useRef(null);
  const linesRef = useRef(null);
  const minimapRef = useRef(null);
  
  useEffect(() => {
    setCode(content || '');
  }, [content, file]);
  
  // Initialize tabs when component mounts
  useEffect(() => {
    if (file && !openTabs.some(tab => tab.path === file.path)) {
      setOpenTabs(prev => [...prev, {
        path: file.path,
        name: file.name,
        icon: file.icon,
        language: getLanguageFromFilename(file.name),
        content: content || ''
      }]);
      setActiveTab(file.path);
    }
  }, [file, content, openTabs]);

  // Calculate cursor position and active line
  useEffect(() => {
    if (editorRef.current && selection) {
      const textBeforeCursor = code.substring(0, selection.start);
      const lines = textBeforeCursor.split('\n');
      const line = lines.length - 1;
      const column = lines[lines.length - 1].length;
      
      setCursorPosition({ line, column });
      setActiveLine(line);
      
      // Scroll to active line
      if (linesRef.current) {
        const lineElements = linesRef.current.querySelectorAll('.editor-line');
        if (lineElements[line]) {
          lineElements[line].scrollIntoView({ block: 'nearest' });
        }
      }
    }
  }, [code, selection]);

  // Save code changes to history for undo/redo
  const saveToHistory = useCallback((newCode) => {
    // Only save if code actually changed
    if (history.length === 0 || history[history.length - 1] !== newCode) {
      const newHistory = [...history.slice(0, historyIndex + 1), newCode];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [history, historyIndex]);
  
  const handleCodeChange = useCallback((e) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onContentChange) {
      onContentChange(newCode);
    }
    
    // Update the content in the open tabs
    setOpenTabs(tabs => tabs.map(tab => 
      tab.path === activeTab ? { ...tab, content: newCode } : tab
    ));
  }, [activeTab, onContentChange]);
  
  const handleKeyDown = useCallback((e) => {
    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      if (start === end) {
        // Insert tab at cursor position
        const newCode = code.substring(0, start) + '  ' + code.substring(end);
        setCode(newCode);
        
        // Move cursor after the inserted tab
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      } else {
        // Multi-line indentation
        const selectedText = code.substring(start, end);
        const lines = selectedText.split('\n');
        const indentedLines = lines.map(line => '  ' + line);
        const newSelectedText = indentedLines.join('\n');
        
        const newCode = code.substring(0, start) + newSelectedText + code.substring(end);
        setCode(newCode);
        
        // Adjust selection to include the added indentation
        setTimeout(() => {
          textarea.selectionStart = start;
          textarea.selectionEnd = start + newSelectedText.length;
        }, 0);
      }
      
      // Save to history
      saveToHistory(code);
    }
    
    // Handle Ctrl+S for save
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      // Save file logic here
      console.log('Saving file:', activeTab);
    }
    
    // Handle Ctrl+Z for undo
    if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1);
        setCode(history[historyIndex - 1]);
      }
    }
    
    // Handle Ctrl+Shift+Z or Ctrl+Y for redo
    if ((e.key === 'z' && e.ctrlKey && e.shiftKey) || (e.key === 'y' && e.ctrlKey)) {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        setHistoryIndex(historyIndex + 1);
        setCode(history[historyIndex + 1]);
      }
    }
  }, [code, historyIndex, history, activeTab, saveToHistory]);
    
    // Handle Ctrl+S for save
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      // Save file logic here
      console.log('Saving file:', activeTab);
    }
    
    // Handle Ctrl+Z for undo
    if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      if (historyIndex > 0) {
        // Undo
        setHistoryIndex(historyIndex - 1);
        const previousCode = history[historyIndex - 1];
        setCode(previousCode);
        if (onContentChange) {
          onContentChange(previousCode);
        }
      } else if (e.shiftKey && historyIndex < history.length - 1) {
        // Redo
        setHistoryIndex(historyIndex + 1);
        const nextCode = history[historyIndex + 1];
        setCode(nextCode);
        if (onContentChange) {
          onContentChange(nextCode);
        }
      }
    }
    
    // Save current state to history when typing stops
    if (e.key !== 'Control' && e.key !== 'Shift' && e.key !== 'Alt' && e.key !== 'Meta') {
      saveToHistory(code);
    }
  };
  
  const handleSelectionChange = (e) => {
    setSelection({
      start: e.target.selectionStart,
      end: e.target.selectionEnd
    });
  };
  
  const getSelectedText = () => {
    return code.substring(selection.start, selection.end);
  };
  
  const generateCodeSuggestion = async () => {
    const selectedText = getSelectedText();
    if (!selectedText && !file) return;
    
    setIsGenerating(true);
    
    try {
      const prompt = selectedText 
        ? `Improve or fix this code: ${selectedText}`
        : `Generate code for ${file}`;
      
      const response = await axios.post(`${API}/starry`, {
        prompt,
        org: 'demo',
        context: {
          file,
          selection: selectedText,
          codeContext: code
        }
      });
      
      const suggestion = response.data.reply.content;
      
      // Extract code from markdown if present
      let codeContent = suggestion;
      const codeBlockMatch = suggestion.match(/```(?:javascript|js|jsx|ts|tsx)?\n([\s\S]*?)\n```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        codeContent = codeBlockMatch[1];
      }
      
      setSuggestions([{
        text: codeContent,
        explanation: suggestion
      }]);
    } catch (error) {
      console.error('Error generating code suggestion:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const applySuggestion = (suggestion) => {
    if (!suggestion) return;
    
    const newCode = code.substring(0, selection.start) + 
                   suggestion.text + 
                   code.substring(selection.end);
    
    setCode(newCode);
    saveToHistory(newCode);
    
    if (onContentChange) {
      onContentChange(newCode);
    }
    
    setSuggestions([]);
  };
  
  const getLineNumbers = () => {
    const lines = code.split('\n');
    return lines.map((_, i) => i + 1);
  };
  
  return (
    <div className="code-editor-component">
      <div className="editor-toolbar">
        <button 
          className="editor-btn"
          onClick={generateCodeSuggestion}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'AI Complete'}
        </button>
      </div>
      
      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index} 
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
