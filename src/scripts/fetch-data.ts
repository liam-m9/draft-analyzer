import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ASSETS = 'https://assets.deadlock-api.com'
const API = 'https://api.deadlock-api.com'

const MIN_MATCHES_PAIR = 500

type RawHero = {
  id: number
  name: string
  class_name: string
  disabled?: boolean
  in_development?: boolean
  images: {
    icon_hero_card?: string
    icon_image_small?: string
  }
}

type RawHeroStat = {
  hero_id: number
  wins: number
  losses: number
  matches: number
}

type RawCounterStat = {
  hero_id: number
  enemy_hero_id: number
  wins: number
  matches_played: number
}

type RawSynergyStat = {
  hero_id1: number
  hero_id2: number
  wins: number
  matches_played: number
}

type Hero = {
  id: number
  name: string
  imageUrl: string
  winRate: number
  pickRate: number
  role: 'carry' | 'support' | 'flex'
}

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`)
  return res.json() as Promise<T>
}

async function main() {
  console.log('fetching heroes...')
  const rawHeroes = await getJSON<RawHero[]>(`${ASSETS}/v2/heroes`)

  console.log('fetching hero stats...')
  const heroStats = await getJSON<RawHeroStat[]>(
    `${API}/v1/analytics/hero-stats`,
  )

  console.log('fetching counter stats...')
  const counters = await getJSON<RawCounterStat[]>(
    `${API}/v1/analytics/hero-counter-stats?min_matches=${MIN_MATCHES_PAIR}`,
  )

  console.log('fetching synergy stats...')
  const synergies = await getJSON<RawSynergyStat[]>(
    `${API}/v1/analytics/hero-synergy-stats?min_matches=${MIN_MATCHES_PAIR}`,
  )

  // hero stats → map by id
  const statsById = new Map<number, RawHeroStat>()
  let totalMatchSlots = 0
  for (const s of heroStats) {
    statsById.set(s.hero_id, s)
    totalMatchSlots += s.matches
  }

  // only include heroes that have a stats row — drops disabled / unreleased
  const heroes: Hero[] = []
  for (const h of rawHeroes) {
    const s = statsById.get(h.id)
    if (!s || s.matches === 0) continue
    if (h.disabled || h.in_development) continue
    const img = h.images.icon_hero_card ?? h.images.icon_image_small
    if (!img) continue
    heroes.push({
      id: h.id,
      name: h.name,
      imageUrl: img,
      winRate: s.wins / s.matches,
      pickRate: s.matches / totalMatchSlots,
      role: 'flex',
    })
  }
  heroes.sort((a, b) => a.id - b.id)

  const validIds = new Set(heroes.map((h) => h.id))

  const matchupsOut: Record<string, number> = {}
  for (const c of counters) {
    if (c.hero_id === c.enemy_hero_id) continue
    if (!validIds.has(c.hero_id) || !validIds.has(c.enemy_hero_id)) continue
    if (c.matches_played < MIN_MATCHES_PAIR) continue
    matchupsOut[`${c.hero_id}_vs_${c.enemy_hero_id}`] =
      c.wins / c.matches_played
  }

  const synergiesOut: Record<string, number> = {}
  for (const s of synergies) {
    if (s.hero_id1 === s.hero_id2) continue
    if (!validIds.has(s.hero_id1) || !validIds.has(s.hero_id2)) continue
    if (s.matches_played < MIN_MATCHES_PAIR) continue
    const rate = s.wins / s.matches_played
    // synergy is symmetric — write both orderings so lookups don't have to normalise
    synergiesOut[`${s.hero_id1}_with_${s.hero_id2}`] = rate
    synergiesOut[`${s.hero_id2}_with_${s.hero_id1}`] = rate
  }

  const here = dirname(fileURLToPath(import.meta.url))
  const dataDir = resolve(here, '../data')
  mkdirSync(dataDir, { recursive: true })

  writeFileSync(
    resolve(dataDir, 'heroes.json'),
    JSON.stringify(heroes, null, 2),
  )
  writeFileSync(
    resolve(dataDir, 'matchups.json'),
    JSON.stringify(matchupsOut, null, 2),
  )
  writeFileSync(
    resolve(dataDir, 'synergies.json'),
    JSON.stringify(synergiesOut, null, 2),
  )

  console.log(
    `done — ${heroes.length} heroes, ${Object.keys(matchupsOut).length} matchup pairs, ${Object.keys(synergiesOut).length} synergy pairs`,
  )
  console.log(`generated at ${new Date().toISOString()}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
