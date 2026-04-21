import { useEffect, useMemo, useState } from 'react'
import heroesData from '@/data/heroes.json'
import { useDraftContext } from '@/context/DraftContext'
import type { Hero } from '@/lib/types'

const allHeroes = (heroesData as unknown as Hero[])
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name))

export function HeroSelector() {
  const { pickedIds, pickHero, closeSelector } = useDraftContext()
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSelector()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeSelector])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allHeroes
    return allHeroes.filter((h) => h.name.toLowerCase().includes(q))
  }, [query])

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={closeSelector}
    >
      <div
        className="w-[min(780px,95vw)] max-h-[85vh] bg-[#12121a] border border-[#1e1e2e] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-[#1e1e2e] flex items-center gap-2">
          <input
            autoFocus
            type="text"
            placeholder="search heroes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-[#0a0a0f] border border-[#1e1e2e] px-3 py-2 text-sm text-[#d4d4d8] placeholder:text-[#52525b] focus:outline-none focus:border-[#52525b]"
          />
          <button
            type="button"
            onClick={closeSelector}
            className="text-xs text-[#71717a] hover:text-[#d4d4d8] px-2 py-2 uppercase tracking-wide"
          >
            esc
          </button>
        </div>
        <div className="p-3 overflow-y-auto grid grid-cols-5 sm:grid-cols-7 md:grid-cols-8 gap-2">
          {filtered.map((h) => {
            const picked = pickedIds.has(h.id)
            return (
              <button
                key={h.id}
                type="button"
                disabled={picked}
                onClick={() => pickHero(h.id)}
                className={`flex flex-col items-center gap-1 p-1 ${
                  picked
                    ? 'opacity-25 cursor-not-allowed'
                    : 'hover:bg-[#1e1e2e]'
                }`}
              >
                <div className="w-14 h-14 bg-[#0a0a0f] border border-[#1e1e2e] overflow-hidden">
                  <img
                    src={h.imageUrl}
                    alt={h.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] text-[#d4d4d8] truncate max-w-14">
                  {h.name}
                </span>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-sm text-[#71717a] py-8 text-center">
              no heroes match "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
