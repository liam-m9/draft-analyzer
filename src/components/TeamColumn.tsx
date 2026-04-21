import { HeroSlot } from './HeroSlot'
import { CounterpickList } from './CounterpickList'
import { useDraftContext } from '@/context/DraftContext'
import { teamScore } from '@/lib/analysis'
import type { TeamId } from '@/lib/types'

const config = {
  1: { title: 'Team 1', colour: '#3b82f6' },
  2: { title: 'Team 2', colour: '#f59e0b' },
} as const

export function TeamColumn({ team }: { team: TeamId }) {
  const { state } = useDraftContext()
  const cfg = config[team]
  const isTeam1 = team === 1

  const team1 = state.team1.filter((id): id is number => id != null)
  const team2 = state.team2.filter((id): id is number => id != null)
  const own = team === 1 ? team1 : team2
  const opp = team === 1 ? team2 : team1

  const score = teamScore(own, opp)
  const barPct = Math.max(0, Math.min(100, score.total))
  const showCounterpicks = own.length < 6 && opp.length > 0
  const alignText = isTeam1 ? 'text-left' : 'text-right'

  return (
    <section className="w-[240px] flex-shrink-0 bg-[#0a0a0f] p-3 flex flex-col min-h-0">
      <div className="mb-3 flex-shrink-0">
        <div
          className={`text-[11px] font-medium uppercase tracking-wide ${alignText}`}
          style={{ color: cfg.colour }}
        >
          {cfg.title}
        </div>
        <div
          className={`text-4xl font-semibold text-[#d4d4d8] leading-none mt-1 tabular-nums ${alignText}`}
        >
          {score.total.toFixed(1)}
        </div>
        <div
          className="h-[2px] bg-[#1e1e2e] mt-2"
          style={{ direction: isTeam1 ? 'ltr' : 'rtl' }}
        >
          <div
            className="h-full transition-[width] duration-150"
            style={{ width: `${barPct}%`, backgroundColor: cfg.colour }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 flex-shrink-0">
        {Array.from({ length: 6 }, (_, i) => (
          <HeroSlot key={i} team={team} index={i} />
        ))}
      </div>

      {showCounterpicks && (
        <div className="mt-3 pt-3 border-t border-[#1e1e2e] min-h-0 overflow-y-auto no-scrollbar">
          <CounterpickList team={team} />
        </div>
      )}
    </section>
  )
}
