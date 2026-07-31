import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
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
} from '@/components/ui/dialog'
import { Eye, Search, Calendar, Clock, Receipt, User, Phone, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { fetchTickets, type ApiTicketOrder } from '@/lib/fortuneApi'
import { GameBallGraphic } from '@/components/GameLogos'
import { formatUsd } from '@/lib/currency'

export function MyTicketsPage() {
  const { accessToken, walletBalance } = useAuth()
  const [search, setSearch] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<ApiTicketOrder | null>(null)
  const [apiData, setApiData] = useState<ApiTicketOrder[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const ITEMS_PER_PAGE = 10;
  const API_LIMIT = 500; // Fetch all items to bypass backend ignoring page param

  // Filter States
  const [timeFilter, setTimeFilter] = useState('all') // 'all', 'today', 'specific'
  const [selectedDate, setSelectedDate] = useState('')

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [search, timeFilter, selectedDate])

  useEffect(() => {
    if (!accessToken) {
      setLoading(false)
      return
    }

    let cancelled = false
    setError(null)
    setLoading(true)

    const delayDebounce = setTimeout(() => {
      const options: any = {}
      if (search.trim() !== '') {
        options.search = search.trim()
      }
      if (timeFilter === 'today') {
        options.filter = 'today'
      } else if (timeFilter === 'specific' && selectedDate) {
        options.startdate = selectedDate
        options.enddate = selectedDate
      }

      fetchTickets(accessToken, 1, API_LIMIT, options)
        .then((result) => {
          if (cancelled) return
          setApiData(result.items)
          setLastPage(Math.max(Math.ceil(result.items.length / ITEMS_PER_PAGE), 1))
        })
        .catch((err: Error) => {
          if (cancelled) return
          setApiData([])
          setLastPage(1)
          setError(err.message)
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false)
            window.scrollTo(0, 0)
          }
        })
    }, search ? 300 : 0)

    return () => {
      cancelled = true
      clearTimeout(delayDebounce)
    }
  }, [accessToken, search, timeFilter, selectedDate])

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const tickets = apiData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">
            My <span className="gold-text">Tickets</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">View, search, and verify all your bet slip transactions</p>
        </div>
        <div className="bg-fortune-card border border-border/60 rounded-xl px-5 py-2.5 flex items-center gap-3 shrink-0 justify-center">
          <span className="text-muted-foreground text-xs uppercase font-medium">Betting Wallet:</span>
          <span className="text-green-400 font-extrabold text-lg">
            {formatUsd(walletBalance)}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-6 bg-fortune-card border border-border/60 p-4 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <input
            type="text"
            placeholder="Search by Order ID or Number..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Quick Filters */}
          <div className="flex bg-background border border-border rounded-xl p-1">
            <button
              onClick={() => {
                setTimeFilter('all')
                setSelectedDate('')
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                timeFilter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => {
                setTimeFilter('today')
                setSelectedDate('')
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                timeFilter === 'today'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Today
            </button>
          </div>

          {/* Specific Date Picker */}
          <div className="relative flex items-center bg-background border border-border rounded-xl px-3 py-1">
            <Calendar className="text-muted-foreground size-4 mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                if (e.target.value) {
                  setTimeFilter('specific')
                } else {
                  setTimeFilter('all')
                }
              }}
              className="bg-transparent border-0 text-xs text-foreground focus:outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      <Card className="bg-fortune-card border border-border/60 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading tickets...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-400">{error}</div>
        ) : tickets.length === 0 ? (
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
                  {tickets.map((ticket) => (
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
                      <TableCell className="p-4 text-right font-bold text-zinc-200">{formatUsd(getOrderTotalBet(ticket))}</TableCell>
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
              {tickets.map((ticket) => (
                <div key={ticket.order_no} className="p-4 space-y-3 hover:bg-muted/5 active:bg-muted/10 transition-colors cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-bold text-sm text-primary">#{ticket.order_no}</span>
                      <div className="font-bold text-zinc-100 mt-1">{ticket.lottery_name}</div>
                      <div className="text-[10px] text-zinc-400">{ticket.lottery_type}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(ticket.status)}
                      <span className="font-bold text-zinc-200">{formatUsd(getOrderTotalBet(ticket))}</span>
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
        <DialogContent className="bg-fortune-card border border-primary/30 text-zinc-200 max-w-md shadow-2xl p-0 overflow-hidden">
          {selectedTicket && (
            <div>
              <div className="relative p-3 border-b border-border/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-base font-extrabold flex items-center gap-2 text-zinc-100">
                    Ticket Details <span className="text-primary font-black">#{selectedTicket.order_no}</span>
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400 text-[10px] mt-0.5">
                    Receipt ID: {selectedTicket.transaction_id || 'N/A'} - Created {selectedTicket.created_at}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-3.5 space-y-3.5">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="space-y-0.5 bg-background/50 border border-border/10 p-2 rounded-xl">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1"><User className="size-3 text-primary/80" /> Customer Name</span>
                    <p className="font-semibold text-zinc-200">{selectedTicket.customer_name}</p>
                  </div>
                  {selectedTicket.customer_contact && (
                    <div className="space-y-0.5 bg-background/50 border border-border/10 p-2 rounded-xl">
                      <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1"><Phone className="size-3 text-primary/80" /> Contact</span>
                      <p className="font-semibold text-zinc-200">{selectedTicket.customer_contact}</p>
                    </div>
                  )}
                  <div className="space-y-0.5 bg-background/50 border border-border/10 p-2 rounded-xl">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1"><Calendar className="size-3 text-primary/80" /> Draw Date</span>
                    <p className="font-semibold text-zinc-200">{selectedTicket.draw_date}</p>
                  </div>
                  <div className="space-y-0.5 bg-background/50 border border-border/10 p-2 rounded-xl">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1"><Clock className="size-3 text-primary/80" /> Draw Time & No</span>
                    <p className="font-semibold text-zinc-200">{selectedTicket.draw_time} ({selectedTicket.draw_no ? `#${selectedTicket.draw_no}` : '-'})</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1">
                    <Receipt className="size-3.5 text-primary/80" /> Placed Bets ({selectedTicket.games.length})
                  </h3>
                  <div className="bg-background/40 border border-border/20 rounded-xl overflow-hidden max-h-[160px] overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-muted/10 border-b border-border/25">
                        <TableRow>
                          <TableHead className="font-bold text-[9px] uppercase text-primary/80 p-2 w-1/3">Bet</TableHead>
                          <TableHead className="font-bold text-[9px] uppercase text-primary/80 p-2 w-1/3">Game</TableHead>
                          <TableHead className="font-bold text-[9px] uppercase text-primary/80 p-2 w-1/3 text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTicket.games.map((game, index) => (
                          <TableRow key={`${game.ticket_number}-${index}`} className="border-b border-border/10 last:border-0 hover:bg-muted/10">
                            <TableCell className="p-2">
                              <GameBallGraphic gameName={game.game_name} value={game.ticket_number} />
                            </TableCell>
                            <TableCell className="p-2 text-xs font-medium text-zinc-300">{game.game_name}</TableCell>
                            <TableCell className="p-2 text-right text-xs font-bold text-zinc-200">{formatUsd(game.bet_amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="p-3 bg-muted/15 border border-border/15 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold">Overall Ticket Status</span>
                    <div>{getStatusBadge(selectedTicket.status)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold">Total Bet</span>
                    <div className="font-extrabold text-zinc-100">
                      {formatUsd(getOrderTotalBet(selectedTicket))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
