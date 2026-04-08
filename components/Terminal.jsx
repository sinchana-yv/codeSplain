import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Terminal({ explanations, isProcessing, terminalRef }) {
  return (
    <div className="flex flex-col h-full bg-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl relative font-mono text-sm sm:text-base text-[#00ff00]">
      {/* Title Bar */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-900 border-b border-gray-800 flex items-center px-4 space-x-2 z-10">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <div className="text-zinc-400 text-xs ml-4">Terminal Process</div>
      </div>
      
      {/* Content */}
      <div 
        ref={terminalRef}
        className="mt-8 flex-1 overflow-y-auto w-full p-4 space-y-3"
      >
        <AnimatePresence>
          {explanations.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`leading-relaxed whitespace-pre-wrap break-words ${item.isError ? 'text-red-500' : ''}`}
            >
              <span className="text-zinc-500 select-none">{`> `}</span>
              {item.text}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center text-yellow-400 space-x-2"
          >
            <span className="text-zinc-500 select-none">{`> `}</span>
            <span className="animate-pulse">Processing line...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
