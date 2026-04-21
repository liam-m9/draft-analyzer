import type { ReactNode } from 'react'
import heroesData from '@/data/heroes.json'
import { matchupRate } from '@/lib/analysis'
import type { Hero } from '@/lib/types'

const heroes = heroesData as unknown as Hero[]
const heroById = new Map<number, Hero>(heroes.map((h) => [h.id, h]))

function shortName(name: string): string {
  if (name.length <= 5) return name
  const space = name.indexOf(' ')
  if (space > 0) {
    return `${name[0]}.${name.slice(space + 1, space + 4)}`
  }
  return name.slice(0, 5)
}

// green above 52%, red below 48%, neutral in between.
function cellColour(rate: number): string {
  const delta = rate - 0.5
  const intensity = Math.min(1, Math.abs(delta) / 0.1)
  const alpha = 0.18 + intensity * 0.55
  if (delta > 0.02) return `rgba(34, 197, 94, ${alpha})`
  if (delta < -0.02) return `rgba(239, 68, 68, ${alpha})`
  return 'rgba(82, 82, 91, 0.18)'
}

const CELL = 44
const ROW_HEADER_W = 72
const COL_HEADER_H = 26

export function MatchupMatrix({
  team1,
  team2,
}: {
  team1: number[]
  team2: number[]
}) {
  const items: ReactNode[] = []

  items.push(<div key="corner" />)
  for (const id of team2) {
    const h = heroById.get(id)
    if (!h) continue
    items.push(
      <div
        key={`ch-${id}`}
        className="flex items-end justify-center pb-1 text-[11px] font-medium"
        style={{ color: '#f59e0b' }}
        title={h.name}
      >
        {shortName(h.name)}
      </div>,
    )
  }

  for (const t1 of team1) {
    const t1h = heroById.get(t1)
    if (!t1h) continue
    items.push(
      <div
        key={`rh-${t1}`}
        className="flex items-center justify-end pr-3 text-[11px] font-medium"
        style={{ color: '#3b82f6' }}
        title={t1h.name}
      >
        {t1h.name}
      </div>,
    )
    for (const t2 of team2) {
      const t2h = heroById.get(t2)
      if (!t2h) continue
      const rate = matchupRate(t1, t2)
      items.push(
        <div
          key={`c-${t1}-${t2}`}
          className="flex items-center justify-center text-[11px] font-medium tabular-nums text-[#d4d4d8]"
          style={{ backgroundColor: cellColour(rate) }}
          title={`${t1h.name} vs ${t2h.name} — ${(rate * 100).toFixed(1)}%`}
        >
          {Math.round(rate * 100)}
        </div>,
      )
    }
  }

  return (
    <div
      className="inline-grid gap-px"
      style={{
        gridTemplateColumns: `${ROW_HEADER_W}px repeat(${team2.length}, ${CELL}px)`,
        gridTemplateRows: `${COL_HEADER_H}px repeat(${team1.length}, ${CELL}px)`,
      }}
    >
      {items}
    </div>
  )
}
