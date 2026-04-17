import React, { useState, useEffect } from 'react';
import { SYSTEM_SUGGESTION_PROMPT, SYSTEM_CHAT_PROMPT, DEFAULT_CONTEXT_WINDOW } from '../constants/prompts';

export default function SettingsModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [suggestionPrompt, setSuggestionPrompt] = useState('');
  const [chatPrompt, setChatPrompt] = useState('');
  const [contextWindow, setContextWindow] = useState(DEFAULT_CONTEXT_WINDOW);

  // Load from local storage when modal opens
  useEffect(() => {
    if (isOpen) {
      setApiKey(localStorage.getItem('groq_api_key') || '');
      setSuggestionPrompt(localStorage.getItem('suggestion_prompt') || SYSTEM_SUGGESTION_PROMPT);
      setChatPrompt(localStorage.getItem('chat_prompt') || SYSTEM_CHAT_PROMPT);
      
      const savedWindow = localStorage.getItem('context_window_size');
      if (savedWindow) setContextWindow(parseInt(savedWindow, 10));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('groq_api_key', apiKey.trim());
    localStorage.setItem('suggestion_prompt', suggestionPrompt);
    localStorage.setItem('chat_prompt', chatPrompt);
    localStorage.setItem('context_window_size', contextWindow.toString());
    onClose();
  };

  const handleReset = () => {
    setSuggestionPrompt(SYSTEM_SUGGESTION_PROMPT);
    setChatPrompt(SYSTEM_CHAT_PROMPT);
    setContextWindow(DEFAULT_CONTEXT_WINDOW);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            ⚙️ Settings
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Groq API Key
            </label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors font-mono text-sm"
              autoComplete="off"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Required for all AI services. Your key is strictly stored locally.
            </p>
          </div>
          
          <hr className="border-slate-200 dark:border-slate-700" />

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Context Window Size
              </label>
              <span className="text-xs font-mono bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                Approx. {Math.round(contextWindow * 0.5)} minutes
              </span>
            </div>
            <input 
              type="range" 
              min="2" 
              max="60" 
              value={contextWindow}
              onChange={(e) => setContextWindow(e.target.value)}
              className="w-full accent-indigo-500"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              How many recent transcript chunks (chunk = ~30s) to send to the AI for context. Larger values increase latency. Default is {DEFAULT_CONTEXT_WINDOW}.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Live Suggestion Prompt
            </label>
            <textarea 
              value={suggestionPrompt}
              onChange={(e) => setSuggestionPrompt(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors font-mono text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Detailed Answer Chat Prompt
            </label>
            <textarea 
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors font-mono text-xs leading-relaxed"
            />
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0 bg-slate-50 dark:bg-slate-800/80">
          <button 
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-500 transition-colors"
          >
            Reset Defaults
          </button>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="btn-primary"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
