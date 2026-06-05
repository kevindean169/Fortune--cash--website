import { useState } from 'react'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { Trophy, Eye, Calendar, Clock, DollarSign, User, Phone, Receipt, Landmark } from 'lucide-react'

interface WinningGame {
  game_name: string
  bet: string
  result: string
  bet_amount: number
  win_amount: number
}

interface WinningOrder {
  lottery_id: number
  order_no: string
  card_id: string
  status: 'paid' | 'unpaid'
  paid_by?: string
  agent_name?: string
  lottery_name: string
  customer_name: string
  customer_contact?: string
  slot: string
  created_at: string
  paid_at?: string
  draw_no: string
  total_bet: number
  total_won: number
  draw_date: string
  draw_slot_time: string
  bet_no: string
  games: WinningGame[]
}

const mockWinnings: WinningOrder[] = [
  {
    lottery_id: 1,
    order_no: '10113',
    card_id: 'C-991',
    status: 'paid',
    paid_by: 'Agent',
    agent_name: 'Jane Smith',
    lottery_name: 'Jamaica Cashpot',
    customer_name: 'John Doe',
    customer_contact: '+1 876-555-0192',
    slot: '1780182400',
    created_at: '30 May 2026, 06:15 PM',
    paid_at: '30 May 2026, 06:20 PM',
    draw_no: '4822',
    total_bet: 1.00,
    total_won: 26.00,
    draw_date: 'May 30, 2026',
    draw_slot_time: '06:00 PM',
    bet_no: '02',
    games: [
      { game_name: 'CASHPOT', bet: '02', result: '02', bet_amount: 1.00, win_amount: 26.00 }
    ]
  },
  {
    lottery_id: 1,
    order_no: '10112',
    card_id: 'C-990',
    status: 'paid',
    paid_by: 'Agent',
    agent_name: 'Jane Smith',
    lottery_name: 'Jamaica Cashpot',
    customer_name: 'John Doe',
    customer_contact: '+1 876-555-0192',
    slot: '1780182400',
    created_at: '30 May 2026, 06:15 PM',
    paid_at: '30 May 2026, 06:20 PM',
    draw_no: '4822',
    total_bet: 2.00,
    total_won: 72.00,
    draw_date: 'May 30, 2026',
    draw_slot_time: '06:00 PM',
    bet_no: '14',
    games: [
      { game_name: 'CASHPOT', bet: '14', result: '14', bet_amount: 2.00, win_amount: 72.00 }
    ]
  },
  {
    lottery_id: 2,
    order_no: '10111',
    card_id: 'C-989',
    status: 'paid',
    paid_by: 'Agent',
    agent_name: 'Jane Smith',
    lottery_name: 'Money Time',
    customer_name: 'John Doe',
    customer_contact: '+1 876-555-0192',
    slot: '1780175200',
    created_at: '30 May 2026, 04:15 PM',
    paid_at: '30 May 2026, 04:22 PM',
    draw_no: '1092',
    total_bet: 5.00,
    total_won: 130.00,
    draw_date: 'May 30, 2026',
    draw_slot_time: '04:00 PM',
    bet_no: '28',
    games: [
      { game_name: 'Money Time', bet: '28', result: '28', bet_amount: 5.00, win_amount: 130.00 }
    ]
  }
]

export function MyWinningsPage() {
  const [selectedWinning, setSelectedWinning] = useState<WinningOrder | null>(null)
  const totalWinnings = mockWinnings.reduce((acc, t) => acc + t.total_won, 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
            My <span className="gold-text">Winnings</span>
            <Trophy className="size-6 text-primary animate-pulse" />
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Review your successful bet slips and total payouts</p>
        </div>
        <div className="bg-fortune-card border border-border/60 rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="text-muted-foreground text-xs uppercase font-medium">Total Lifetime Winnings:</span>
          <span className="text-primary font-extrabold text-lg">${totalWinnings.toFixed(2)}</span>
        </div>
      </div>

      {/* Table Container */}
      <Card className="bg-fortune-card border border-border/60 overflow-hidden">
        {mockWinnings.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No winnings found.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
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
                {mockWinnings.map((winning) => (
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
                        <Clock className="size-3 text-zinc-500" /> {winning.draw_slot_time}
                      </div>
                    </TableCell>
                    <TableCell className="p-4 text-right text-xs text-zinc-400 font-medium">
                      ${winning.total_bet.toFixed(2)}
                    </TableCell>
                    <TableCell className="p-4 text-right font-black text-green-400 text-sm">
                      ${winning.total_won.toFixed(2)}
                    </TableCell>
                    <TableCell className="p-4">
                      <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20 uppercase text-[10px] tracking-wider font-bold">
                        {winning.status}
                      </Badge>
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

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col divide-y divide-border/20">
              {mockWinnings.map((winning) => (
                <div key={winning.order_no} className="p-4 space-y-3 hover:bg-muted/5 active:bg-muted/10 transition-colors cursor-pointer" onClick={() => setSelectedWinning(winning)}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-bold text-sm text-primary">#{winning.order_no}</span>
                      <div className="font-bold text-zinc-100 mt-1">{winning.lottery_name}</div>
                      <div className="text-[10px] text-zinc-400">Lucky Pick: #{winning.bet_no}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20 uppercase text-[10px] tracking-wider font-bold">
                        {winning.status}
                      </Badge>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-zinc-400">Won</span>
                        <span className="font-black text-green-400 text-sm">${winning.total_won.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 bg-background/50 p-2 rounded-lg border border-border/10">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3 text-primary/80" /> {winning.draw_date}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-zinc-500" /> {winning.draw_slot_time}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500 pt-1">
                    <span>Bet: ${winning.total_bet.toFixed(2)}</span>
                    <span>Win Date: {winning.created_at}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Winning Details Modal */}
      <Dialog open={selectedWinning !== null} onOpenChange={(open) => !open && setSelectedWinning(null)}>
        <DialogContent className="bg-fortune-card border border-primary/30 text-zinc-200 max-w-lg shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
          {selectedWinning && (
            <div className="flex flex-col max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="relative p-6 border-b border-border/20 bg-gradient-to-r from-green-500/10 via-transparent to-transparent shrink-0">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-xl font-extrabold flex items-center gap-2 text-zinc-100">
                    Winning Receipt <span className="text-primary font-black">#{selectedWinning.order_no}</span>
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400 text-xs mt-1">
                    Card ID: {selectedWinning.card_id} • Calculated {selectedWinning.created_at}
                  </DialogDescription>
                </DialogHeader>
                <div className="absolute right-12 top-6 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest">
                  WON
                </div>
              </div>
 
              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Meta details grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 bg-background/50 border border-border/10 p-3 rounded-xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1"><User className="size-3 text-primary/80" /> Winner Name</span>
                    <p className="font-semibold text-zinc-200">{selectedWinning.customer_name}</p>
                  </div>
                  {selectedWinning.customer_contact && (
                    <div className="space-y-1 bg-background/50 border border-border/10 p-3 rounded-xl">
                       <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1"><Phone className="size-3 text-primary/80" /> Winner Contact</span>
                      <p className="font-semibold text-zinc-200">{selectedWinning.customer_contact}</p>
                    </div>
                  )}
                  <div className="space-y-1 bg-background/50 border border-border/10 p-3 rounded-xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1"><Calendar className="size-3 text-primary/80" /> Draw Date</span>
                    <p className="font-semibold text-zinc-200">{selectedWinning.draw_date}</p>
                  </div>
                  <div className="space-y-1 bg-background/50 border border-border/10 p-3 rounded-xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1"><Clock className="size-3 text-primary/80" /> Draw Time & No</span>
                    <p className="font-semibold text-zinc-200">{selectedWinning.draw_slot_time} (#{selectedWinning.draw_no})</p>
                  </div>
                </div>
 
                {/* Paid Details Banner */}
                {selectedWinning.status === 'paid' && (
                  <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-xl flex flex-col gap-1 text-xs">
                    <div className="flex justify-between items-center text-green-400 font-bold">
                      <span className="flex items-center gap-1"><Landmark className="size-3.5" /> Payout Settled Successfully</span>
                      <span>Paid by {selectedWinning.paid_by || 'Agent'}</span>
                    </div>
                    {selectedWinning.paid_at && (
                      <div className="text-[10px] text-zinc-400">
                        Settled at: {selectedWinning.paid_at}
                      </div>
                    )}
                    {selectedWinning.agent_name && (
                      <div className="text-[10px] text-zinc-400">
                        Agent: {selectedWinning.agent_name}
                      </div>
                    )}
                  </div>
                )}
 
                {/* Winnings Breakdown Table */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1">
                    <Receipt className="size-3.5 text-primary/80" /> Winning Bets
                  </h3>
                  <div className="bg-background/40 border border-border/20 rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/10 border-b border-border/25">
                        <TableRow>
                          <TableHead className="font-bold text-[10px] uppercase text-primary/80 p-3">Lucky Bet</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase text-primary/80 p-3">Winning Result</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase text-primary/80 p-3 text-right">Bet Amt</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase text-primary/80 p-3 text-right">Prize Won</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedWinning.games.map((game, i) => (
                          <TableRow key={i} className="border-b border-border/10 last:border-0 hover:bg-muted/10">
                            <TableCell className="p-3">
                              <span className="font-black text-primary text-base">#{game.bet}</span>
                              <span className="text-[10px] text-zinc-400 block font-medium mt-0.5">{game.game_name}</span>
                            </TableCell>
                            <TableCell className="p-3">
                              <span className="bg-green-500/10 text-green-400 font-extrabold text-xs px-2 py-0.5 rounded border border-green-500/20">
                                {game.result}
                              </span>
                            </TableCell>
                            <TableCell className="p-3 text-right text-xs font-semibold text-zinc-300">
                              ${game.bet_amount.toFixed(2)}
                            </TableCell>
                            <TableCell className="p-3 text-right text-xs font-black text-green-400">
                              +${game.win_amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
 
                {/* Overall Summary Banner */}
                <div className="p-4 bg-muted/15 border border-border/15 rounded-xl flex items-center justify-between text-sm">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Total Net Winnings</span>
                  <span className="font-black text-base text-green-400 flex items-center gap-0.5">
                    <DollarSign className="size-4" />{selectedWinning.total_won.toFixed(2)}
                  </span>
                </div>
              </div>
 
              {/* Modal Footer */}
              <DialogFooter className="p-4 border-t border-border/20 bg-background/50 flex justify-end gap-2 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setSelectedWinning(null)}
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
