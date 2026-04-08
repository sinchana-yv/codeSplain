import React, { useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { debounce } from '../lib/debounce';

export default function Editor({ code, setCode, onExplainLine, language, onCursorLineChange }) {
  const monacoRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    monacoRef.current = editor;
    
    // Listen for cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      const position = e.position;
      const model = editor.getModel();
      if (model && onCursorLineChange) {
        const lineContent = model.getLineContent(position.lineNumber);
        onCursorLineChange(lineContent);
      }
    });
  };

  const debouncedExplain = useRef(
    debounce((fullCode, lastLine) => {
      if (lastLine.trim()) {
        onExplainLine(fullCode, lastLine);
      }
    }, 1200)
  ).current;

  const handleEditorChange = (value, event) => {
    setCode(value || "");

    const changes = event.changes;
    if (changes && changes.length > 0) {
      const text = changes[0].text;
      const model = monacoRef.current?.getModel();
      
      if (model) {
        const lines = value.split('\n');
        // If Enter was pressed, explain the previous line
        if (text.includes('\n')) {
          const lineNumber = monacoRef.current.getPosition().lineNumber;
          const previousLine = model.getLineContent(Math.max(1, lineNumber - 1));
          debouncedExplain(value, previousLine);
        } else {
          // Otherwise explain current line
          const currentLine = model.getLineContent(monacoRef.current.getPosition().lineNumber);
          debouncedExplain(value, currentLine);
        }
      }
    }
  };

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
      <MonacoEditor
        height="100%"
        width="100%"
        theme="vs-dark"
        language={language}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'Fira Code', monospace",
          padding: { top: 16, bottom: 16 },
          smoothScrolling: true,
          cursorBlinking: "smooth",
          wordWrap: "on",
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
        }}
        loading={<div className="text-white p-4">Loading editor...</div>}
      />
    </div>
  );
}
