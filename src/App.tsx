import { DraftProvider } from '@/context/DraftContext'
import { DraftBoard } from '@/components/DraftBoard'

function App() {
  return (
    <DraftProvider>
      <div className="h-dvh flex flex-col overflow-hidden">
        <header className="h-10 flex-shrink-0 border-b border-[#1e1e2e] flex items-center px-4">
          <span className="text-sm font-medium uppercase tracking-wide text-[#d4d4d8]">
            Deadlock Draft Analyser
          </span>
        </header>
        <DraftBoard />
      </div>
    </DraftProvider>
  )
}

export default App
