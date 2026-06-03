import { Ticket, Calendar, DollarSign, Trophy } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Lottery {
  id: string
  game: string
  numbers: number[]
  date: string
  amount: number
  status: 'pending' | 'won' | 'lost'
}

export default function MyLotteriesPage() {
  const lotteries: Lottery[] = [
    {
      id: '1',
      game: 'Pick 4',
      numbers: [1, 2, 3, 4],
      date: '2024-06-01',
      amount: 2.00,
      status: 'won',
    },
    {
      id: '2',
      game: 'Cash Pop',
      numbers: [7, 8, 9],
      date: '2024-05-30',
      amount: 5.00,
      status: 'pending',
    },
    {
      id: '3',
      game: 'Pick 2',
      numbers: [5, 6],
      date: '2024-05-28',
      amount: 1.00,
      status: 'lost',
    },
    {
      id: '4',
      game: 'Pick 3',
      numbers: [2, 4, 6],
      date: '2024-05-25',
      amount: 1.50,
      status: 'won',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'lost':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <Trophy className="w-4 h-4" />
      case 'pending':
        return <Calendar className="w-4 h-4" />
      case 'lost':
        return <Ticket className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3 mb-2">
            <Ticket className="w-10 h-10 text-primary" />
            My Lotteries
          </h1>
          <p className="text-muted-foreground">Track all your lottery tickets and results</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Tickets</p>
                  <p className="text-3xl font-bold text-primary">{lotteries.length}</p>
                </div>
                <Ticket className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Spent</p>
                  <p className="text-3xl font-bold text-primary">${lotteries.reduce((sum, l) => sum + l.amount, 0).toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Won</p>
                  <p className="text-3xl font-bold text-green-500">{lotteries.filter(l => l.status === 'won').length}</p>
                </div>
                <Trophy className="w-8 h-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Pending</p>
                  <p className="text-3xl font-bold text-yellow-500">{lotteries.filter(l => l.status === 'pending').length}</p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>Your lottery ticket history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lotteries.map(lottery => (
                <div
                  key={lottery.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Ticket className="w-6 h-6 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{lottery.game}</h3>
                        <Badge className={`${getStatusColor(lottery.status)} border`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(lottery.status)}
                            {lottery.status.charAt(0).toUpperCase() + lottery.status.slice(1)}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Numbers: {lottery.numbers.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-semibold text-primary">${lottery.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(lottery.date).toLocaleDateString()}</p>
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
