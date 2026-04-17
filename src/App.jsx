import Transcript from './components/Transcript'
import Suggestions from './components/Suggestions'
import Chat from './components/Chat'

function App() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-screen min-h-[100dvh]">
      <div className="h-[500px] lg:h-auto overflow-hidden rounded-2xl">
        <Transcript />
      </div>
      <div className="h-[500px] lg:h-auto overflow-hidden rounded-2xl">
        <Suggestions />
      </div>
      <div className="h-[500px] lg:h-auto overflow-hidden rounded-2xl">
        <Chat />
      </div>
    </div>
  )
}

export default App
