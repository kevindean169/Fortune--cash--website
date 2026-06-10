import { useEffect, useMemo, useState } from 'react'
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
import { Eye, Search, Calendar, Clock, Receipt, User, Phone, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { fetchTickets, type ApiTicketOrder } from '@/lib/fortuneApi'

export function MyTicketsPage() {
  const { accessToken, walletBalance } = useAuth()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<ApiTicketOrder | null>(null)
  const [tickets, setTickets] = useState<ApiTicketOrder[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) return

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchTickets(accessToken, page, 10)
      .then((result) => {
        if (cancelled) return
        setTickets(result.items)
        setLastPage(Math.max(result.lastPage || 1, 1))
      })
      .catch((err: Error) => {
        if (cancelled) return
        setTickets([])
        setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, page])

  const filteredTickets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return tickets.filter((ticket) => {
      const matchesStatus = filter === 'all' || ticket.status.toLowerCase() === filter.toLowerCase()
      const matchesSearch =
        normalizedSearch === '' ||
        ticket.order_no.toLowerCase().includes(normalizedSearch) ||
        ticket.lottery_name.toLowerCase().includes(normalizedSearch) ||
        ticket.games.some((game) => game.ticket_number.toLowerCase().includes(normalizedSearch))

      return matchesStatus && matchesSearch
    })
  }, [filter, search, tickets])

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'purchase':
      case 'purchased':
      case 'unvoid':
      case '0':
        return (
          <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <CheckCircle className="size-3" /> Purchase
          </Badge>
        )
      case 'void':
      case '1':
        return (
          <Badge className="bg-gray-500/10 text-gray-400 border border-gray-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <AlertCircle className="size-3" /> Voided
          </Badge>
        )
      default:
        return (
          <Badge className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <Clock className="size-3" /> {status || 'Purchase'}
          </Badge>
        )
    }
  }

  const getOrderTotalBet = (ticket: ApiTicketOrder) => ticket.games.reduce((sum, game) => sum + game.bet_amount, 0)
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">
            My <span className="gold-text">Tickets</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">View, search, and verify all your bet slip transactions</p>
        </div>
        <div className="bg-fortune-card border border-border/60 rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="text-muted-foreground text-xs uppercase font-medium">Betting Wallet:</span>
          <span className="text-green-400 font-extrabold text-lg">
            ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <Card className="bg-fortune-card border border-border/60 mb-6">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide">
            {[
              { id: 'all', label: 'All' },
              { id: 'purchase', label: 'Purchase' },
              { id: 'void', label: 'Void' },
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => setFilter(status.id)}
                className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                  filter === status.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-background border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <input
              type="text"
              placeholder="Search by Order ID or Number..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-fortune-card border border-border/60 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading tickets...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-400">{error}</div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No tickets found matching criteria.</div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
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
                    <TableRow key={ticket.order_no} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                      <TableCell onClick={() => setSelectedTicket(ticket)} className="p-4 font-bold text-sm text-primary cursor-pointer hover:underline">
                        #{ticket.order_no}
                      </TableCell>
                      <TableCell className="p-4 text-xs text-zinc-400">{ticket.created_at}</TableCell>
                      <TableCell className="p-4">
                        <div className="font-bold text-sm text-zinc-100">{ticket.lottery_name}</div>
                        <div className="text-[10px] text-zinc-400">{ticket.lottery_type}</div>
                      </TableCell>
                      <TableCell className="p-4 text-xs font-semibold text-zinc-300">{ticket.draw_no || '-'}</TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
                          <Calendar className="size-3 text-primary/80" /> {ticket.draw_date}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                          <Clock className="size-3 text-zinc-500" /> {ticket.draw_time}
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-right font-bold text-zinc-200">${getOrderTotalBet(ticket).toFixed(2)}</TableCell>
                      <TableCell className="p-4">{getStatusBadge(ticket.status)}</TableCell>
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

            <div className="md:hidden flex flex-col divide-y divide-border/20">
              {filteredTickets.map((ticket) => (
                <div key={ticket.order_no} className="p-4 space-y-3 hover:bg-muted/5 active:bg-muted/10 transition-colors cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-bold text-sm text-primary">#{ticket.order_no}</span>
                      <div className="font-bold text-zinc-100 mt-1">{ticket.lottery_name}</div>
                      <div className="text-[10px] text-zinc-400">{ticket.lottery_type}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(ticket.status)}
                      <span className="font-bold text-zinc-200">${getOrderTotalBet(ticket).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 bg-background/50 p-2 rounded-lg border border-border/10">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3 text-primary/80" /> {ticket.draw_date}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-zinc-500" /> {ticket.draw_time}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 pt-1">Created: {ticket.created_at}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
          Previous
        </Button>
        <div className="h-9 px-4 rounded-md border border-border bg-background flex items-center text-sm font-bold">
          {page} / {lastPage}
        </div>
        <Button variant="outline" size="sm" disabled={page >= lastPage || loading} onClick={() => setPage((current) => current + 1)}>
          Next
        </Button>
      </div>

      <Dialog open={selectedTicket !== null} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="bg-fortune-card border border-primary/30 text-zinc-200 max-w-lg shadow-2xl p-0 overflow-hidden">
          {selectedTicket && (
            <div>
              <div className="relative p-6 border-b border-border/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-xl font-extrabold flex items-center gap-2 text-zinc-100">
                    Ticket Details <span className="text-primary font-black">#{selectedTicket.order_no}</span>
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400 text-xs mt-1">
                    Receipt ID: {selectedTicket.transaction_id || 'N/A'} - Created {selectedTicket.created_at}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-6">
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

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1">
                    <Receipt className="size-3.5 text-primary/80" /> Placed Bets ({selectedTicket.games.length})
                  </h3>
                  <div className="bg-background/40 border border-border/20 rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/10 border-b border-border/25">
                        <TableRow>
                          <TableHead className="font-bold text-[10px] uppercase text-primary/80 p-3">Bet</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase text-primary/80 p-3">Game</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase text-primary/80 p-3 text-right">Amount</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase text-primary/80 p-3 text-right">Payout</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTicket.games.map((game, index) => (
                          <TableRow key={`${game.ticket_number}-${index}`} className="border-b border-border/10 last:border-0 hover:bg-muted/10">
                            <TableCell className="p-3">
                              <span className="font-black text-primary text-base">{game.ticket_number}</span>
                            </TableCell>
                            <TableCell className="p-3 text-xs font-medium text-zinc-300">{game.game_name}</TableCell>
                            <TableCell className="p-3 text-right text-xs font-bold text-zinc-200">${game.bet_amount.toFixed(2)}</TableCell>
                            <TableCell className="p-3 text-right text-xs font-extrabold">
                              {game.status?.toLowerCase() === 'won' ? (
                                <span className="text-green-400 font-bold">+${(game.payout || 0).toFixed(2)}</span>
                              ) : game.status?.toLowerCase() === 'lost' ? (
                                <span className="text-zinc-500">$0.00</span>
                              ) : (
                                <span className="text-primary font-bold">{game.status || 'Pending'}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="p-4 bg-muted/15 border border-border/15 rounded-xl flex items-center justify-between text-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Overall Ticket Status</span>
                    <div>{getStatusBadge(selectedTicket.status)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Total Bet</span>
                    <div className="font-extrabold text-zinc-100">
                      ${getOrderTotalBet(selectedTicket).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="p-4 border-t border-border/20 bg-background/50 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedTicket(null)} className="bg-background border-border text-zinc-300 hover:bg-muted font-bold h-9 cursor-pointer">
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
