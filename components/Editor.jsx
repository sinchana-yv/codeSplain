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
    }, 800) // Reduced from 1200 for faster real-time feel
  ).current;

  // Real-time character/word narration
  const speakTypedText = (text) => {
    if (!window.speechSynthesis) return;
    
    // Create a very brief utterance for the character/word
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.5; // Fast speed for typing feedback
    utterance.volume = 0.5; // Slightly quieter than explanations
    
    // Briefly stop current typing sound to play the new one (low latency)
    // Note: We don't cancel the whole queue because we don't want to cut off AI explanations
    window.speechSynthesis.speak(utterance);
  };

  const handleEditorChange = (value, event) => {
    setCode(value || "");

    const changes = event.changes;
    if (changes && changes.length > 0) {
      const text = changes[0].text;
      
      // Real-time narration of the typed text
      if (text) {
        if (text === '\n') {
          speakTypedText("New line");
        } else if (text.trim().length > 0) {
          speakTypedText(text);
        }
      }

      const model = monacoRef.current?.getModel();
      
      if (model) {
        // If Enter was pressed, explain the previous line immediately (no debounce)
        if (text.includes('\n')) {
          const lineNumber = monacoRef.current.getPosition().lineNumber;
          const previousLine = model.getLineContent(Math.max(1, lineNumber - 1));
          onExplainLine(value, previousLine); 
        } else {
          // Otherwise explain current line with debounce
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
