import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { GameCard } from '@/components/GameCard'
import { ArrowLeft } from 'lucide-react'
import type { APILottery } from '@/types/lottery'

function formatTypeName(type: string | null): string {
  if (!type) return 'Lotteries'
  const t = type.toLowerCase()
  if (t === 'cashpot') return 'Cashpot'
  if (t === 'money-time') return 'Money Time'
  if (t === 'pick-2-single') return 'Pick 2 Single'
  if (t === 'pick-2-double') return 'Pick 2 Double'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export function LotteriesByTypePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const typeParam = searchParams.get('type')
  const [lotteries, setLotteries] = useState<APILottery[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!typeParam) {
      setError('No lottery type specified')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const baseUrl = import.meta.env.VITE_API_URL || ''
    fetch(`${baseUrl}/api/lotteries-by-type?type=${encodeURIComponent(typeParam)}`)
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
  }, [typeParam])

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <span className="size-7 rounded-lg border border-border/60 flex items-center justify-center bg-white/5 group-hover:border-primary/50 transition-colors">
            <ArrowLeft className="size-3.5" />
          </span>
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
            Available <span className="gold-text">{formatTypeName(typeParam)} Lotteries</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Select one of our active {formatTypeName(typeParam)} games, choose your bet numbers, and place your wagers today.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
            No lotteries available for {formatTypeName(typeParam)} at the moment.
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
