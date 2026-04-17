import React, { useState, useRef, useEffect } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  const bottomRef = useRef(null);

  // Auto-scroll whenever messages update
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message to state
    const newUserMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim()
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    
    // AI response hook will be implemented in future steps
  };

  return (
    <div className="column h-full flex flex-col">
      <div className="column-header shrink-0">
        <div className="flex items-center gap-2">
           💬 Chat
        </div>
      </div>
      
      <div className="column-content overflow-y-auto flex-1 p-4 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="placeholder-text flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
            <p>Click a suggestion or ask a question to start chatting...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-500 text-white rounded-br-sm shadow-sm' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-bl-sm shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)]'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} className="h-1 shrink-0" />
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
        <form onSubmit={handleSubmit} className="flex relative">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about the meeting..." 
            className="w-full pl-4 pr-12 py-3 border border-slate-200 dark:border-slate-600 rounded-full bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors shadow-sm"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
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
