import React, { useState } from 'react';
import { useMicrophone } from '../hooks/useMicrophone';

export default function Transcript() {
  const [blobsCaptured, setBlobsCaptured] = useState(0);

  const handleAudioData = (blob) => {
    // For Step 1.1: Simply verifying data capture logic
    console.log("[Transcript.jsx] Received Blob Size:", blob.size);
    setBlobsCaptured(prev => prev + 1);
  };

  const { isRecording, startMic, stopMic, error } = useMicrophone({ onAudioData: handleAudioData });

  return (
    <div className="column h-full">
      <div className="column-header">
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
      
      <div className="column-content relative">
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-900 mb-4 text-sm font-medium">
            {error}
          </div>
        ) : null}

        <div className="placeholder-text flex-col gap-2">
          {isRecording ? (
            <div className="flex flex-col items-center">
               <span className="animate-bounce">🎧</span>
               <p className="text-slate-600 dark:text-slate-300">Listening to your conversation...</p>
            </div>
          ) : (
            <p>Audio transcript will appear here...</p>
          )}
          
          {blobsCaptured > 0 && !isRecording && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              Success! {blobsCaptured} audio blobs were captured for testing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
