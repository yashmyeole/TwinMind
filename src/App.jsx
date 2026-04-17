import { useState, useEffect, useRef } from 'react'
import Transcript from './components/Transcript'
import Suggestions from './components/Suggestions'
import Chat from './components/Chat'
import SettingsModal from './components/SettingsModal'

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [apiKeyExists, setApiKeyExists] = useState(false)
  const [transcripts, setTranscripts] = useState([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  const flushMicRef = useRef(null)

  // Check API key existence on mount and after modal closes
  useEffect(() => {
    const checkApiKey = () => {
      setApiKeyExists(!!localStorage.getItem('groq_api_key'))
    }
    checkApiKey()
  }, [isSettingsOpen])
  
  return (
    <div className="flex flex-col h-screen min-h-[100dvh] bg-slate-50 dark:bg-slate-900">
      <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center shadow-sm z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
          🧠 TwinMind
        </h1>
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
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 flex-1 overflow-hidden">
        <div className="h-[500px] lg:h-auto overflow-hidden">
          <Transcript transcripts={transcripts} setTranscripts={setTranscripts} flushMicRef={flushMicRef} />
        </div>
        <div className="h-[500px] lg:h-auto overflow-hidden">
          <Suggestions 
            transcripts={transcripts} 
            onRefresh={() => { if(flushMicRef.current) flushMicRef.current() }} 
            onSuggestionClick={(s) => setSelectedSuggestion(s.title + ": " + s.detail)}
          />
        </div>
        <div className="h-[500px] lg:h-auto overflow-hidden">
          <Chat 
             transcripts={transcripts}
             externalQuery={selectedSuggestion}
             setExternalQuery={setSelectedSuggestion}
          />
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}

export default App
