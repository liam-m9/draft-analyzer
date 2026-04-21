/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useDraft } from '@/hooks/useDraft'

type DraftValue = ReturnType<typeof useDraft>

const DraftContext = createContext<DraftValue | null>(null)

export function DraftProvider({ children }: { children: ReactNode }) {
  const value = useDraft()
  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
}

export function useDraftContext(): DraftValue {
  const ctx = useContext(DraftContext)
  if (!ctx) throw new Error('useDraftContext must be used inside DraftProvider')
  return ctx
}
