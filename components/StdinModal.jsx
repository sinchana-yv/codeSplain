import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Detects if code likely requires stdin input based on language-specific patterns.
 */
export function requiresStdin(code, language) {
  const patterns = {
    python: [/\binput\s*\(/],
    c: [/\bscanf\s*\(/, /\bgets\s*\(/, /\bfgets\s*\(/, /\bgetchar\s*\(/],
    cpp: [/\bcin\s*>>/, /\bgetline\s*\(/, /\bscanf\s*\(/],
    java: [/\bScanner\b/, /\bBufferedReader\b/, /\bSystem\.in\b/],
    javascript: [/\bprompt\s*\(/, /readline/],
  };

  const langPatterns = patterns[language] || [];
  return langPatterns.some((re) => re.test(code));
}

/**
 * A neon-styled modal to prompt users for stdin before code execution.
 */
export default function StdinModal({ onSubmit, onCancel }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Auto-focus the textarea
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    // Ctrl+Enter to submit
    if (e.key === 'Enter' && e.ctrlKey) {
      onSubmit(value);
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-md bg-zinc-900 border border-green-800 rounded-xl shadow-[0_0_30px_rgba(0,255,0,0.15)] overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-3 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-green-400 text-lg">⌨️</span>
              <h3 className="text-sm font-bold text-zinc-200">Program Input Required</h3>
            </div>
            <button onClick={onCancel} className="text-zinc-500 hover:text-zinc-300 text-xs">ESC</button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-3">
            <p className="text-xs text-zinc-400">
              Your code requires user input. Enter each input on a new line (e.g., one per <code className="text-green-400">input()</code> call).
            </p>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={"Enter input here...\n(One input per line)"}
              className="w-full h-32 bg-black border border-zinc-700 text-[#00ff00] font-mono text-sm rounded-lg p-3 resize-none outline-none focus:border-green-600 placeholder-zinc-700"
            />
            <p className="text-[10px] text-zinc-600">Press Ctrl+Enter to run • Esc to cancel</p>
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 flex space-x-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs text-zinc-400 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit(value)}
              className="px-4 py-2 text-xs text-white font-bold rounded-md bg-blue-600 hover:bg-blue-500 border border-blue-400 transition-all shadow-[0_0_10px_rgba(59,130,246,0.4)]"
            >
              ▶ Run with Input
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
