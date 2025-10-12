import React, { useCallback, useEffect, useRef, useState } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './CodeEditor.css';

const env = typeof import.meta !== 'undefined' ? import.meta.env : {};
const API = env.VITE_API_URL || env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
  const [scrollTop, setScrollTop] = useState(0);
  const [diagnostics] = useState([]);

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
  
  const updateCode = useCallback((newCodeValue) => {
    setCode(newCodeValue);
    if (onContentChange) {
      onContentChange(newCodeValue);
    }
    setOpenTabs((tabs) =>
      tabs.map((tab) => (tab.path === activeTab ? { ...tab, content: newCodeValue } : tab))
    );
  }, [activeTab, onContentChange]);

  const handleCodeChange = useCallback((e) => {
    const newCodeValue = e.target.value;
    updateCode(newCodeValue);
    saveToHistory(newCodeValue);
  }, [saveToHistory, updateCode]);

  const handleKeyDown = useCallback((e) => {
    const isMeta = e.ctrlKey || e.metaKey;

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      let newCodeValue;
      if (start === end) {
        newCodeValue = `${code.substring(0, start)}  ${code.substring(end)}`;
        updateCode(newCodeValue);
        window.requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        });
      } else {
        const selectedText = code.substring(start, end);
        const indented = selectedText
          .split('\n')
          .map((line) => `  ${line}`)
          .join('\n');
        newCodeValue = `${code.substring(0, start)}${indented}${code.substring(end)}`;
        updateCode(newCodeValue);
        window.requestAnimationFrame(() => {
          textarea.selectionStart = start;
          textarea.selectionEnd = start + indented.length;
        });
      }
      saveToHistory(newCodeValue);
      return;
    }

    if (isMeta && e.key.toLowerCase() === 's') {
      e.preventDefault();
      console.log('Saving file:', activeTab);
      return;
    }

    if (isMeta) {
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (!e.shiftKey) {
          // Handle Undo (Ctrl+Z)
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const previousCode = history[newIndex];
            setCode(previousCode);
            if (onContentChange) {
              onContentChange(previousCode);
            }
          }
        } else {
          // Handle Redo (Ctrl+Shift+Z or Ctrl+Y)
          if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            const nextCode = history[newIndex];
            setCode(nextCode);
            if (onContentChange) {
              onContentChange(nextCode);
            }
          }
        }
        return;
      }
    }
    
    // Save current state to history when typing stops
    if (e.key !== 'Control' && e.key !== 'Shift' && e.key !== 'Alt' && e.key !== 'Meta') {
      saveToHistory(code);
    }
  }, [code, history, historyIndex, onContentChange, saveToHistory, updateCode]);
  
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
    
    const newCodeValue =
      code.substring(0, selection.start) + suggestion.text + code.substring(selection.end);
    updateCode(newCodeValue);
    saveToHistory(newCodeValue);
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
              onClick={() => applySuggestion(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
