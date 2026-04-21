import heroesData from '@/data/heroes.json'
import matchupsData from '@/data/matchups.json'
import synergiesData from '@/data/synergies.json'
import type { Hero } from './types'

const W_WINRATE = 0.3
const W_SYNERGY = 0.3
const W_MATCHUP = 0.4

const heroes = heroesData as unknown as Hero[]
const heroById = new Map<number, Hero>(heroes.map((h) => [h.id, h]))
const matchups = matchupsData as Record<string, number>
const synergies = synergiesData as Record<string, number>

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x))
}

function heroWinRate(id: number): number {
  return heroById.get(id)?.winRate ?? 0.5
}

// a_vs_e = rate at which a beats e. Fall back to reversing e_vs_a if needed.
export function matchupRate(a: number, e: number): number {
  const direct = matchups[`${a}_vs_${e}`]
  if (direct !== undefined) return direct
  const reverse = matchups[`${e}_vs_${a}`]
  if (reverse !== undefined) return 1 - reverse
  return 0.5
}

function synergyRate(a: number, b: number): number {
  return (
    synergies[`${a}_with_${b}`] ?? synergies[`${b}_with_${a}`] ?? 0.5
  )
}

export interface ScoreBreakdown {
  total: number
  avgWinRate: number
  synergyBonus: number
  matchupAdvantage: number
}

export function teamScore(team: number[], enemy: number[]): ScoreBreakdown {
  let avgWinRate = 50
  if (team.length > 0) {
    let sum = 0
    for (const id of team) sum += heroWinRate(id)
    avgWinRate = (sum / team.length) * 100
  }

  let synergyBonus = 50
  if (team.length >= 2) {
    let deltaSum = 0
    let pairs = 0
    for (let i = 0; i < team.length; i++) {
      for (let j = i + 1; j < team.length; j++) {
        deltaSum += synergyRate(team[i], team[j]) - 0.5
        pairs++
      }
    }
    synergyBonus = clamp(50 + (deltaSum / pairs) * 500, 0, 100)
  }

  let matchupAdvantage = 50
  if (team.length > 0 && enemy.length > 0) {
    let deltaSum = 0
    let n = 0
    for (const a of team) {
      for (const e of enemy) {
        deltaSum += matchupRate(a, e) - 0.5
        n++
      }
    }
    matchupAdvantage = clamp(50 + (deltaSum / n) * 500, 0, 100)
  }

  const total =
    W_WINRATE * avgWinRate +
    W_SYNERGY * synergyBonus +
    W_MATCHUP * matchupAdvantage

  return { total, avgWinRate, synergyBonus, matchupAdvantage }
}

export interface Counterpick {
  heroId: number
  gain: number
  bestCounter: number | null
  bestCounterRate: number
  bestPartner: number | null
  bestPartnerRate: number
}

export function suggestCounterpicks(
  team: number[],
  enemy: number[],
  pool: number[],
  limit = 5,
): Counterpick[] {
  if (pool.length === 0) return []
  const base = teamScore(team, enemy).total

  const ranked: Counterpick[] = pool.map((h) => {
    const newScore = teamScore([...team, h], enemy).total

    let bestCounter: number | null = null
    let bestCounterRate = 0.5
    if (enemy.length > 0) {
      let best = -Infinity
      for (const e of enemy) {
        const r = matchupRate(h, e)
        if (r > best) {
          best = r
          bestCounter = e
          bestCounterRate = r
        }
      }
    }

    let bestPartner: number | null = null
    let bestPartnerRate = 0.5
    if (team.length > 0) {
      let best = -Infinity
      for (const t of team) {
        const r = synergyRate(h, t)
        if (r > best) {
          best = r
          bestPartner = t
          bestPartnerRate = r
        }
      }
    }

    return {
      heroId: h,
      gain: newScore - base,
      bestCounter,
      bestCounterRate,
      bestPartner,
      bestPartnerRate,
    }
  })

  ranked.sort((a, b) => b.gain - a.gain || a.heroId - b.heroId)
  return ranked.slice(0, limit)
}
