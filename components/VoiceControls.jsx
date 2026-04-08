import React, { useState, useEffect, useRef } from 'react';

export default function VoiceControls({ onCommand, ttsEnabled, setTtsEnabled }) {
  const [sttEnabled, setSttEnabled] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event) => {
          const last = event.results.length - 1;
          const command = event.results[last][0].transcript.trim().toLowerCase();
          
          if (command.includes("explain all") || command.includes("explain everything")) {
            onCommand("explain all");
          } else if (command.includes("explain code") || command.includes("explain this")) {
            onCommand("explain");
          } else if (command.includes("clear terminal")) {
            onCommand("clear");
          } else if (command.includes("stop voice") || command.includes("stop reading")) {
            setTtsEnabled(false);
            window.speechSynthesis.cancel();
          }
        };
      }
    }
  }, [onCommand]);

  useEffect(() => {
    if (sttEnabled && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    } else if (!sttEnabled && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [sttEnabled]);

  const toggleTts = () => setTtsEnabled(!ttsEnabled);
  const toggleStt = () => setSttEnabled(!sttEnabled);

  return (
    <div className="flex space-x-4 bg-zinc-900 border border-gray-800 p-2 sm:p-3 rounded-lg shadow-lg items-center">
      <div className="text-sm text-zinc-400 mr-1 sm:mr-2 hidden sm:block">Voice:</div>
      
      <button 
        onClick={toggleTts}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
          ttsEnabled ? 'bg-green-600 text-white shadow-[0_0_10px_rgba(0,255,0,0.5)]' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
        }`}
      >
        Auto-read {ttsEnabled ? 'ON' : 'OFF'}
      </button>

      <button 
        onClick={toggleStt}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
          sttEnabled ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(0,100,255,0.5)]' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
        }`}
      >
        Listen {sttEnabled ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}
