import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Editor from '../components/Editor';
import Terminal from '../components/Terminal';
import VoiceControls from '../components/VoiceControls';

export default function Home() {
  const [code, setCode] = useState('// Start typing your code here...\nfunction hello() {\n  console.log("world!");\n}\n');
  const [explanations, setExplanations] = useState([{ text: "Welcome to CodeSplain AI. Type some code, and I'll explain it." }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [currentCursorLine, setCurrentCursorLine] = useState('');
  const [isExplainingAll, setIsExplainingAll] = useState(false);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [explanations, isProcessing]);

  const handleExplainLine = async (fullCode, lastLine) => {
    if (!lastLine.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/explain-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullCode, lastLine, language })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        addExplanation(data.explanation, false);
      } else {
        addExplanation(`Error: ${data.error || "Could not explain line. Try again."}`, true);
      }
    } catch (error) {
      addExplanation(`Error: Could not explain line. Try again.`, true);
    } finally {
      setIsProcessing(false);
    }
  };

  const addExplanation = (text, isError) => {
    setExplanations(prev => [...prev, { text, isError }]);
    
    if (!isError && window.speechSynthesis && ttsEnabled) {
        const utterances = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterances);
    }
  };

  const handleRunCode = async () => {
    setIsProcessing(true);
    addExplanation(`[Compiling & Executing as ${language}...]`, false);

    try {
      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        addExplanation(`Execution Error: ${data.error}`, true);
      } else {
        if (data.stderr) {
          addExplanation(`Compiler/Runtime Notice:\n${data.stderr}`, true);
        }
        if (data.stdout) {
          addExplanation(`Output:\n${data.stdout}`, false);
        }
        if (!data.stdout && !data.stderr) {
          addExplanation("Code executed successfully with no output.", false);
        }
      }
    } catch (e) {
      addExplanation(`Network Error: Could not reach execution engine.`, true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceCommand = (command) => {
    if (command === "clear") {
      setExplanations([]);
      window.speechSynthesis.cancel();
    } else if (command === "explain") {
      if (currentCursorLine.trim()) {
        handleExplainLine(code, currentCursorLine);
      } else {
        const lines = code.split('\n');
        const last = lines[Math.max(0, lines.length - 1)];
        handleExplainLine(code, last);
      }
    } else if (command === "explain all") {
       handleExplainAll();
    }
  };

  const handleExplainAll = async () => {
    if (isExplainingAll) return;
    setIsExplainingAll(true);
    const lines = code.split('\n').filter(l => l.trim().length > 0);
    
    addExplanation("--- Starting Full Code Explanation ---", false);
    
    for (const line of lines) {
      await handleExplainLine(code, line);
      // Small pause between lines for natural flow
      await new Promise(r => setTimeout(r, 1000));
    }
    
    addExplanation("--- Finished Full Explanation ---", false);
    setIsExplainingAll(false);
  };

  const copyTerminal = () => {
    const text = explanations.map(e => `> ${e.text}`).join('\n');
    navigator.clipboard.writeText(text);
    alert("Terminal output copied!");
  };

  return (
    <div className="h-screen bg-zinc-950 font-sans text-zinc-200 overflow-hidden flex flex-col p-4">
      <Head>
        <title>CodeSplain AI</title>
      </Head>

      {/* Header */}
      <header className="flex justify-between items-center mb-4 z-10 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
            CodeSplain AI
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm">Real-Time Coding Explanation Terminal</p>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-1 sm:p-2 bg-zinc-900 border border-gray-700 rounded-lg text-zinc-300 text-xs sm:text-sm font-semibold outline-none"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>

          <VoiceControls 
            onCommand={handleVoiceCommand} 
            ttsEnabled={ttsEnabled} 
            setTtsEnabled={setTtsEnabled} 
          />
          
          <button 
            onClick={handleRunCode}
            className="p-1 sm:p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-xs sm:text-sm font-semibold transition-colors border border-blue-400 min-w-max"
            title="Execute Code"
          >
            ▶ Run Code
          </button>

          <button 
            onClick={copyTerminal}
            className="p-1 sm:p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 text-xs sm:text-sm font-semibold transition-colors border border-gray-700 hidden sm:block"
            title="Copy Terminal Output"
          >
            📋 Copy
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <Editor 
          code={code} 
          setCode={setCode} 
          language={language}
          onExplainLine={handleExplainLine} 
          onCursorLineChange={setCurrentCursorLine}
        />
        
        <Terminal 
          explanations={explanations} 
          isProcessing={isProcessing} 
          terminalRef={terminalRef} 
        />
      </main>
    </div>
  );
}
