import { useState, useEffect, useRef } from "react";
import Transcript from "./components/Transcript";
import Suggestions from "./components/Suggestions";
import Chat from "./components/Chat";
import SettingsModal from "./components/SettingsModal";

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyExists, setApiKeyExists] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const flushMicRef = useRef(null);
  const suggestionsRef = useRef(null);
  const chatRef = useRef(null);

  // Check API key existence on mount and after modal closes
  useEffect(() => {
    const checkApiKey = () => {
      setApiKeyExists(!!localStorage.getItem("groq_api_key"));
    };
    checkApiKey();
  }, [isSettingsOpen]);

  const handleExport = () => {
    const rawSuggestions = suggestionsRef.current
      ? suggestionsRef.current.getExportData()
      : [];
    const rawChat = chatRef.current ? chatRef.current.getExportData() : [];

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TwinMind Meeting Notes - ${new Date().toLocaleDateString()}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
  h1 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 5px; }
  h2 { color: #111827; margin-top: 40px; border-bottom: 1px solid #f3f4f6; padding-bottom: 5px; }
  .timestamp { color: #6b7280; font-size: 0.85em; font-family: monospace; }
  .chat-block { margin-bottom: 20px; padding: 20px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
  .chat-role { font-weight: bold; margin-bottom: 8px; color: #4f46e5; font-size: 0.9em; text-transform: uppercase; letter-spacing: 0.05em; }
  .chat-role.ai { color: #059669; }
  .suggestion-card { margin-top: 15px; padding: 15px 20px; border-left: 4px solid #4f46e5; background: #fff; border-radius: 0 8px 8px 0; border: 1px solid #e5e7eb; border-left-width: 4px; }
  .suggestion-cat { font-size: 0.75em; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold; color: #4f46e5; margin-bottom: 4px; }
  .transcript-line { margin-bottom: 10px; }
  @media print {
    body { padding: 0; max-width: 100%; }
    .chat-block { page-break-inside: avoid; }
    .suggestion-card { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <h1>TwinMind Meeting Notes</h1>
  <p style="color: #6b7280; margin-top: 0;"><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  
  <h2>1. Directed Q&A / Action Items</h2>
  ${
    rawChat.length === 0
      ? "<p><i>No direct chat inquiries were recorded during this meeting.</i></p>"
      : rawChat
          .map(
            (msg) => `
      <div class="chat-block">
        <div class="chat-role ${msg.role === "ai" ? "ai" : ""}">${msg.role === "user" ? "👤 User:" : "🤖 TwinMind AI:"}</div>
        <div style="white-space: pre-wrap;">${msg.content}</div>
      </div>
    `,
          )
          .join("")
  }
  
  <h2>2. Key Meeting Insights & Suggestions</h2>
  ${
    rawSuggestions.length === 0
      ? "<p><i>No AI insights were generated during this meeting.</i></p>"
      : rawSuggestions
          .map(
            (batch) => `
      <div style="margin-bottom: 40px;">
        <div class="timestamp">Insights generated at ${batch.timestamp}</div>
        ${batch.suggestions
          .map(
            (s) => `
          <div class="suggestion-card">
            <div class="suggestion-cat">${s.category}</div>
            <strong style="display: block; margin-bottom: 6px; font-size: 1.1em; color: #111827;">${s.title}</strong>
            <p style="margin: 0; color: #4b5563;">${s.detail}</p>
          </div>
        `,
          )
          .join("")}
      </div>
    `,
          )
          .join("")
  }
  
  <hr style="margin: 50px 0; border: 0; border-top: 2px solid #e5e7eb;" />
  
  <h2>3. Verbatim Transcript Appendix</h2>
  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
  ${
    transcripts.length === 0
      ? "<p><i>No audio transcript was recorded.</i></p>"
      : transcripts
          .map(
            (t) => `
      <div class="transcript-line">
        <span class="timestamp">[${t.timestamp}]</span> ${t.text}
      </div>
    `,
          )
          .join("")
  }
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    // Create hidden anchor to trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `TwinMind_Meeting_Notes_${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen min-h-[100dvh] bg-slate-50 dark:bg-slate-900">
      <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center shadow-sm z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
          🧠 TwinMind
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300 font-medium text-sm border border-slate-200 dark:border-slate-700"
            title="Export session data as JSON"
          >
            📥 Export
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300 font-medium text-sm border border-slate-200 dark:border-slate-700"
            title={apiKeyExists ? "API Key Configured" : "Missing API Key"}
          >
            ⚙️ Settings
            {apiKeyExists ? (
              <span className="relative flex w-2.5 h-2.5">
                <span className="absolute inline-flex w-full h-full rounded-full opacity-75 bg-green-400"></span>
                <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-green-500"></span>
              </span>
            ) : (
              <span className="relative flex w-2.5 h-2.5">
                <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-red-400"></span>
                <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-red-500"></span>
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 flex-1 overflow-hidden">
        <div className="h-[500px] lg:h-auto overflow-hidden">
          <Transcript
            transcripts={transcripts}
            setTranscripts={setTranscripts}
            flushMicRef={flushMicRef}
          />
        </div>
        <div className="h-[500px] lg:h-auto overflow-hidden">
          <Suggestions
            ref={suggestionsRef}
            transcripts={transcripts}
            onRefresh={() => {
              if (flushMicRef.current) flushMicRef.current();
            }}
            onSuggestionClick={(s) =>
              setSelectedSuggestion(s.title + ": " + s.detail)
            }
          />
        </div>
        <div className="h-[500px] lg:h-auto overflow-hidden">
          <Chat
            ref={chatRef}
            transcripts={transcripts}
            externalQuery={selectedSuggestion}
            setExternalQuery={setSelectedSuggestion}
          />
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
