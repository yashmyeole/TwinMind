import React from 'react';

export default function Chat() {
  return (
    <div className="column h-full">
      <div className="column-header">
        <div className="flex items-center gap-2">
           💬 Chat
        </div>
      </div>
      <div className="column-content">
        <div className="placeholder-text">
          <p>Click a suggestion or ask a question to start chatting...</p>
        </div>
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <input 
          type="text" 
          placeholder="Ask a question about the meeting..." 
          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
        />
      </div>
    </div>
  );
}
