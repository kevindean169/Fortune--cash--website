import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Calendar, Trophy, ChevronRight } from 'lucide-react'
import { RECENT_RESULTS } from '@/lib/fortune-data'
import type { PageId } from '@/lib/fortune-data'

interface ResultsPageProps {
  navigate: (page: PageId) => void
}

const ALL_RESULTS = [
  ...RECENT_RESULTS,
  { date: 'Jun 01, 7:29 PM', game: 'Pick 4', numbers: [0, 5, 8, 3], jackpot: '$5,000', winners: 1 },
  { date: 'Jun 01, 7:29 PM', game: 'Pick 3', numbers: [7, 7, 2], jackpot: '$500', winners: 8 },
  { date: 'Jun 01, 7:29 PM', game: 'Pick 2', numbers: [9, 4], jackpot: '$50', winners: 63 },
  { date: 'Jun 01, 4:00 PM', game: 'Cash Pop', numbers: [3], jackpot: '$2,500', winners: 5 },
  { date: 'May 31, 7:29 PM', game: 'Pick 4', numbers: [2, 2, 9, 1], jackpot: '$5,000', winners: 3 },
  { date: 'May 31, 7:29 PM', game: 'Pick 3', numbers: [5, 0, 6], jackpot: '$500', winners: 19 },
  { date: 'May 31, 7:29 PM', game: 'Pick 2', numbers: [3, 8], jackpot: '$50', winners: 91 },
]

const GAME_COLORS: Record<string, string> = {
  'Cash Pop': 'bg-amber-500/20 text-amber-400',
  'Pick 2': 'bg-sky-500/20 text-sky-400',
  'Pick 3': 'bg-emerald-500/20 text-emerald-400',
  'Pick 4': 'bg-rose-500/20 text-rose-400',
}

export function ResultsPage({ navigate }: ResultsPageProps) {
  const [gameFilter, setGameFilter] = useState('all')
  const [searchDate, setSearchDate] = useState('')

  const filtered = ALL_RESULTS.filter(r => {
    const matchGame = gameFilter === 'all' || r.game === gameFilter
    const matchDate = !searchDate || r.date.toLowerCase().includes(searchDate.toLowerCase())
    return matchGame && matchDate
  })

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <Badge className="bg-primary/15 text-primary border-primary/25 mb-4">
            <Trophy className="size-3 mr-1" /> Winning Numbers
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Latest <span className="gold-text">Results</span>
          </h1>
          <p className="text-muted-foreground">Check winning numbers from all Fortune Lottery games</p>
        </div>

        {/* Next Draws Banner */}
        <div className="grid sm:grid-cols-4 gap-3 mb-8">
          {[
            { game: 'Cash Pop', time: '~2 min', icon: '💎', color: 'border-amber-500/30 bg-amber-500/5' },
            { game: 'Pick 2', time: '7:29 PM', icon: '✌️', color: 'border-sky-500/30 bg-sky-500/5' },
            { game: 'Pick 3', time: '7:29 PM', icon: '🎯', color: 'border-emerald-500/30 bg-emerald-500/5' },
            { game: 'Pick 4', time: '7:29 PM', icon: '🔥', color: 'border-rose-500/30 bg-rose-500/5' },
          ].map(d => (
            <Card key={d.game} className={`bg-fortune-card border ${d.color}`}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{d.icon}</span>
                  <div>
                    <p className="text-xs font-semibold">{d.game}</p>
                    <p className="text-xs text-muted-foreground">Next: {d.time}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary text-xs h-7 px-2"
                  onClick={() => navigate(d.game.toLowerCase().replace(' ', '-') as PageId)}
                >
                  Play <ChevronRight className="size-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by date..."
              value={searchDate}
              onChange={e => setSearchDate(e.target.value)}
              className="pl-9 bg-fortune-card border-border"
            />
          </div>
          <Select value={gameFilter} onValueChange={setGameFilter}>
            <SelectTrigger className="w-40 bg-fortune-card border-border">
              <SelectValue placeholder="All Games" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              <SelectItem value="Cash Pop">Cash Pop</SelectItem>
              <SelectItem value="Pick 2">Pick 2</SelectItem>
              <SelectItem value="Pick 3">Pick 3</SelectItem>
              <SelectItem value="Pick 4">Pick 4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Table */}
        <Card className="bg-fortune-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Date & Time</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Game</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Winning Numbers</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Prize</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Winners</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((result, i) => (
                  <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{result.date}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={`text-xs font-semibold border-0 ${GAME_COLORS[result.game] ?? ''}`}>
                        {result.game}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {result.numbers.map((n, ni) => (
                          <div key={ni} className="number-ball number-ball-result text-xs" style={{ width: '2rem', height: '2rem' }}>
                            {n}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-primary">{result.jackpot}</td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-semibold">{result.winners}</span>
                      <span className="text-xs text-muted-foreground ml-1">winner{result.winners !== 1 ? 's' : ''}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="size-10 mx-auto mb-3 opacity-30" />
              <p>No results found for your search.</p>
            </div>
          )}
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Results updated in real-time after each draw. For official results, visit the Florida Lottery website.
        </p>
      </div>
    </div>
  )
}
