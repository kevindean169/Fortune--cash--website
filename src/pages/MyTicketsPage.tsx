import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'



const mockTickets = [
  { orderNo: '10113', ticketNo: '02', game: 'CASHPOT', betOption: 'Cashpot', drawTime: '06:00 PM', price: 1.00, drawDate: 'May 30, 2026', status: 'Won', payout: 26.00 },
  { orderNo: '10112', ticketNo: '14', game: 'CASHPOT', betOption: 'Megaball', drawTime: '06:00 PM', price: 2.00, drawDate: 'May 30, 2026', status: 'Won', payout: 72.00 },
  { orderNo: '10111', ticketNo: '28', game: 'Money Time', betOption: 'Cashpot Money Time', drawTime: '04:00 PM', price: 5.00, drawDate: 'May 30, 2026', status: 'Won', payout: 130.00 },
  { orderNo: '10110', ticketNo: '07', game: 'Pick 2 Single', betOption: 'Pick 2 Single', drawTime: '07:00 PM', price: 1.00, drawDate: 'May 29, 2026', status: 'Lost', payout: 0 },
  { orderNo: '10109', ticketNo: '44', game: 'P2 Double Digit', betOption: 'Pick 2 Double', drawTime: '08:00 PM', price: 2.00, drawDate: 'May 29, 2026', status: 'Pending', payout: 0 },
  { orderNo: '10108', ticketNo: '22', game: 'CASHPOT', betOption: 'Monstaball', drawTime: '08:25 PM', price: 5.00, drawDate: 'May 28, 2026', status: 'Lost', payout: 0 },
]



export function MyTicketsPage() {    const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filteredTickets = mockTickets.filter((t) => {
    const matchesStatus = filter === 'all' || t.status.toLowerCase() === filter
    const matchesSearch = t.orderNo.includes(search) || t.ticketNo.includes(search) || t.game.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const statusColor = (status: string) => {
    if (status === 'Won') return 'border-t-green-500'
    if (status === 'Lost') return 'border-t-red-500'
    return 'border-t-primary'
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">
              My <span className="gold-text">Tickets</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">View, search, and verify all your bet slip transactions</p>
          </div>
          <div className="bg-fortune-card border border-border/60 rounded-xl px-5 py-3 flex items-center gap-3">
            <span className="text-muted-foreground text-xs uppercase font-medium">Betting Wallet:</span>
            <span className="text-green-400 font-extrabold text-lg">$9,898.98</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <Card className="bg-fortune-card border border-border/60 mb-6">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Status Tabs */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide">
              {['all', 'won', 'lost', 'pending'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all ${
                    filter === status
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-background border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">🔍</span>
              <input
                type="text"
                placeholder="Search by Order ID or Number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <Card className="bg-fortune-card border border-border/60">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-base">No tickets found matching criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => (
              <Card
                key={ticket.orderNo}
                className={`bg-fortune-card border border-border/60 border-t-4 hover:-translate-y-1 transition-all ${statusColor(ticket.status)}`}
              >
                <CardContent className="p-6 flex flex-col justify-between">
                  <div>
                    {/* Top row */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-lg text-foreground">{ticket.game}</p>
                        <p className="text-[10px] text-muted-foreground">Order ID: #{ticket.orderNo}</p>
                      </div>
                      <Badge
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          ticket.status === 'Won'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : ticket.status === 'Lost'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-primary/10 text-primary border-primary/20'
                        }`}
                      >
                        {ticket.status}
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
                  {ticket.status === 'Won' && (
                    <div className="mt-4 p-3 bg-green-500/5 border border-green-500/20 rounded-xl flex justify-between items-center">
                      <span className="text-xs text-green-400 font-medium">Payout Received:</span>
                      <span className="font-extrabold text-green-400">+${ticket.payout.toFixed(2)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

    </div>
  )
}
