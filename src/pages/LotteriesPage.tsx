import { useState, useEffect } from 'react'
import type { PageId } from '@/lib/fortune-data'

import { useNavigate } from 'react-router-dom'

function useCountdown(totalSeconds: number) {
  const [secs, setSecs] = useState(totalSeconds)
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])
  const d = Math.floor(secs / 86400)
  const h = Math.floor((secs % 86400) / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return [
    String(d).padStart(2, '0'),
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0'),
  ]
}

const lotteries: { id: PageId; name: string; sub: string; range: string; drawSecs: number }[] = [
  { id: 'cashpot', name: 'Jamaica Cashpot', sub: 'CASHPOT MAIN', range: '01–36', drawSecs: 2 * 86400 + 4 * 3600 + 22 * 60 + 10 },
  { id: 'money-time', name: 'Money Time', sub: 'MT NEW', range: '01–36', drawSecs: 1 * 86400 + 2 * 3600 + 15 * 60 + 8 },
  { id: 'pick-2-single', name: 'Pick 2 Single', sub: 'P2 CLASSIC', range: '00–99', drawSecs: 0 * 86400 + 5 * 3600 + 45 * 60 },
  { id: 'pick-2-double', name: 'P2 Double Digit', sub: 'CAYMAN P2', range: '00–99', drawSecs: 0 * 86400 + 6 * 3600 + 40 * 60 + 19 },
]

function GameCard({ game }: { game: typeof lotteries[0] }) {
  const routerNavigate = useNavigate()
  const navigate = (path: string) => routerNavigate(`/${path}`)
  const [d, h, m, s] = useCountdown(game.drawSecs)
  return (
    <div className="bg-fortune-card border border-border/60 rounded-xl flex overflow-hidden shadow-[0_0_10px_rgba(224,172,44,0.05)] hover:shadow-[0_0_20px_rgba(224,172,44,0.15)] hover:-translate-y-1 transition-all duration-300 group">
      {/* Left: Image */}
      <div className="w-[38%] sm:w-[32%] relative shrink-0 bg-background overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background flex items-center justify-center">
          <span className="text-5xl opacity-60">🎰</span>
        </div>
        {/* slant overlay */}
        <div
          className="absolute top-0 bottom-0 right-0 w-8 bg-fortune-card z-20"
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)', transform: 'translateX(1px)' }}
        />
      </div>

      {/* Right: Content */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center z-20">
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded text-[10px] font-bold whitespace-nowrap">
            {game.name}
          </span>
          <h3 className="font-bold text-foreground text-sm text-right pl-2 leading-tight">{game.sub}</h3>
        </div>

        {/* Countdown */}
        <div className="mb-4 text-right">
          <p className="text-[10px] text-muted-foreground mb-1.5 font-bold uppercase tracking-wider">Next Draw In</p>
          <div className="flex gap-1.5 justify-end">
            {[{ v: d, l: 'Day' }, { v: h, l: 'Hour' }, { v: m, l: 'Min' }, { v: s, l: 'Sec' }].map((t) => (
              <div key={t.l} className="flex flex-col items-center">
                <div className="w-9 h-8 rounded border border-border flex items-center justify-center bg-background mb-1">
                  <span className="font-extrabold text-xs text-foreground tabular-nums">{t.v}</span>
                </div>
                <span className="text-[9px] text-muted-foreground font-bold uppercase">{t.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bet Button */}
        <button
          onClick={() => navigate(game.id)}
          className="w-full py-2.5 font-bold text-xs rounded-lg text-center transition-all"
          style={{
            background: 'linear-gradient(to bottom, #5c9e42, #36791d)',
            color: 'white',
            boxShadow: '0 0 10px rgba(92,158,66,0.2)',
          }}
        >
          Bet Now
        </button>
      </div>
    </div>
  )
}

export function LotteriesPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
            Available <span className="gold-text">Lotteries & Draws</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Select an active game, choose your bet numbers, and place your wagers today.
          </p>
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lotteries.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

      </div>
    </div>
  )
}
