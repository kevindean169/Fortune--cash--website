import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { GameCard } from '@/components/GameCard'
import type { APILottery } from '@/types/lottery'

export function LotteriesPage() {
  const [lotteries, setLotteries] = useState<APILottery[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || ''
    fetch(`${baseUrl}/api/lotteries`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch lotteries data')
        }
        return res.json()
      })
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          setLotteries(data.data)
        } else {
          throw new Error(data.message || 'Invalid data structure received')
        }
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="py-12">
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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-[280px] bg-[#0c0c0c] rounded-2xl animate-pulse border border-white/5 p-6 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                  <div className="h-6 w-32 bg-white/5 rounded-md" />
                </div>
                <div className="flex gap-4 items-center mt-2">
                  <div className="h-24 w-24 rounded-full bg-white/5" />
                  <div className="space-y-3 mt-8">
                    <div className="h-4 w-24 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="mt-auto space-y-4">
                   <div className="flex justify-end gap-2">
                     <div className="h-12 w-12 bg-white/5 rounded-lg" />
                     <div className="h-12 w-12 bg-white/5 rounded-lg" />
                     <div className="h-12 w-12 bg-white/5 rounded-lg" />
                   </div>
                   <div className="h-12 w-full bg-white/5 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400 font-semibold mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()} className="gold-gradient text-white font-bold">
              Try Again
            </Button>
          </div>
        ) : lotteries.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No lotteries available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lotteries.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
