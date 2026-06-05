import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { ArrowRight, Zap, RotateCcw, Clock, Trophy, Info, CheckCircle } from 'lucide-react'
import type { PageId } from '@/lib/fortune-data'

interface CashpotPageProps {
  navigate: (page: PageId) => void
}

const CASHPOT_PRIZES: Record<number, string[]> = {
  100: ['$2,600', '$1,000', '$100', '$50', '$20', '$10', '$5', '$2'],
  200: ['$5,200', '$2,000', '$200', '$100', '$40', '$20', '$10', '$4'],
}

const MULTIPLIERS = [100, 200]

export function CashpotPage({ navigate }: CashpotPageProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [multiplier, setMultiplier] = useState(100)
  const [quantity, setQuantity] = useState(1)
  const [purchased, setPurchased] = useState(false)

  const numbers = Array.from({ length: 36 }, (_, i) => i + 1)

  const quickPick = () => {
    setSelected(Math.floor(Math.random() * 36) + 1)
  }

  const totalCost = multiplier * quantity

  const handlePurchase = () => {
    if (!selected) return
    setPurchased(true)
    setTimeout(() => setPurchased(false), 3000)
  }

  const prizes = CASHPOT_PRIZES[multiplier] ?? CASHPOT_PRIZES[100]

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <button onClick={() => navigate('lotteries')} className="text-sm text-muted-foreground hover:text-primary transition-colors mb-4 flex items-center gap-1">
            ← All Games
          </button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img src="/cashpot_logo.png?v=3" alt="Jamaica Cashpot" className="w-12 h-12 object-contain" />
                <div>
                  <h1 className="text-4xl font-extrabold">Jamaica Cashpot</h1>
                  <p className="text-muted-foreground">Pick 1 number from 01–36.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="border-border/60 text-muted-foreground">
                <Clock className="size-3 mr-1" /> Multiple daily draws
              </Badge>
              <Badge className="bg-primary/15 text-primary border-primary/25">
                <Trophy className="size-3 mr-1" /> Top Prize: $850,000
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          {/* Left Panel: Number Picker */}
          <div className="space-y-6">
            {/* Number Grid */}
            <Card className="bg-fortune-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step 1</p>
                    <h2 className="text-lg font-bold">Pick Your Number</h2>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={quickPick}
                      className="gap-1.5 border-border/60"
                    >
                      <Zap className="size-3.5" /> Quick Pick
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected(null)}
                      className="gap-1.5"
                    >
                      <RotateCcw className="size-3.5" /> Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-5">Select 1 number from the grid below</p>
                <div className="grid grid-cols-6 gap-3">
                  {numbers.map(n => (
                    <button
                      key={n}
                      onClick={() => setSelected(selected === n ? null : n)}
                      className={`number-ball mx-auto text-base ${selected === n ? 'number-ball-selected' : 'number-ball-idle'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                {selected && (
                  <div className="mt-5 flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/20 p-3">
                    <div className="number-ball number-ball-selected">{selected}</div>
                    <p className="text-sm">
                      <span className="font-bold text-primary">Number {selected}</span> selected.
                      Good luck!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Play Options */}
            <Card className="bg-fortune-card border-border">
              <CardContent className="p-5 space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Step 2</p>
                  <h2 className="text-lg font-bold mb-4">Play Options</h2>

                  {/* Multiplier */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Play Multiplier</p>
                    <div className="flex gap-2">
                      {MULTIPLIERS.map(m => (
                        <button
                          key={m}
                          onClick={() => setMultiplier(m)}
                          className={`flex-1 rounded-lg py-2.5 text-sm font-bold border transition-all ${multiplier === m
                            ? 'gold-gradient text-fortune-navy border-primary/50 gold-glow'
                            : 'bg-muted/50 text-muted-foreground border-border/60 hover:border-primary/30'
                            }`}
                        >
                          {m === 100 ? '$100 Play' : '$200 Play (2x Prizes)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Number of Tickets</p>
                      <span className="text-sm font-bold text-primary">{quantity}</span>
                    </div>
                    <Slider
                      value={[quantity]}
                      onValueChange={([v]) => setQuantity(v)}
                      min={1}
                      max={10}
                      step={1}
                      className="mb-1"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1</span><span>10</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prize Table */}
            <Card className="bg-fortune-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="size-4 text-muted-foreground" />
                  <h3 className="font-semibold">Prize Table (${multiplier} Play)</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border/50">
                    <span>Position</span>
                    <span>Prize</span>
                  </div>
                  {prizes.map((p, i) => (
                    <div key={i} className={`flex justify-between items-center text-base py-1 ${i === 0 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                      <span className="flex items-center gap-1.5">{i === 0 ? <Trophy className="size-4 text-primary" /> : null} {i === 0 ? '1st Prize' : `${i + 1}nd–${i + 2}th`}</span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Ticket Summary */}
          <div className="space-y-4">
            <Card className="bg-fortune-card border-border sticky top-24">
              <CardContent className="p-5">
                <h2 className="text-lg font-bold mb-4">Your Ticket</h2>

                {/* Ticket Preview */}
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <img src="/cashpot_logo.png?v=3" alt="Cashpot" className="w-6 h-6 object-contain" />
                      <span className="font-bold">Cashpot</span>
                    </div>
                    <Badge variant="outline" className="text-xs border-border/60 text-muted-foreground">
                      ${multiplier} Play
                    </Badge>
                  </div>

                  <div className="flex gap-2 mb-3">
                    {selected ? (
                      <div className="number-ball number-ball-selected text-base">{selected}</div>
                    ) : (
                      <div className="number-ball number-ball-idle text-base opacity-40">?</div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {selected ? `Number ${selected} · Next draw in ~2 min` : 'Pick a number to continue'}
                  </p>
                </div>

                <Separator className="mb-4" />

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tickets</span>
                    <span>{quantity}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per ticket</span>
                    <span>${multiplier}.00</span>
                  </div>
                  <Separator className="opacity-50" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">${totalCost.toFixed(2)}</span>
                  </div>
                </div>

                {purchased ? (
                  <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <CheckCircle className="size-5 text-emerald-400" />
                      <p className="text-emerald-400 font-bold">Tickets Purchased!</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Good luck! Check results soon.</p>
                  </div>
                ) : (
                  <Button
                    className="w-full gold-gradient text-fortune-navy font-bold gold-glow"
                    disabled={!selected}
                    onClick={handlePurchase}
                  >
                    {selected ? `Buy ${quantity > 1 ? `${quantity} Tickets` : 'Ticket'} · $${totalCost.toFixed(2)}` : 'Select a Number'}
                    <ArrowRight className="size-4 ml-1" />
                  </Button>
                )}

                <p className="text-xs text-muted-foreground text-center mt-3">
                  Funds deducted from wallet · Must be 18+
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
