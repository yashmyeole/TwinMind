import React from 'react';

export default function Suggestions() {
  return (
    <div className="column h-full">
      <div className="column-header">
        <div className="flex items-center gap-2">
           💡 Suggestions
        </div>
        <button className="btn-secondary flex items-center gap-2">🔄 Refresh</button>
      </div>
      <div className="column-content">
        <div className="placeholder-text">
          <p>Live suggestions will appear here as you speak...</p>
        </div>
      </div>
    </div>
  );
}
