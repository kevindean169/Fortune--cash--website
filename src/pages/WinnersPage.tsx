import { Card, CardContent } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import type { PageId } from '@/lib/fortune-data'

import { useNavigate } from 'react-router-dom'

const recentWinners = [
  { name: 'James R.', amount: '$1,300', game: 'Cashpot', number: '14', date: '28 May' },
  { name: 'Maria G.', amount: '$900', game: 'Cashpot', number: '22', date: '25 May' },
  { name: 'Robert T.', amount: '$2,500', game: 'Money Time', number: '07', date: '22 May' },
  { name: 'Sarah K.', amount: '$650', game: 'Cashpot', number: '31', date: '20 May' },
  { name: 'David M.', amount: '$1,100', game: 'Pick 2 Single', number: '45', date: '18 May' },
  { name: 'Lisa P.', amount: '$3,200', game: 'Cashpot', number: '08', date: '15 May' },
  { name: 'Carlos B.', amount: '$750', game: 'Pick 2 Double', number: '12,33', date: '14 May' },
  { name: 'Emma S.', amount: '$1,800', game: 'Money Time', number: '19', date: '12 May' },
  { name: 'Tom H.', amount: '$2,100', game: 'Cashpot', number: '11', date: '10 May' },
  { name: 'Julie W.', amount: '$500', game: 'Pick 2 Single', number: '99', date: '08 May' },
]

export function WinnersPage() {
  const routerNavigate = useNavigate()
  const navigate = (path: string) => routerNavigate(path === 'home' ? '/' : `/${path}`)
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <button onClick={() => navigate('home')} className="text-primary hover:underline text-sm font-bold mb-4 inline-block">
            ← Back to Home
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Hall of <span className="gold-text">Fame</span>
          </h1>
          <p className="text-muted-foreground mt-2">All winners on the platform.</p>
        </div>

        {/* Winners Grid */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
            <h3 className="font-bold text-base text-foreground">All Winners</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentWinners.map((w, i) => (
              <Card
                key={i}
                className="bg-fortune-card border border-border/60 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(224,172,44,0.1)] transition-all duration-300"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Trophy className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm leading-tight">{w.name}</p>
                        <p className="text-xs text-muted-foreground">{w.date}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between pt-3 border-t border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Won Playing</p>
                      <p className="text-xs font-semibold text-foreground">
                        {w.game} <span className="text-muted-foreground">#{w.number}</span>
                      </p>
                    </div>
                    <span className="font-extrabold text-xl gold-text">{w.amount}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
