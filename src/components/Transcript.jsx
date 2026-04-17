import React from 'react';

export default function Transcript() {
  return (
    <div className="column h-full">
      <div className="column-header">
        <div className="flex items-center gap-2">
           🎙️ Transcript
        </div>
        <button className="btn-primary flex items-center gap-2">Start Mic</button>
      </div>
      <div className="column-content">
        <div className="placeholder-text">
          <p>Audio transcript will appear here...</p>
        </div>
      </div>
    </div>
  );
}
