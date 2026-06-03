import { TrendingUp, Calendar, Award, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Winning {
  id: string
  game: string
  winningNumbers: number[]
  yourNumbers: number[]
  winAmount: number
  date: string
  multiplier: number
}

export default function MyWinningsPage() {
  const winnings: Winning[] = [
    {
      id: '1',
      game: 'Pick 4',
      winningNumbers: [1, 2, 3, 4],
      yourNumbers: [1, 2, 3, 4],
      winAmount: 500.00,
      date: '2024-06-01',
      multiplier: 250,
    },
    {
      id: '2',
      game: 'Pick 3',
      winningNumbers: [2, 4, 6],
      yourNumbers: [2, 4, 6],
      winAmount: 150.00,
      date: '2024-05-25',
      multiplier: 100,
    },
  ]

  const totalWinnings = winnings.reduce((sum, w) => sum + w.winAmount, 0)
  const largestWin = Math.max(...winnings.map(w => w.winAmount))
  const averageWin = (totalWinnings / winnings.length).toFixed(2)

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3 mb-2">
            <Award className="w-10 h-10 text-primary" />
            My Winnings
          </h1>
          <p className="text-muted-foreground">View your winning tickets and prize history</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Winnings</p>
                  <p className="text-3xl font-bold text-green-500">${totalWinnings.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Largest Win</p>
                  <p className="text-3xl font-bold text-primary">${largestWin.toFixed(2)}</p>
                </div>
                <Award className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Average Win</p>
                  <p className="text-3xl font-bold text-primary">${averageWin}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Wins</p>
                  <p className="text-3xl font-bold text-primary">{winnings.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Winning Tickets
            </CardTitle>
            <CardDescription>Detailed breakdown of your winning combinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {winnings.map(winning => (
                <div
                  key={winning.id}
                  className="p-6 border border-border rounded-lg bg-gradient-to-r from-green-500/5 to-primary/5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-foreground">{winning.game}</h3>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 border">
                          Won
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(winning.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-500">${winning.winAmount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Prize × {winning.multiplier}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Your Numbers</p>
                      <div className="flex gap-2 flex-wrap">
                        {winning.yourNumbers.map(num => (
                          <span
                            key={num}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Winning Numbers</p>
                      <div className="flex gap-2 flex-wrap">
                        {winning.winningNumbers.map(num => (
                          <span
                            key={num}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500/20 border border-green-500/50 text-green-500 font-bold text-sm"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
