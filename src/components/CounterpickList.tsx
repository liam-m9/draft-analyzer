import heroesData from '@/data/heroes.json'
import { useDraftContext } from '@/context/DraftContext'
import { suggestCounterpicks } from '@/lib/analysis'
import type { Counterpick } from '@/lib/analysis'
import type { Hero, TeamId } from '@/lib/types'

const heroes = heroesData as unknown as Hero[]
const heroById = new Map<number, Hero>(heroes.map((h) => [h.id, h]))
const allIds = heroes.map((h) => h.id)

const teamColour = { 1: '#3b82f6', 2: '#f59e0b' } as const

function reasonsFor(pick: Counterpick): string[] {
  const counterDelta =
    pick.bestCounter !== null ? pick.bestCounterRate - 0.5 : 0
  const partnerDelta =
    pick.bestPartner !== null ? pick.bestPartnerRate - 0.5 : 0

  const counterName =
    pick.bestCounter !== null ? heroById.get(pick.bestCounter)?.name : null
  const partnerName =
    pick.bestPartner !== null ? heroById.get(pick.bestPartner)?.name : null

  const counterLine =
    counterDelta > 0.02 && counterName ? `counters ${counterName}` : null
  const partnerLine =
    partnerDelta > 0.02 && partnerName ? `pairs with ${partnerName}` : null

  const lines: string[] = []
  if (counterDelta > partnerDelta) {
    if (counterLine) lines.push(counterLine)
    if (partnerLine) lines.push(partnerLine)
  } else {
    if (partnerLine) lines.push(partnerLine)
    if (counterLine) lines.push(counterLine)
  }
  return lines
}

function gainColour(gain: number): string {
  if (gain > 0.1) return '#22c55e'
  if (gain < -0.1) return '#ef4444'
  return '#71717a'
}

export function CounterpickList({ team }: { team: TeamId }) {
  const { state } = useDraftContext()
  const team1 = state.team1.filter((id): id is number => id != null)
  const team2 = state.team2.filter((id): id is number => id != null)
  const own = team === 1 ? team1 : team2
  const opp = team === 1 ? team2 : team1
  const isTeam1 = team === 1

  const picked = new Set<number>([...team1, ...team2])
  const pool = allIds.filter((id) => !picked.has(id))
  const picks = suggestCounterpicks(own, opp, pool, 5)
  if (picks.length === 0) return null

  const alignText = isTeam1 ? 'text-left' : 'text-right'

  return (
    <div className="flex flex-col">
      <div
        className={`text-[11px] font-medium uppercase tracking-wide mb-2 ${alignText}`}
        style={{ color: teamColour[team] }}
      >
        Suggestions
      </div>
      <ul className="flex flex-col">
        {picks.map((pick) => {
          const hero = heroById.get(pick.heroId)
          if (!hero) return null
          const gainStr =
            (pick.gain >= 0 ? '+' : '') + pick.gain.toFixed(1)
          const lines = reasonsFor(pick)
          return (
            <li
              key={pick.heroId}
              className={`flex items-center gap-3 py-2 border-t border-[#1e1e2e] first:border-t-0 ${
                isTeam1 ? '' : 'flex-row-reverse'
              }`}
            >
              <div className={`flex-1 min-w-0 ${alignText}`}>
                <div className="text-sm text-[#d4d4d8] truncate leading-tight">
                  {hero.name}
                </div>
                {lines.map((line, i) => (
                  <div
                    key={i}
                    className="text-[11px] text-[#71717a] truncate leading-tight"
                  >
                    {line}
                  </div>
                ))}
              </div>
              <div
                className="text-sm font-medium tabular-nums flex-shrink-0"
                style={{ color: gainColour(pick.gain) }}
              >
                {gainStr}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
