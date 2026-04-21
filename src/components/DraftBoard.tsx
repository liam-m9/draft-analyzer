import { TeamColumn } from './TeamColumn'
import { HeroSelector } from './HeroSelector'
import { AnalysisPanel } from './AnalysisPanel'
import { useDraftContext } from '@/context/DraftContext'

export function DraftBoard() {
  const { state } = useDraftContext()

  return (
    <>
      <main className="flex-1 flex min-h-0">
        <TeamColumn team={1} />
        <div className="w-px bg-[#1e1e2e] flex-shrink-0" />
        <AnalysisPanel />
        <div className="w-px bg-[#1e1e2e] flex-shrink-0" />
        <TeamColumn team={2} />
      </main>
      {state.activeSlot && <HeroSelector />}
    </>
  )
}
