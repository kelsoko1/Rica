import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

export default function MonacoEditor({ 
  file,
  content,
  onChange,
  onSelectionChange,
  language = 'javascript',
  theme = 'vs-dark'
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  useEffect(() => {
    // Configure Monaco editor
    monaco.editor.defineTheme('starry-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'regexp', foreground: 'D16969' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'class', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'constant', foreground: '4FC1FF' }
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#2F3139',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#C6C6C6',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070'
      }
    });
  }, []);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Set up selection change handler
    editor.onDidChangeCursorSelection((e) => {
      if (onSelectionChange) {
        const selection = editor.getSelection();
        const selectedText = editor.getModel().getValueInRange(selection);
        onSelectionChange({
          selection,
          selectedText,
          lineNumber: selection.startLineNumber
        });
      }
    });

    // Add custom actions
    editor.addAction({
      id: 'starry.explain',
      label: 'Explain Code',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyE
      ],
      run: () => {
        const selection = editor.getSelection();
        const selectedText = editor.getModel().getValueInRange(selection);
        if (selectedText) {
          // Trigger explain command through parent component
          onSelectionChange({
            selection,
            selectedText,
            lineNumber: selection.startLineNumber,
            command: 'explain'
          });
        }
      }
    });

    editor.addAction({
      id: 'starry.refactor',
      label: 'Refactor Code',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyR
      ],
      run: () => {
        const selection = editor.getSelection();
        const selectedText = editor.getModel().getValueInRange(selection);
        if (selectedText) {
          onSelectionChange({
            selection,
            selectedText,
            lineNumber: selection.startLineNumber,
            command: 'refactor'
          });
        }
      }
    });

    // Configure editor settings
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
      minimap: {
        enabled: true,
        maxColumn: 80
      },
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        useShadows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10
      },
      lineNumbers: 'on',
      roundedSelection: true,
      selectOnLineNumbers: true,
      automaticLayout: true,
      padding: {
        top: 10,
        bottom: 10
      },
      renderLineHighlight: 'all',
      occurrencesHighlight: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: true,
      smoothScrolling: true,
      contextmenu: true,
      multiCursorModifier: 'alt',
      wordWrap: 'on',
      wrappingIndent: 'indent',
      renderWhitespace: 'selection',
      renderControlCharacters: true,
      guides: {
        bracketPairs: true,
        indentation: true
      },
      bracketPairColorization: {
        enabled: true
      },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoSurround: 'quotes'
    });
  };

  const handleEditorChange = (value) => {
    if (onChange) {
      onChange(value);
    }
  };

  // Determine file language based on extension
  const getLanguage = (filename) => {
    if (!filename) return language;
    const ext = filename.split('.').pop().toLowerCase();
    const languageMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      rb: 'ruby',
      php: 'php',
      html: 'html',
      css: 'css',
      scss: 'scss',
      less: 'less',
      json: 'json',
      md: 'markdown',
      yaml: 'yaml',
      yml: 'yaml',
      xml: 'xml',
      sql: 'sql'
    };
    return languageMap[ext] || language;
  };

  return (
    <div className="monaco-editor-wrapper">
      <Editor
        height="100%"
        theme="starry-dark"
        language={getLanguage(file)}
        value={content}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly: false
        }}
      />
    </div>
  );
}
