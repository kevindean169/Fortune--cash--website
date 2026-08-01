import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Clock, Zap } from 'lucide-react'
import { GAMES } from '@/lib/fortune-data'
import type { PageId } from '@/lib/fortune-data'

interface GamesPageProps {
  navigate: (page: PageId) => void
}

const gameDetails = {
  'cash-pop': {
    howToPlay: [
      'Choose 1 number from 1 to 15',
      'Pay $1 per play',
      'Match the drawn number to win up to $2,500',
      'Draws happen every 4 minutes, all day',
    ],
    prizes: [
      { match: 'Exact Match', prize: '$2,500', odds: '1 in 15' },
    ],
    highlight: 'Most frequent draws',
  },
  'pick-2': {
    howToPlay: [
      'Pick 2 digits from 0–9 for each position',
      'Choose Exact Order or Any Order',
      'Play from $0.50 per ticket',
      'Draw daily at 7:29 PM',
    ],
    prizes: [
      { match: 'Exact (Straight)', prize: '$50', odds: '1 in 100' },
      { match: 'Any Order (Box)', prize: '$25', odds: '1 in 50' },
      { match: 'Straight + Box', prize: '$37.50', odds: '1 in 100' },
    ],
    highlight: 'Best for beginners',
  },
  'pick-3': {
    howToPlay: [
      'Pick 3 digits from 0–9 for each position',
      'Choose play type: Exact, Any, Combo',
      'Play from $0.50 per ticket',
      'Draw daily at 7:29 PM',
    ],
    prizes: [
      { match: 'Exact (Straight)', prize: '$500', odds: '1 in 1,000' },
      { match: 'Any Order (Box 3-way)', prize: '$160', odds: '1 in 333' },
      { match: 'Any Order (Box 6-way)', prize: '$80', odds: '1 in 167' },
    ],
    highlight: 'Most popular game',
  },
  'pick-4': {
    howToPlay: [
      'Pick 4 digits from 0–9 for each position',
      'Choose play type: Exact, Any, Combo, 1-Off',
      'Play from $0.50 per ticket',
      'Draw daily at 7:29 PM',
    ],
    prizes: [
      { match: 'Exact (Straight)', prize: '$5,000', odds: '1 in 10,000' },
      { match: 'Any Order (Box 12-way)', prize: '$400', odds: '1 in 833' },
      { match: '1-Off Match', prize: '$2,500', odds: '1 in 5,000' },
    ],
    highlight: 'Highest top prize',
  },
}

export function GamesPage({ navigate }: GamesPageProps) {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge className="bg-primary/15 text-primary border-primary/25 mb-4">
            <Zap className="size-3 mr-1" /> All Games
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Choose Your <span className="gold-text">Game</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Four exciting ways to play. Picks drawn daily. Instant results, instant wins.
          </p>
        </div>

        {/* Game Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {GAMES.map(game => {
            const details = gameDetails[game.id as keyof typeof gameDetails]
            const getGameLogoSrc = (id: string) => {
              switch (id) {
                case 'cashpot':
                  return '/cashpot_logo.png?v=6'
                case 'money-time':
                  return '/moneytime_logo.png?v=6'
                case 'pick-2-single':
                  return '/pick2_single.png?v=6'
                case 'pick-2-double':
                  return '/pick2_double.png?v=6'
                default:
                  return null
              }
            }
            const logoSrc = getGameLogoSrc(game.id)
            return (
              <Card
                key={game.id}
                className="bg-fortune-card border-border card-hover overflow-hidden group cursor-pointer"
                onClick={() => navigate(game.id)}
              >
                <CardContent className="p-0">
                  {/* Card Header */}
                  <div className="relative p-6 pb-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {logoSrc ? (
                          <img src={logoSrc} alt={game.name} className="w-16 h-16 -m-2 object-contain" />
                        ) : (
                          <div className="text-4xl">{game.icon}</div>
                        )}
                        <div>
                          <h2 className="text-2xl font-extrabold">{game.name}</h2>
                          <p className="text-muted-foreground text-sm">{game.tagline}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-extrabold text-primary">{game.jackpot}</p>
                        <p className="text-xs text-muted-foreground">Top Prize</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="text-xs border-border/60 text-muted-foreground">
                        <Clock className="size-3 mr-1" /> {game.nextDraw}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-border/60 text-muted-foreground">
                        From {game.price}
                      </Badge>
                      <Badge className="text-xs bg-primary/15 text-primary border-primary/25">
                        {details.highlight}
                      </Badge>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="mx-6 border-t border-border/50" />

                  {/* Details */}
                  <div className="p-6 grid sm:grid-cols-2 gap-6">
                    {/* How to Play */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">How to Play</p>
                      <ol className="space-y-1.5">
                        {details.howToPlay.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="size-4 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Prize Table */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Prize Structure</p>
                      <div className="space-y-2">
                        {details.prizes.map((prize, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{prize.match}</span>
                            <div className="text-right">
                              <span className="font-bold text-primary">{prize.prize}</span>
                              <p className="text-xs text-muted-foreground">{prize.odds}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="px-6 pb-6">
                    <Button
                      className="w-full gold-gradient text-fortune-navy font-bold group-hover:opacity-90"
                      onClick={e => { e.stopPropagation(); navigate(game.id) }}
                    >
                      Play {game.name} <ArrowRight className="size-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Compare */}
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-6 text-center">Quick Comparison</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Game</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Numbers</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Min Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Top Prize</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Draw</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {GAMES.map((g, i) => (
                  <tr key={g.id} className={`border-b border-border/50 last:border-0 ${i % 2 === 0 ? '' : 'bg-fortune-card/30'}`}>
                    <td className="px-4 py-3 font-bold">{g.icon} {g.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">Pick {g.maxPick} from {g.poolSize}</td>
                    <td className="px-4 py-3 text-muted-foreground">{g.price}</td>
                    <td className="px-4 py-3 font-bold text-primary">{g.jackpot}</td>
                    <td className="px-4 py-3 text-muted-foreground">{g.drawTime}</td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        className="gold-gradient text-fortune-navy font-semibold"
                        onClick={() => navigate(g.id)}
                      >
                        Play
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
