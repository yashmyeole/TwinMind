import React, { useState, useEffect, useRef } from 'react';
import { useMicrophone } from '../hooks/useMicrophone';
import { transcribeAudio } from '../services/transcriptionService';

export default function Transcript({ transcripts, setTranscripts }) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState(null);
  
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when new transcripts are added
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcripts]);

  const handleAudioData = async (blob) => {
    const apiKey = localStorage.getItem('groq_api_key');
    if (!apiKey) {
      setTranscriptionError("Missing Groq API Key. Add it in settings.");
      return;
    }

    try {
      setIsTranscribing(true);
      setTranscriptionError(null);
      const text = await transcribeAudio(apiKey, blob);
      
      if (text) {
        setTranscripts(prev => [...prev, {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: text
        }]);
      }
    } catch (err) {
      setTranscriptionError(err.message || "Failed to transcribe audio.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const { isRecording, startMic, stopMic, error: micError } = useMicrophone({ 
    onAudioData: handleAudioData,
    timeslice: 30000 // fire roughly every 30 seconds
  });

  return (
    <div className="column h-full flex flex-col relative">
      <div className="column-header shrink-0">
        <div className="flex items-center gap-2">
           🎙️ Transcript
        </div>
        
        {isRecording ? (
          <button 
            onClick={stopMic} 
            className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
            Stop Mic
          </button>
        ) : (
          <button 
            onClick={startMic} 
            className="btn-primary flex items-center gap-2"
          >
            Start Mic
          </button>
        )}
      </div>
      
      <div className="column-content overflow-y-auto flex-1 flex flex-col">
        {micError && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-900 text-sm font-medium shrink-0">
            {micError}
          </div>
        )}
        
        {transcriptionError && (
          <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 p-3 rounded-lg border border-amber-200 dark:border-amber-900 text-sm shrink-0">
            {transcriptionError}
          </div>
        )}

        <div className="flex-1 flex flex-col gap-4 min-h-max">
          {transcripts.length === 0 ? (
            <div className="placeholder-text flex-col gap-2 m-auto h-full justify-center">
              {isRecording ? (
                <div className="flex flex-col items-center gap-3">
                  <span className="animate-bounce text-2xl">🎧</span>
                  <p className="text-slate-600 dark:text-slate-300">
                    Listening to your recording...<br/>
                    <span className="text-sm opacity-70">Chunks transcribe every 30 seconds.</span>
                  </p>
                </div>
              ) : (
                <p>Audio transcript will appear here...</p>
              )}
            </div>
          ) : (
            <>
              {transcripts.map((entry) => (
                <div key={entry.id} className="group flex gap-3 pb-2 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20 p-2 -mx-2 rounded-lg transition-colors">
                  <div className="text-xs font-mono text-slate-400 dark:text-slate-500 pt-1 shrink-0">
                    {entry.timestamp}
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 text-base leading-relaxed">
                    {entry.text}
                  </div>
                </div>
              ))}
              {isRecording && isTranscribing && (
                <div className="flex items-center gap-3 p-2 -mx-2 opacity-60">
                  <div className="text-xs font-mono text-transparent pt-1 shrink-0">00:00</div>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* This empty div acts as our anchor for scrolling to the very bottom */}
          <div ref={bottomRef} className="h-4 shrink-0"></div>
        </div>
      </div>
    </div>
  );
}
