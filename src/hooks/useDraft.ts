import { useCallback, useMemo, useState } from 'react'
import type { DraftState, TeamId } from '@/lib/types'

const emptyTeam = (): (number | null)[] => [null, null, null, null, null, null]

export function useDraft() {
  const [state, setState] = useState<DraftState>({
    team1: emptyTeam(),
    team2: emptyTeam(),
    activeSlot: null,
  })

  const openSlot = useCallback((team: TeamId, index: number) => {
    setState((s) => ({ ...s, activeSlot: { team, index } }))
  }, [])

  const closeSelector = useCallback(() => {
    setState((s) => ({ ...s, activeSlot: null }))
  }, [])

  const pickHero = useCallback((heroId: number) => {
    setState((s) => {
      if (!s.activeSlot) return s
      const key = s.activeSlot.team === 1 ? 'team1' : 'team2'
      const next = [...s[key]]
      next[s.activeSlot.index] = heroId
      return { ...s, [key]: next, activeSlot: null }
    })
  }, [])

  const clearSlot = useCallback((team: TeamId, index: number) => {
    setState((s) => {
      const key = team === 1 ? 'team1' : 'team2'
      const next = [...s[key]]
      next[index] = null
      return { ...s, [key]: next }
    })
  }, [])

  const pickedIds = useMemo(() => {
    const ids = new Set<number>()
    for (const id of state.team1) if (id != null) ids.add(id)
    for (const id of state.team2) if (id != null) ids.add(id)
    return ids
  }, [state.team1, state.team2])

  return { state, pickedIds, openSlot, closeSelector, pickHero, clearSlot }
}
