import { useDraftContext } from '@/context/DraftContext'
import { teamScore } from '@/lib/analysis'
import { MatchupMatrix } from './MatchupMatrix'

export function AnalysisPanel() {
  const { state } = useDraftContext()
  const team1 = state.team1.filter((id): id is number => id != null)
  const team2 = state.team2.filter((id): id is number => id != null)
  const showContent = team1.length > 0 && team2.length > 0

  const s1 = teamScore(team1, team2)
  const s2 = teamScore(team2, team1)

  return (
    <section className="flex-1 bg-[#0a0a0f] p-3 flex flex-col min-h-0 overflow-hidden">
      <h2 className="text-[11px] font-medium uppercase tracking-wide text-[#71717a] mb-3">
        Matchup Matrix
      </h2>

      {!showContent ? (
        <div className="flex-1 flex items-center justify-center text-sm text-[#71717a]">
          pick heroes to see analysis
        </div>
      ) : (
        <>
          <div className="flex justify-center">
            <MatchupMatrix team1={team1} team2={team2} />
          </div>

          <div className="flex items-center justify-center gap-10 mt-6">
            <div className="text-center">
              <div
                className="text-[11px] font-medium uppercase tracking-wide mb-1"
                style={{ color: '#3b82f6' }}
              >
                Team 1
              </div>
              <div
                className="text-4xl font-semibold tabular-nums leading-none"
                style={{ color: '#3b82f6' }}
              >
                {s1.total.toFixed(1)}
              </div>
            </div>
            <div className="text-xs uppercase tracking-wider text-[#71717a] pt-4">
              vs
            </div>
            <div className="text-center">
              <div
                className="text-[11px] font-medium uppercase tracking-wide mb-1"
                style={{ color: '#f59e0b' }}
              >
                Team 2
              </div>
              <div
                className="text-4xl font-semibold tabular-nums leading-none"
                style={{ color: '#f59e0b' }}
              >
                {s2.total.toFixed(1)}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
