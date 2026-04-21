export type TeamId = 1 | 2

export interface Hero {
  id: number
  name: string
  imageUrl: string
  winRate: number
  pickRate: number
  role: 'carry' | 'support' | 'flex'
}

export interface ActiveSlot {
  team: TeamId
  index: number
}

export interface DraftState {
  team1: (number | null)[]
  team2: (number | null)[]
  activeSlot: ActiveSlot | null
}
