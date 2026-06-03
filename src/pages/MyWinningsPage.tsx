import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy } from 'lucide-react'

const mockWinnings = [
  { orderNo: '10113', ticketNo: '02', game: 'CASHPOT', betOption: 'Cashpot', drawTime: '06:00 PM', price: 1.00, drawDate: 'May 30, 2026', payout: 26.00 },
  { orderNo: '10112', ticketNo: '14', game: 'CASHPOT', betOption: 'Megaball', drawTime: '06:00 PM', price: 2.00, drawDate: 'May 30, 2026', payout: 72.00 },
  { orderNo: '10111', ticketNo: '28', game: 'Money Time', betOption: 'Cashpot Money Time', drawTime: '04:00 PM', price: 5.00, drawDate: 'May 30, 2026', payout: 130.00 },
]

export function MyWinningsPage() {
  const totalWinnings = mockWinnings.reduce((acc, t) => acc + t.payout, 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
            My <span className="gold-text">Winnings</span>
            <Trophy className="size-6 text-primary" />
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Review your successful bet slips and total payouts</p>
        </div>
        <div className="bg-fortune-card border border-border/60 rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="text-muted-foreground text-xs uppercase font-medium">Total Lifetime Winnings:</span>
          <span className="text-primary font-extrabold text-lg">${totalWinnings.toFixed(2)}</span>
        </div>
      </div>

      {/* Winnings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockWinnings.map((ticket) => (
          <Card
            key={ticket.orderNo}
            className="bg-fortune-card border border-border/60 border-t-4 border-t-green-500 hover:-translate-y-1 transition-all"
          >
            <CardContent className="p-6 flex flex-col justify-between">
              <div>
                {/* Top row */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-lg text-foreground">{ticket.game}</p>
                    <p className="text-[10px] text-muted-foreground">Order ID: #{ticket.orderNo}</p>
                  </div>
                  <Badge className="text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border-green-500/20">
                    WON
                  </Badge>
                </div>

                {/* Draw details */}
                <div className="space-y-2 py-4 border-y border-border/50 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bet Option:</span>
                    <span className="text-foreground font-medium">{ticket.betOption}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Draw Date:</span>
                    <span className="text-foreground font-medium">{ticket.drawDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Draw Time:</span>
                    <span className="text-foreground font-medium">{ticket.drawTime}</span>
                  </div>
                </div>

                {/* Bet digits */}
                <div className="flex justify-between items-center py-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Lucky Pick</p>
                    <span className="font-extrabold text-2xl text-primary">#{ticket.ticketNo}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase">Bet Amount</p>
                    <span className="font-semibold text-base text-foreground">${ticket.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Won payout */}
              <div className="mt-4 p-3 bg-green-500/5 border border-green-500/20 rounded-xl flex justify-between items-center">
                <span className="text-xs text-green-400 font-medium">Payout Received:</span>
                <span className="font-extrabold text-green-400">+${ticket.payout.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
