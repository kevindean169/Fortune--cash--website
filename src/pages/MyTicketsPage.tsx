import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Eye, Search, Calendar, Clock, Receipt, User, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface GameBet {
  ticket_number: string
  game_name: string
  draw_time: string
  bet_amount: number
  status?: 'Won' | 'Lost' | 'Pending'
  payout?: number
}

interface TicketOrder {
  lottery_id: number
  order_no: string
  card_id: string
  transaction_id: string
  status: 'void' | 'unvoid' | 'Won' | 'Lost' | 'Pending'
  lottery_name: string
  lottery_type: string
  customer_name: string
  customer_contact?: string
  created_at: string
  draw_date: string
  draw_time: string
  draw_no: string
  games: GameBet[]
}

const mockTickets: TicketOrder[] = [
  {
    lottery_id: 1,
    order_no: '10113',
    card_id: 'C-991',
    transaction_id: 'TRX771892',
    status: 'Won',
    lottery_name: 'Jamaica Cashpot',
    lottery_type: 'Cashpot',
    customer_name: 'John Doe',
    customer_contact: '+1 876-555-0192',
    created_at: '30 May 2026, 05:45 PM',
    draw_date: 'May 30, 2026',
    draw_time: '06:00 PM',
    draw_no: '4822',
    games: [
      { ticket_number: '02', game_name: 'CASHPOT', draw_time: '06:00 PM', bet_amount: 1.00, status: 'Won', payout: 26.00 }
    ]
  },
  {
    lottery_id: 1,
    order_no: '10112',
    card_id: 'C-990',
    transaction_id: 'TRX771891',
    status: 'Won',
    lottery_name: 'Jamaica Cashpot',
    lottery_type: 'Cashpot',
    customer_name: 'John Doe',
    customer_contact: '+1 876-555-0192',
    created_at: '30 May 2026, 05:40 PM',
    draw_date: 'May 30, 2026',
    draw_time: '06:00 PM',
    draw_no: '4822',
    games: [
      { ticket_number: '14', game_name: 'CASHPOT', draw_time: '06:00 PM', bet_amount: 2.00, status: 'Won', payout: 72.00 }
    ]
  },
  {
    lottery_id: 2,
    order_no: '10111',
    card_id: 'C-989',
    transaction_id: 'TRX771889',
    status: 'Won',
    lottery_name: 'Money Time',
    lottery_type: 'Cashpot Money Time',
    customer_name: 'John Doe',
    customer_contact: '+1 876-555-0192',
    created_at: '30 May 2026, 03:45 PM',
    draw_date: 'May 30, 2026',
    draw_time: '04:00 PM',
    draw_no: '1092',
    games: [
      { ticket_number: '28', game_name: 'Money Time', draw_time: '04:00 PM', bet_amount: 5.00, status: 'Won', payout: 130.00 }
    ]
  },
  {
    lottery_id: 3,
    order_no: '10110',
    card_id: 'C-988',
    transaction_id: 'TRX771880',
    status: 'Lost',
    lottery_name: 'Pick 2 Single',
    lottery_type: 'Pick 2 Single',
    customer_name: 'John Doe',
    customer_contact: '+1 876-555-0192',
    created_at: '29 May 2026, 06:45 PM',
    draw_date: 'May 29, 2026',
    draw_time: '07:00 PM',
    draw_no: '2291',
    games: [
      { ticket_number: '07', game_name: 'Pick 2 Single', draw_time: '07:00 PM', bet_amount: 1.00, status: 'Lost', payout: 0 }
    ]
  },
  {
    lottery_id: 4,
    order_no: '10109',
    card_id: 'C-987',
    transaction_id: 'TRX771876',
    status: 'Pending',
    lottery_name: 'P2 Double Digit',
    lottery_type: 'Pick 2 Double',
    customer_name: 'John Doe',
    customer_contact: '+1 876-555-0192',
    created_at: '29 May 2026, 07:45 PM',
    draw_date: 'May 29, 2026',
    draw_time: '08:00 PM',
    draw_no: '2292',
    games: [
      { ticket_number: '44', game_name: 'Pick 2 Double', draw_time: '08:00 PM', bet_amount: 2.00, status: 'Pending', payout: 0 }
    ]
  },
  {
    lottery_id: 1,
    order_no: '10108',
    card_id: 'C-986',
    transaction_id: 'TRX771871',
    status: 'Lost',
    lottery_name: 'Jamaica Cashpot',
    lottery_type: 'Cashpot',
    customer_name: 'John Doe',
    customer_contact: '+1 876-555-0192',
    created_at: '28 May 2026, 08:05 PM',
    draw_date: 'May 28, 2026',
    draw_time: '08:25 PM',
    draw_no: '4810',
    games: [
      { ticket_number: '22', game_name: 'CASHPOT', draw_time: '08:25 PM', bet_amount: 5.00, status: 'Lost', payout: 0 }
    ]
  },
]

export function MyTicketsPage() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<TicketOrder | null>(null)

  const filteredTickets = mockTickets.filter((t) => {
    const matchesStatus = filter === 'all' || t.status.toLowerCase() === filter.toLowerCase()
    const matchesSearch =
      t.order_no.includes(search) ||
      t.lottery_name.toLowerCase().includes(search.toLowerCase()) ||
      t.games.some((g) => g.ticket_number.includes(search))
    return matchesStatus && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'won':
        return (
          <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <CheckCircle className="size-3" /> Won
          </Badge>
        )
      case 'lost':
        return (
          <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <XCircle className="size-3" /> Lost
          </Badge>
        )
      case 'void':
        return (
          <Badge className="bg-gray-500/10 text-gray-400 border border-gray-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <AlertCircle className="size-3" /> Voided
          </Badge>
        )
      default:
        return (
          <Badge className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <Clock className="size-3" /> Pending
          </Badge>
        )
    }
  }

  const getOrderTotalBet = (ticket: TicketOrder) => {
    return ticket.games.reduce((sum, g) => sum + g.bet_amount, 0)
  }

  const getOrderTotalWon = (ticket: TicketOrder) => {
    return ticket.games.reduce((sum, g) => sum + (g.payout || 0), 0)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {/* Page Header */}
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
                className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
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

      {/* Table Container */}
      <Card className="bg-fortune-card border border-border/60 overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No tickets found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/15 border-b border-primary/20">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4">Order ID</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4">Created Date</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4">Lottery Game</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4">Draw No</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4">Draw Schedule</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4 text-right">Price</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4">Status</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow
                    key={ticket.order_no}
                    className="border-b border-border/20 hover:bg-muted/10 transition-colors"
                  >
                    <TableCell
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-4 font-bold text-sm text-primary cursor-pointer hover:underline"
                    >
                      #{ticket.order_no}
                    </TableCell>
                    <TableCell className="p-4 text-xs text-zinc-400">
                      {ticket.created_at}
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="font-bold text-sm text-zinc-100">{ticket.lottery_name}</div>
                      <div className="text-[10px] text-zinc-400">{ticket.lottery_type}</div>
                    </TableCell>
                    <TableCell className="p-4 text-xs font-semibold text-zinc-300">
                      {ticket.draw_no || '-'}
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
                        <Calendar className="size-3 text-primary/80" /> {ticket.draw_date}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                        <Clock className="size-3 text-zinc-500" /> {ticket.draw_time}
                      </div>
                    </TableCell>
                    <TableCell className="p-4 text-right font-bold text-zinc-200">
                      ${getOrderTotalBet(ticket).toFixed(2)}
                    </TableCell>
                    <TableCell className="p-4">
                      {getStatusBadge(ticket.status)}
                    </TableCell>
                    <TableCell className="p-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTicket(ticket)}
                        className="text-primary hover:text-primary hover:bg-primary/10 cursor-pointer flex items-center justify-center gap-1 font-bold h-8 px-3 rounded-lg"
                      >
                        <Eye className="size-3.5 pointer-events-none" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Ticket Details Modal */}
      <Dialog open={selectedTicket !== null} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="bg-fortune-card border border-primary/30 text-zinc-200 max-w-lg shadow-2xl p-0 overflow-hidden">
          {selectedTicket && (
            <div>
              {/* Modal Header */}
              <div className="relative p-6 border-b border-border/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-xl font-extrabold flex items-center gap-2 text-zinc-100">
                    Ticket Details <span className="text-primary font-black">#{selectedTicket.order_no}</span>
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400 text-xs mt-1">
                    Receipt ID: {selectedTicket.transaction_id || 'N/A'} • Created {selectedTicket.created_at}
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Meta details grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 bg-background/50 border border-border/10 p-3 rounded-xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1"><User className="size-3 text-primary/80" /> Customer Name</span>
                    <p className="font-semibold text-zinc-200">{selectedTicket.customer_name}</p>
                  </div>
                  {selectedTicket.customer_contact && (
                    <div className="space-y-1 bg-background/50 border border-border/10 p-3 rounded-xl">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1"><Phone className="size-3 text-primary/80" /> Contact</span>
                      <p className="font-semibold text-zinc-200">{selectedTicket.customer_contact}</p>
                    </div>
                  )}
                  <div className="space-y-1 bg-background/50 border border-border/10 p-3 rounded-xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1"><Calendar className="size-3 text-primary/80" /> Draw Date</span>
                    <p className="font-semibold text-zinc-200">{selectedTicket.draw_date}</p>
                  </div>
                  <div className="space-y-1 bg-background/50 border border-border/10 p-3 rounded-xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1"><Clock className="size-3 text-primary/80" /> Draw Time & No</span>
                    <p className="font-semibold text-zinc-200">{selectedTicket.draw_time} ({selectedTicket.draw_no ? `#${selectedTicket.draw_no}` : '-'})</p>
                  </div>
                </div>

                {/* Bets Table */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1">
                    <Receipt className="size-3.5 text-primary/80" /> Placed Bets ({selectedTicket.games.length})
                  </h3>
                  <div className="bg-background/40 border border-border/20 rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/10 border-b border-border/25">
                        <TableRow>
                          <TableHead className="font-bold text-[10px] uppercase text-primary/80 p-3">Lucky No</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase text-primary/80 p-3">Bet Type</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase text-primary/80 p-3 text-right">Amount</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase text-primary/80 p-3 text-right">Payout</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTicket.games.map((game, i) => (
                          <TableRow key={i} className="border-b border-border/10 last:border-0 hover:bg-muted/10">
                            <TableCell className="p-3">
                              <span className="font-black text-primary text-base">#{game.ticket_number}</span>
                            </TableCell>
                            <TableCell className="p-3 text-xs font-medium text-zinc-300">
                              {game.game_name}
                            </TableCell>
                            <TableCell className="p-3 text-right text-xs font-bold text-zinc-200">
                              ${game.bet_amount.toFixed(2)}
                            </TableCell>
                            <TableCell className="p-3 text-right text-xs font-extrabold">
                              {game.status === 'Won' ? (
                                <span className="text-green-400 font-bold">+${(game.payout || 0).toFixed(2)}</span>
                              ) : game.status === 'Lost' ? (
                                <span className="text-zinc-500">$0.00</span>
                              ) : (
                                <span className="text-primary font-bold">Pending</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Ticket Footer / Summary */}
                <div className="p-4 bg-muted/15 border border-border/15 rounded-xl flex items-center justify-between text-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Overall Ticket Status</span>
                    <div>{getStatusBadge(selectedTicket.status)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Total Bet / Won</span>
                    <div className="font-extrabold text-zinc-100">
                      ${getOrderTotalBet(selectedTicket).toFixed(2)} / <span className="text-green-400">${getOrderTotalWon(selectedTicket).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <DialogFooter className="p-4 border-t border-border/20 bg-background/50 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTicket(null)}
                  className="bg-background border-border text-zinc-300 hover:bg-muted font-bold h-9 cursor-pointer"
                >
                  Close Receipt
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
