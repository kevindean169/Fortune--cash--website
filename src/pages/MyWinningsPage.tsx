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
} from '@/components/ui/dialog'
import { Trophy, Eye, Calendar, Clock, User, Receipt, Search, Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { fetchCustomerWinnings, type ApiWinningOrder } from '@/lib/fortuneApi'
import { GameBallGraphic } from '@/components/GameLogos'
import { formatUsd } from '@/lib/currency'

const getLotteryLogo = (winning: ApiWinningOrder | null) => {
  if (!winning) return '/cashpot_logo.png?v=6';

  // Combine lottery name and all game names into one big string to check
  const searchStr = [
    winning.lottery_name,
    ...(winning.games?.map(g => g.game_name) || [])
  ].join(' ').toLowerCase();

  if (searchStr.includes('money time') || searchStr.includes('moneytime')) return '/moneytime_logo.png?v=6';
  if (searchStr.includes('pick 2 double') || searchStr.includes('pick-2-double') || searchStr.includes('pick2double')) return '/pick2_double.png?v=6';
  if (searchStr.includes('pick 2 single') || searchStr.includes('pick-2-single') || searchStr.includes('pick2single') || searchStr.includes('pick 2') || searchStr.includes('pick2')) return '/pick2_single.png?v=6';

  // Default fallback (Cashpot)
  return '/cashpot_logo.png?v=6';
}

export function MyWinningsPage() {
  const { accessToken } = useAuth()
  const [selectedWinning, setSelectedWinning] = useState<ApiWinningOrder | null>(null)
  const [apiData, setApiData] = useState<ApiWinningOrder[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const ITEMS_PER_PAGE = 10;
  const API_LIMIT = 500;


  const [search, setSearch] = useState('')
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

      fetchCustomerWinnings(accessToken, 1, API_LIMIT, options)
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
  const winnings = apiData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const totalWinnings = winnings.reduce((acc, item) => acc + item.total_won, 0)

  const getStatusBadge = (status: string) => {
    const normalized = status.toLowerCase()
    const paid = ['paid', 'complete', 'completed', 'settled', 'success'].includes(normalized)

    return (
      <Badge className={paid ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20 uppercase text-[10px] tracking-wider font-bold' : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20 uppercase text-[10px] tracking-wider font-bold'}>
        {status || 'pending'}
      </Badge>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
            My <span className="gold-text">Winnings</span>
            <Trophy className="size-6 text-primary animate-pulse" />
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Review your successful bet slips and total payouts</p>
        </div>
        <div className="bg-fortune-card border border-border/60 rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="text-muted-foreground text-xs uppercase font-medium">This Page Winnings:</span>
          <span className="text-primary font-extrabold text-lg">{formatUsd(totalWinnings)}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-6 bg-fortune-card border border-border/60 p-4 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <input
            type="text"
            placeholder="Search by Order ID or Name..."
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
              className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${timeFilter === 'all'
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
              className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${timeFilter === 'today'
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
          <div className="p-12 text-center text-muted-foreground">Loading winnings...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-400">{error}</div>
        ) : winnings.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No winnings found.</div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/15 border-b border-primary/20">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4">Order ID</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4">Win Date/Time</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4">Lottery Game</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4">Draw No</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4">Draw Schedule</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4 text-right">Bet Amount</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4 text-right">Prize Won</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4">Status</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4 text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {winnings.map((winning) => (
                    <TableRow
                      key={winning.order_no}
                      className="border-b border-border/20 hover:bg-muted/10 transition-colors"
                    >
                      <TableCell
                        onClick={() => setSelectedWinning(winning)}
                        className="p-4 font-bold text-sm text-primary cursor-pointer hover:underline"
                      >
                        #{winning.order_no}
                      </TableCell>
                      <TableCell className="p-4 text-xs text-zinc-400 font-medium">
                        {winning.created_at}
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="font-bold text-sm text-zinc-100">{winning.lottery_name}</div>
                        <div className="text-[10px] text-zinc-400">Lucky Pick: #{winning.bet_no}</div>
                      </TableCell>
                      <TableCell className="p-4 text-xs font-semibold text-zinc-300">
                        {winning.draw_no ? `#${winning.draw_no}` : '-'}
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
                          <Calendar className="size-3 text-primary/80" /> {winning.draw_date}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                          <Clock className="size-3 text-zinc-500" /> {winning.draw_time}
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-right text-xs text-zinc-400 font-medium">
                        {formatUsd(winning.total_bet)}
                      </TableCell>
                      <TableCell className="p-4 text-right font-black text-green-400 text-sm">
                        {formatUsd(winning.total_won)}
                      </TableCell>
                      <TableCell className="p-4">
                        {getStatusBadge(winning.status)}
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedWinning(winning)}
                          className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10 cursor-pointer flex items-center justify-center"
                        >
                          <Eye className="size-4 pointer-events-none" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="md:hidden flex flex-col divide-y divide-border/20">
              {winnings.map((winning) => (
                <div key={winning.order_no} className="p-4 space-y-3 hover:bg-muted/5 active:bg-muted/10 transition-colors cursor-pointer" onClick={() => setSelectedWinning(winning)}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-bold text-sm text-primary">#{winning.order_no}</span>
                      <div className="font-bold text-zinc-100 mt-1">{winning.lottery_name}</div>
                      <div className="text-[10px] text-zinc-400">Lucky Pick: #{winning.bet_no}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(winning.status)}
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-zinc-400">Won</span>
                        <span className="font-black text-green-400 text-sm">{formatUsd(winning.total_won)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 bg-background/50 p-2 rounded-lg border border-border/10">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3 text-primary/80" /> {winning.draw_date}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-zinc-500" /> {winning.draw_time}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500 pt-1">
                    <span>Bet: {formatUsd(winning.total_bet)}</span>
                    <span>Win Date: {winning.created_at}</span>
                  </div>
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

      <Dialog open={selectedWinning !== null} onOpenChange={(open) => !open && setSelectedWinning(null)}>
        <DialogContent className="bg-transparent border-none shadow-none max-w-md p-0 overflow-visible flex flex-col pt-12">
          {selectedWinning && (
            <div className="relative w-full">
              {/* Floating Logo */}
              <div className="absolute -top-12 -left-6 z-20 w-32 h-32 drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] pointer-events-none">
                <img
                  src={getLotteryLogo(selectedWinning)}
                  alt={selectedWinning.lottery_name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Top Match & Win Banner */}
              <div className="flex justify-end pr-4 sm:pr-8 -mb-0.5 relative z-10">
                <div className="bg-gradient-to-b from-[#FFE57F] via-[#FFD700] to-[#FF9800] px-8 py-2 rounded-t-xl border-2 border-b-0 border-[#D4AF37] shadow-[0_-4px_10px_rgba(0,0,0,0.3)]">
                  <span className="font-black text-black tracking-widest text-sm sm:text-base drop-shadow-sm uppercase">Match & Win</span>
                </div>
              </div>

              <div className="rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border-[3px] border-[#D4AF37] bg-black relative z-10 flex flex-col max-h-[80vh]">
                
                {/* Embedded Details Section */}
                <div className="p-4 pt-5 pb-3 bg-gradient-to-b from-[#1a1a1a] to-black text-white shrink-0 rounded-t-lg">
                  <div className="flex justify-between items-start mb-3 border-b border-white/10 pb-3">
                    <div>
                      <h2 className="font-black text-lg text-[#FFD700] flex items-center gap-1.5"><Receipt className="size-4" /> Winning Receipt</h2>
                      <p className="text-xs text-white font-bold mt-0.5">#{selectedWinning.order_no}</p>
                    </div>
                    {selectedWinning.status.toLowerCase() === 'paid' && (
                      <div className="bg-[#0F4C23] text-[#FFD700] text-[10px] px-2 py-1 rounded font-black uppercase tracking-widest border border-[#D4AF37]/50 shadow-inner shadow-black">
                        Paid out
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <div>
                      <span className="text-[9px] text-[#FFD700]/70 font-black uppercase tracking-widest flex items-center gap-1"><User className="size-3" /> Winner</span>
                      <p className="font-bold mt-0.5">{selectedWinning.customer_name}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#FFD700]/70 font-black uppercase tracking-widest flex items-center gap-1"><Calendar className="size-3" /> Draw Details</span>
                      <p className="font-bold mt-0.5">{selectedWinning.draw_date} @ {selectedWinning.draw_time}</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-y-auto">
                  {/* Header */}
                  <div className="flex items-center bg-gradient-to-b from-[#0F4C23] to-[#0A2F12] border-t-2 border-b-2 border-[#D4AF37]">
                    <div className="flex-1 px-3 py-2 font-black text-white text-[11px] tracking-widest uppercase">
                      Win Type
                    </div>
                    <div className="w-[110px] px-3 py-2 font-black text-white text-[11px] tracking-widest uppercase text-right border-l-2 border-[#D4AF37]">
                      Your Winnings
                    </div>
                  </div>

                  {/* Rows */}
                  <div className="flex flex-col">
                    {selectedWinning.games.map((game, i) => {
                      const isGold = i % 2 === 0;
                      return (
                        <div key={`${game.bet}-${i}`} className="flex items-stretch border-b border-[#D4AF37]/40 last:border-0">
                          {/* Left Section (Alternating Gold/White) */}
                          <div className={`flex-1 flex items-center justify-between p-2.5 ${isGold ? 'bg-gradient-to-r from-[#FFE57F] via-[#FFD700] to-[#FFC107] text-black' : 'bg-[#F8F9FA] text-black'}`}>
                            <div className="flex items-center gap-2.5">
                              <div className="flex flex-col gap-1 items-center justify-center drop-shadow-md">
                                <GameBallGraphic gameName={game.game_name} value={game.bet} />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-black text-[13px] uppercase leading-none drop-shadow-sm">{game.game_name}:</span>
                                <span className={`font-black text-[11px] uppercase mt-0.5 ${isGold ? 'text-[#0A2F12]' : 'text-[#0F4C23]'}`}>
                                  BET {formatUsd(game.bet_amount)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {game.win_amount > 0 ? (
                                <div className="flex items-center justify-center size-5 rounded-full bg-[#1A6C2B] text-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.2)]">
                                  <Check className="size-3.5 font-bold stroke-[3]" />
                                </div>
                              ) : (
                                <div className="size-5" />
                              )}
                              <div className={`h-6 w-[1.5px] mx-1 ${isGold ? 'bg-black/20' : 'bg-black/10'}`} />
                              <span className="font-black text-lg tracking-tighter">
                                {formatUsd(game.win_amount)}
                              </span>
                            </div>
                          </div>

                          {/* Right Section (Dark Green) */}
                          <div className="w-[110px] flex items-center justify-end p-2.5 bg-gradient-to-b from-[#0A2F12] to-[#051809] border-l border-[#D4AF37]/40">
                            <span className="font-black text-xl text-[#FFD700] drop-shadow-[0_2px_3px_rgba(0,0,0,1)]">
                              {formatUsd(game.win_amount)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center bg-gradient-to-b from-[#151515] to-[#0A0A0A] border-t-2 border-[#D4AF37] rounded-b-lg shrink-0">
                  <div className="flex-1 px-3 py-2.5 font-black text-[#FFD700] text-[10px] tracking-widest uppercase text-right">
                    Total Payout
                  </div>
                  <div className="w-[110px] px-3 py-2.5 font-black text-[#FFD700] text-xl tracking-tighter text-right border-l-2 border-[#D4AF37] drop-shadow-[0_2px_3px_rgba(0,0,0,1)] bg-gradient-to-b from-[#0A2F12] to-[#051809]">
                    {formatUsd(selectedWinning.total_won)}
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
