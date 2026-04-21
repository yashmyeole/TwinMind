import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { generateSuggestions } from '../services/suggestionService';

const Suggestions = forwardRef(({ transcripts, onRefresh, onSuggestionClick }, ref) => {
  const [suggestionBatches, setSuggestionBatches] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  // Keep track of the last processed transcript chunk to avoid useless reruns
  const lastProcessedTranscriptIdRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getExportData: () => suggestionBatches,
    manualRefresh: async () => {
      // Force refresh suggestions on current transcript
      if (!transcripts || transcripts.length === 0) return;
      
      const apiKey = localStorage.getItem('groq_api_key');
      if (!apiKey) {
        setError("Please add an API key in settings first.");
        return;
      }

      const rawWindowSize = localStorage.getItem('context_window_size');
      const windowSize = rawWindowSize ? parseInt(rawWindowSize, 10) : 12;

      const activeChunks = transcripts.slice(-windowSize);
      let transcriptContext = "";
      
      if (activeChunks.length === 1) {
        transcriptContext = `[Most Recent Statement - HIGHEST PRIORITY]\n${activeChunks[0].text}`;
      } else if (activeChunks.length > 1) {
        const pastChunks = activeChunks.slice(0, -1).map(t => t.text).join(" ");
        const latestChunk = activeChunks[activeChunks.length - 1].text;
        transcriptContext = `[Historical Context]\n${pastChunks}\n\n[Most Recent Statement - HIGHEST PRIORITY]\n${latestChunk}`;
      }

      const customPrompt = localStorage.getItem('suggestion_prompt');

      setIsGenerating(true);
      setError(null);
      
      try {
        const newSuggestions = await generateSuggestions(apiKey, transcriptContext, customPrompt);
        
        console.log("🔄 Manual refresh - Generated suggestions:", newSuggestions.length);
        
        if (newSuggestions && newSuggestions.length > 0) {
          setSuggestionBatches(prev => [
            {
              id: Date.now().toString(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              suggestions: newSuggestions
            },
            ...prev
          ]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsGenerating(false);
      }
    }
  }));

  useEffect(() => {
    // If no transcripts, stop
    if (!transcripts || transcripts.length === 0) return;
    
    const latestTranscript = transcripts[transcripts.length - 1];
    
    if (latestTranscript.id === lastProcessedTranscriptIdRef.current) return;
    
    // Update ref immediately to mark this transcript as processed
    lastProcessedTranscriptIdRef.current = latestTranscript.id;
    
    console.log("📝 Processing transcript:", latestTranscript.text.substring(0, 70) + "...");
    
    const requestLiveSuggestions = async () => {
      const apiKey = localStorage.getItem('groq_api_key');
      if (!apiKey) {
        setError("Please add an API key in settings first.");
        return;
      }
  
      const rawWindowSize = localStorage.getItem('context_window_size');
      const windowSize = rawWindowSize ? parseInt(rawWindowSize, 10) : 12;

      // Concatenate dynamic subset of conversation context and prioritize latest chunk
      const activeChunks = transcripts.slice(-windowSize);
      let transcriptContext = "";
      
      if (activeChunks.length === 1) {
        transcriptContext = `[Most Recent Statement - HIGHEST PRIORITY]\n${activeChunks[0].text}`;
      } else if (activeChunks.length > 1) {
        const pastChunks = activeChunks.slice(0, -1).map(t => t.text).join(" ");
        const latestChunk = activeChunks[activeChunks.length - 1].text;
        transcriptContext = `[Historical Context]\n${pastChunks}\n\n[Most Recent Statement - HIGHEST PRIORITY]\n${latestChunk}`;
      }

      const customPrompt = localStorage.getItem('suggestion_prompt');
  
      setIsGenerating(true);
      setError(null);
      
      try {
        // Always generate suggestions with SYSTEM_SUGGESTION_PROMPT
        const newSuggestions = await generateSuggestions(apiKey, transcriptContext, customPrompt);
        
        console.log("✅ Generated suggestions:", newSuggestions.length);
        
        if (newSuggestions && newSuggestions.length > 0) {
          setSuggestionBatches(prev => {
            // Deduplication logic: If the exact same suggestions were returned, do not append to screen.
            if (prev.length > 0) {
              const previousTitles = prev[0].suggestions.map(s => s.title).join('|');
              const newTitles = newSuggestions.map(s => s.title).join('|');
              if (previousTitles === newTitles) {
                console.log("⏭️  Skipped duplicate suggestions");
                return prev; 
              }
            }

            // Append new batch to the top of the list
            return [
              {
                id: Date.now().toString(),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                suggestions: newSuggestions
              },
              ...prev
            ];
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsGenerating(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      requestLiveSuggestions();
    }, 1500);

    return () => clearTimeout(debounceTimeout);

  }, [transcripts]);

  const handleManualRefresh = async () => {
    if (ref.current && ref.current.manualRefresh) {
      await ref.current.manualRefresh();
    }
  }

  return (
    <div className="column h-full flex flex-col">
      <div className="column-header shrink-0">
        <div className="flex items-center gap-2">
           💡 Suggestions
           {isGenerating && (
             <span className="ml-2 flex items-center justify-center">
               <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
             </span>
           )}
        </div>
        <button onClick={handleManualRefresh} className="btn-secondary flex items-center gap-2" disabled={isGenerating}>
          🔄 Refresh
        </button>
      </div>

      <div className="column-content overflow-y-auto flex-1 flex flex-col p-4 bg-slate-50 dark:bg-slate-900/50">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-900 text-sm mb-4 shrink-0">
            {error}
          </div>
        )}

        {suggestionBatches.length > 0 ? (
          <div className="space-y-6">
            {suggestionBatches.map((batch, index) => (
              <div 
                key={batch.id} 
                className={`relative pt-2 transition-all duration-500 ease-in-out ${index > 0 ? 'opacity-50 grayscale-[40%] hover:opacity-100 hover:grayscale-0' : 'opacity-100'}`}
              >
                <div className="absolute -top-3 right-0 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 z-10">
                  {batch.timestamp}
                </div>
                
                <div className="space-y-3">
                  {batch.suggestions.map((s, idx) => {
                    // Quick color coding for visual scanning
                    let colorClass = "text-indigo-500";
                    if (s.category.toLowerCase().includes("clarifying")) colorClass = "text-sky-500";
                    else if (s.category.toLowerCase().includes("question")) colorClass = "text-emerald-500";
                    else if (s.category.toLowerCase().includes("talking")) colorClass = "text-amber-500";
                    else if (s.category.toLowerCase().includes("fact")) colorClass = "text-rose-500";
                    else if (s.category.toLowerCase().includes("answer")) colorClass = "text-indigo-500";

                    return (
                      <div 
                        key={idx} 
                        onClick={() => onSuggestionClick(s)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-3.5 rounded-xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15)] hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all cursor-pointer group animate-fade-in-up"
                        style={{animationDelay: `${idx * 100}ms`}}
                      >
                        <div className={`text-[11px] font-bold ${colorClass} mb-1 uppercase tracking-wider`}>
                          {s.category}
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1.5 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {s.title}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          {s.detail}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
           <div className="placeholder-text h-full flex items-center justify-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Speak into the mic. Suggestions will generate automatically...
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export default Suggestions;
