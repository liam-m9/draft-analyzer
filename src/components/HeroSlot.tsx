import heroesData from '@/data/heroes.json'
import { useDraftContext } from '@/context/DraftContext'
import type { Hero, TeamId } from '@/lib/types'

const heroes = heroesData as unknown as Hero[]
const heroMap = new Map<number, Hero>(heroes.map((h) => [h.id, h]))

export function HeroSlot({ team, index }: { team: TeamId; index: number }) {
  const { state, openSlot, clearSlot } = useDraftContext()
  const heroId = team === 1 ? state.team1[index] : state.team2[index]
  const hero = heroId != null ? heroMap.get(heroId) : null
  const isTeam1 = team === 1

  if (!hero) {
    return (
      <button
        type="button"
        onClick={() => openSlot(team, index)}
        className="w-full h-8 border border-dashed border-[#1e1e2e] text-[#52525b] hover:border-[#52525b] hover:text-[#71717a] text-xs flex items-center justify-center"
      >
        +
      </button>
    )
  }

  const winPct = Math.round(hero.winRate * 100)
  return (
    <button
      type="button"
      onClick={() => clearSlot(team, index)}
      title={`${hero.name} — click to remove`}
      className={`w-full bg-[#12121a] border border-[#1e1e2e] px-2 py-1.5 flex items-center gap-2 hover:border-[#2a2a3a] ${
        isTeam1 ? '' : 'flex-row-reverse'
      }`}
    >
      <div className="w-9 h-9 bg-[#0a0a0f] border border-[#1e1e2e] overflow-hidden flex-shrink-0">
        <img
          src={hero.imageUrl}
          alt={hero.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div
        className={`flex-1 min-w-0 ${isTeam1 ? 'text-left' : 'text-right'}`}
      >
        <div className="text-sm text-[#d4d4d8] truncate leading-tight">
          {hero.name}
        </div>
        <div className="text-[10px] text-[#71717a] tabular-nums leading-tight">
          {winPct}%
        </div>
      </div>
    </button>
  )
}
