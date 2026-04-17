import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/chatService';

export default function Chat({ transcripts, externalQuery, setExternalQuery }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  
  const bottomRef = useRef(null);

  // Auto-scroll whenever messages update
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const processQuery = async (queryText) => {
    const apiKey = localStorage.getItem('groq_api_key');
    if (!apiKey) {
      setError("Add API key in settings to chat.");
      return;
    }

    setError(null);
    setIsTyping(true);

    const newUserMsg = { id: Date.now().toString(), role: 'user', content: queryText };
    setMessages(prev => [...prev, newUserMsg]);

    const rawWindowSize = localStorage.getItem('context_window_size');
    const windowSize = rawWindowSize ? parseInt(rawWindowSize, 10) : 12; // fallback to 12 as defined in prompts
    const transcriptContext = transcripts ? transcripts.slice(-windowSize).map(t => t.text).join(" ") : "";
    const customChatPrompt = localStorage.getItem('chat_prompt');

    try {
      const response = await sendChatMessage(apiKey, transcriptContext, messages, queryText, customChatPrompt);
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'ai', content: response }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsTyping(false);
      setInputValue('');
    }
  };

  // Watch for external query (e.g. clicked suggestion)
  useEffect(() => {
    if (externalQuery) {
      processQuery(externalQuery);
      setExternalQuery(null);
    }
  }, [externalQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;
    processQuery(inputValue.trim());
  };

  return (
    <div className="column h-full flex flex-col">
      <div className="column-header shrink-0">
        <div className="flex items-center gap-2">
           💬 Chat
        </div>
      </div>
      
      <div className="column-content overflow-y-auto flex-1 p-4 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-4 relative">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-900 text-sm mb-4">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="placeholder-text flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
            <p>Click a suggestion or ask a question to start chatting...</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-indigo-500 text-white rounded-br-sm shadow-sm font-medium' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-bl-sm shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex w-full justify-start">
                <div className="max-w-[85%] px-4 py-3.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-2xl rounded-bl-sm shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)]">
                  <div className="flex gap-1.5 items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} className="h-1 shrink-0" />
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
        <form onSubmit={handleSubmit} className="flex relative">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            placeholder="Ask a question about the meeting..." 
            className="w-full pl-4 pr-12 py-3 border border-slate-200 dark:border-slate-600 rounded-full bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors shadow-sm disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-[1px] translate-y-[1px]">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
