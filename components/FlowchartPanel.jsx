import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { motion } from 'framer-motion';

export default function FlowchartPanel({ code, language }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [mermaidCode, setMermaidCode] = useState('');
  const [error, setError] = useState('');
  const svgWrapperRef = useRef(null);

  // Initialize mermaid defaults
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: "'Fira Code', monospace"
    });
  }, []);

  // When mermaidCode populates, attempt render
  useEffect(() => {
    if (mermaidCode && svgWrapperRef.current) {
      const renderChart = async () => {
        try {
          // Clear container
          svgWrapperRef.current.innerHTML = '';
          const { svg } = await mermaid.render('mermaid-chart-svg', mermaidCode);
          svgWrapperRef.current.innerHTML = svg;
        } catch (e) {
          setError("Generated chart contained invalid Mermaid syntax.");
          console.error("Mermaid Render Error:", e);
        }
      };
      renderChart();
    }
  }, [mermaidCode]);

  const generateFlowchart = async () => {
    if (!code || !code.trim()) {
       setError("Editor is empty.");
       return;
    }
    
    setIsGenerating(true);
    setError('');
    setMermaidCode('');
    
    if (svgWrapperRef.current) {
      svgWrapperRef.current.innerHTML = ''; // clear old
    }

    try {
      const response = await fetch('/api/generate-flowchart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMermaidCode(data.mermaidSyntax);
      } else {
        setError(data.error || "Failed to formulate flowchart logic.");
      }
    } catch (err) {
       setError("Could not reach the server.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden shadow-2xl relative font-sans text-zinc-200">
      {/* Settings / Top Bar */}
      <div className="h-12 bg-zinc-900 border-b border-gray-800 flex items-center justify-between px-4 z-10 shrink-0">
        <h2 className="text-sm font-semibold text-zinc-300">Logic Flowchart</h2>
        <button
          onClick={generateFlowchart}
          disabled={isGenerating}
          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
            isGenerating 
              ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]'
          }`}
        >
          {isGenerating ? 'Mapping Logic...' : '✨ Generate Flow Chart'}
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#050505] min-h-[300px]">
        {error && (
            <div className="text-red-400 text-sm border-l-2 border-red-500 pl-3">
              {error}
            </div>
        )}
        
        {!mermaidCode && !isGenerating && !error && (
            <div className="text-zinc-600 text-sm italic">
               Click generate to build a map of your code's architecture.
            </div>
        )}

        {isGenerating && (
            <motion.div 
               initial={{ opacity: 0}} 
               animate={{ opacity: 1, scale: [0.98, 1.02, 0.98] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="text-purple-400 text-sm flex items-center space-x-2"
            >
               <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
               <span>Extracting logic...</span>
            </motion.div>
        )}

        {/* The SVG Injection wrapper */}
        <div ref={svgWrapperRef} className={`w-full h-full flex justify-center items-center ${isGenerating ? 'hidden' : 'block'} [&>svg]:max-w-full [&>svg]:max-h-full`} />
      </div>
    </div>
  );
}
