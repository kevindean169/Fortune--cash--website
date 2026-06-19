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
  TableFooter,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Trophy, Eye, Calendar, Clock, User, Phone, Receipt, Landmark } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { fetchCustomerWinnings, type ApiWinningOrder } from '@/lib/fortuneApi'
import { GameBallGraphic } from '@/components/GameLogos'
import { formatUsd } from '@/lib/currency'

export function MyWinningsPage() {
  const { accessToken } = useAuth()
  const [selectedWinning, setSelectedWinning] = useState<ApiWinningOrder | null>(null)
  const [winnings, setWinnings] = useState<ApiWinningOrder[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) return

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchCustomerWinnings(accessToken, page, 10)
      .then((result) => {
        if (cancelled) return
        setWinnings(result.items)
        setLastPage(Math.max(result.lastPage || 1, 1))
      })
      .catch((err: Error) => {
        if (cancelled) return
        setWinnings([])
        setLastPage(1)
        setError(err.message)
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
          window.scrollTo(0, 0)
        }
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, page])

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
        <DialogContent className="bg-fortune-card border border-primary/30 text-zinc-200 max-w-md shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
          {selectedWinning && (
            <div className="flex flex-col max-h-[90vh] overflow-hidden">
              <div className="relative p-3 border-b border-border/20 bg-gradient-to-r from-green-500/10 via-transparent to-transparent shrink-0">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-base font-extrabold flex items-center gap-2 text-zinc-100">
                    Winning Receipt <span className="text-primary font-black">#{selectedWinning.order_no}</span>
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400 text-[10px] mt-0.5">
                    Card ID: {selectedWinning.card_id || 'N/A'} • Calculated {selectedWinning.created_at}
                  </DialogDescription>
                </DialogHeader>
                <div className="absolute right-12 top-3 bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest">
                  WON
                </div>
              </div>

              <div className="p-3.5 space-y-3.5 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="space-y-0.5 bg-background/50 border border-border/10 p-2 rounded-xl">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1"><User className="size-3 text-primary/80" /> Winner Name</span>
                    <p className="font-semibold text-zinc-200">{selectedWinning.customer_name}</p>
                  </div>
                  {selectedWinning.customer_contact && (
                    <div className="space-y-0.5 bg-background/50 border border-border/10 p-2 rounded-xl">
                      <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1"><Phone className="size-3 text-primary/80" /> Winner Contact</span>
                      <p className="font-semibold text-zinc-200">{selectedWinning.customer_contact}</p>
                    </div>
                  )}
                  <div className="space-y-0.5 bg-background/50 border border-border/10 p-2 rounded-xl">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1"><Calendar className="size-3 text-primary/80" /> Draw Date</span>
                    <p className="font-semibold text-zinc-200">{selectedWinning.draw_date}</p>
                  </div>
                  <div className="space-y-0.5 bg-background/50 border border-border/10 p-2 rounded-xl">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1"><Clock className="size-3 text-primary/80" /> Draw Time & No</span>
                    <p className="font-semibold text-zinc-200">{selectedWinning.draw_time} ({selectedWinning.draw_no ? `#${selectedWinning.draw_no}` : '-'})</p>
                  </div>
                </div>

                {selectedWinning.status.toLowerCase() === 'paid' && (
                  <div className="p-2.5 bg-green-500/5 border border-green-500/10 rounded-xl flex flex-col gap-0.5 text-[11px]">
                    <div className="flex justify-between items-center text-green-400 font-bold">
                      <span className="flex items-center gap-1"><Landmark className="size-3.5" /> Payout Settled Successfully</span>
                      <span>Paid by {selectedWinning.paid_by || 'Agent'}</span>
                    </div>
                    {selectedWinning.paid_at && selectedWinning.paid_at !== '-' && (
                      <div className="text-[9px] text-zinc-400">
                        Settled at: {selectedWinning.paid_at}
                      </div>
                    )}
                    {selectedWinning.agent_name && (
                      <div className="text-[9px] text-zinc-400">
                        Agent: {selectedWinning.agent_name}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1">
                    <Receipt className="size-3.5 text-primary/80" /> Winning Bets
                  </h3>
                  <div className="bg-background/40 border border-border/20 rounded-xl overflow-hidden max-h-[160px] overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-muted/10 border-b border-border/25">
                        <TableRow>
                          <TableHead className="font-bold text-[9px] uppercase text-primary/80 p-2 w-1/4">Bet</TableHead>
                          <TableHead className="font-bold text-[9px] uppercase text-primary/80 p-2 w-1/4">Winning Result</TableHead>
                          <TableHead className="font-bold text-[9px] uppercase text-primary/80 p-2 w-1/4 text-right">Bet Amt</TableHead>
                          <TableHead className="font-bold text-[9px] uppercase text-primary/80 p-2 w-1/4 text-right">Prize Won</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedWinning.games.map((game, i) => (
                          <TableRow key={`${game.bet}-${i}`} className="border-b border-border/10 last:border-0 hover:bg-muted/10">
                            <TableCell className="p-2">
                              <div className="flex flex-col gap-0.5">
                                <GameBallGraphic gameName={game.game_name} value={game.bet} />
                                <span className="text-[9px] text-zinc-400 block font-medium">{game.game_name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="p-2">
                              <GameBallGraphic gameName={game.game_name} value={game.result} isResult={true} />
                            </TableCell>
                            <TableCell className="p-2 text-right text-xs font-semibold text-zinc-300">
                              {formatUsd(game.bet_amount)}
                            </TableCell>
                            <TableCell className="p-2 text-right text-xs font-black text-green-400">
                              +{formatUsd(game.win_amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter className="bg-muted/15">
                        <TableRow className="border-t border-border/25">
                          <TableCell colSpan={2} className="p-2">
                            <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Total Net Winnings</span>
                          </TableCell>
                          <TableCell className="p-2 text-right">
                            <span className="text-xs font-bold text-zinc-200">
                              {formatUsd(selectedWinning.total_bet)}
                            </span>
                          </TableCell>
                          <TableCell className="p-2 text-right">
                            <span className="font-black text-sm text-green-400">
                              {formatUsd(selectedWinning.total_won)}
                            </span>
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
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
