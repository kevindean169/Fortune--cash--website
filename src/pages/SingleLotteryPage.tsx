import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface SingleLotteryPageProps {
  gameId: 'cashpot' | 'money-time' | 'pick-2-single' | 'pick-2-double'
}

const lotteryConfigs: Record<string, {
  name: string
  type: string
  range: number
  isGrid: boolean
  betOptions: { id: string; name: string; rate: string }[]
  drawTimes: string[]
}> = {
  cashpot: {
    name: 'CASHPOT',
    type: 'Cashpot',
    range: 36,
    isGrid: true,
    betOptions: [
      { id: '1', name: 'Cashpot', rate: '26x payout' },
      { id: '2', name: 'Megaball', rate: '36x payout' },
      { id: '3', name: 'Monstaball', rate: '50x payout' },
    ],
    drawTimes: ['08:30 AM', '10:30 AM', '01:00 PM', '05:00 PM', '08:25 PM'],
  },
  'money-time': {
    name: 'Money Time',
    type: 'Cashpot Money Time',
    range: 36,
    isGrid: true,
    betOptions: [
      { id: '6', name: 'Cashpot Money Time', rate: '26x payout' },
    ],
    drawTimes: ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'],
  },
  'pick-2-single': {
    name: 'Pick 2 Single',
    type: 'Pick 2 Single',
    range: 99,
    isGrid: false,
    betOptions: [
      { id: '4', name: 'Pick 2 Single', rate: 'Based on match' },
    ],
    drawTimes: ['09:00 AM', '01:00 PM', '07:00 PM'],
  },
  'pick-2-double': {
    name: 'P2 Double Digit',
    type: 'Pick 2 Double',
    range: 99,
    isGrid: false,
    betOptions: [
      { id: '5', name: 'Pick 2 Double', rate: 'Based on match' },
    ],
    drawTimes: ['11:00 AM', '03:00 PM', '08:00 PM'],
  },
}

interface BetItem {
  id: number
  number: string
  gameName: string
  drawTime: string
  amount: number
}

export function SingleLotteryPage({ gameId }: SingleLotteryPageProps) {
  const routerNavigate = useNavigate()
  const navigate = (path: string) => routerNavigate(path === 'home' ? '/' : `/${path}`)
    const id = gameId || 'cashpot'
  const config = lotteryConfigs[id] || lotteryConfigs.cashpot

  const [activeTab, setActiveTab] = useState<'buy' | 'prize' | 'how' | 'soldout'>('buy')
  const [selectedNumber, setSelectedNumber] = useState('')
  const [selectedDrawTimes, setSelectedDrawTimes] = useState<string[]>([])
  const [selectedBetOptions, setSelectedBetOptions] = useState<string[]>([])
  const [betAmount, setBetAmount] = useState('25')
  const [cart, setCart] = useState<BetItem[]>([])
  const [payoutSuccess, setPayoutSuccess] = useState(false)

  const toggleDrawTime = (time: string) => {
    setSelectedDrawTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    )
  }

  const toggleBetOption = (optionId: string) => {
    setSelectedBetOptions((prev) =>
      prev.includes(optionId) ? prev.filter((o) => o !== optionId) : [...prev, optionId]
    )
  }

  const handleAddBet = () => {
    if (!selectedNumber) { alert('Please select or enter a bet number'); return }
    if (selectedDrawTimes.length === 0) { alert('Please select at least one draw time'); return }
    if (selectedBetOptions.length === 0) { alert('Please select at least one game bet option'); return }
    if (parseFloat(betAmount) <= 0 || isNaN(parseFloat(betAmount))) { alert('Please enter a valid bet amount'); return }

    const newBets: BetItem[] = []
    selectedBetOptions.forEach((optionId) => {
      const optionName = config.betOptions.find((o) => o.id === optionId)!.name
      selectedDrawTimes.forEach((time) => {
        newBets.push({
          id: Date.now() + Math.random(),
          number: selectedNumber.toString().padStart(2, '0'),
          gameName: optionName,
          drawTime: time,
          amount: parseFloat(betAmount),
        })
      })
    })

    setCart([...cart, ...newBets])
    setSelectedNumber('')
    setSelectedDrawTimes([])
    setSelectedBetOptions([])
  }

  const handleRemoveBet = (betId: number) => setCart(cart.filter((b) => b.id !== betId))
  const cartTotal = cart.reduce((sum, item) => sum + item.amount, 0)

  const handleCheckout = () => {
    if (cart.length === 0) return
    setPayoutSuccess(true)
    setTimeout(() => {
      setPayoutSuccess(false)
      setCart([])
    }, 3000)
  }

  const goldBtn = {
    background: 'linear-gradient(to bottom, #5c9e42, #36791d)',
    color: 'white',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 0 15px rgba(92,158,66,0.3)',
  }

  return (
    <div className="min-h-screen py-10">
      {/* Success Modal */}
      {payoutSuccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-sm w-full bg-fortune-card border border-green-500/30">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400 text-3xl animate-bounce">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Bet Placed!</h3>
              <p className="text-muted-foreground text-sm">Your tickets have been registered successfully. Balance updated.</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Lottery Header */}
        <Card className="bg-fortune-card border border-border/60 mb-8">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('games')}
                className="size-12 bg-background border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
              >
                <ArrowLeft className="size-5" />
              </button>
              <div>
                <h1 className="text-3xl font-extrabold text-foreground">{config.name}</h1>
                <p className="text-xs text-muted-foreground">
                  Type: <span className="text-primary font-semibold">{config.type}</span>&nbsp;•&nbsp;
                  Pick: {config.range === 36 ? '01–36' : '00–99'}
                </p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs text-muted-foreground uppercase">Next Draw In</p>
              <p className="font-extrabold text-xl text-primary">04 hrs : 22 mins : 10 secs</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Tabs */}
        <div className="flex gap-0 border-b border-border/50 mb-8 overflow-x-auto scrollbar-hide">
          {([
            { id: 'buy', label: 'Buy Tickets' },
            { id: 'prize', label: 'Prize Structure' },
            { id: 'how', label: 'How to Play' },
            { id: 'soldout', label: 'Sold Out Numbers' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* BUY TICKETS */}
        {activeTab === 'buy' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Play Area */}
            <div className="lg:col-span-2 space-y-6">

              {/* Pick Number */}
              <Card className="bg-fortune-card border border-border/60">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-foreground mb-4">1. Pick your Bet Number</h3>
                  {config.isGrid ? (
                    <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                      {Array.from({ length: config.range }, (_, i) => i + 1).map((n) => {
                        const numStr = String(n).padStart(2, '0')
                        const isSelected = selectedNumber === numStr
                        return (
                          <button
                            key={n}
                            onClick={() => setSelectedNumber(numStr)}
                            className={`aspect-square rounded-xl flex items-center justify-center font-bold text-sm border transition-all ${
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(224,172,44,0.3)] scale-105'
                                : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                            }`}
                          >
                            {numStr}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex gap-4 items-center">
                      <input
                        type="number"
                        placeholder="Enter a 2-digit number (00-99)"
                        value={selectedNumber}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 99 && val.length <= 2)) {
                            setSelectedNumber(val)
                          }
                        }}
                        className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-foreground text-lg font-bold focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => setSelectedNumber(String(Math.floor(Math.random() * 100)).padStart(2, '0'))}
                        className="px-5 py-3 bg-background border border-border text-foreground text-sm font-semibold rounded-xl hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        Quick Pick
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Draw Times */}
              <Card className="bg-fortune-card border border-border/60">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-foreground mb-4">2. Select Draw Times</h3>
                  <div className="flex flex-wrap gap-2">
                    {config.drawTimes.map((time) => {
                      const isSelected = selectedDrawTimes.includes(time)
                      return (
                        <button
                          key={time}
                          onClick={() => toggleDrawTime(time)}
                          className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/15 text-primary'
                              : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
                          }`}
                        >
                          {time}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Options & Bet Amount */}
              <Card className="bg-fortune-card border border-border/60">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-foreground mb-4">3. Select Options & Bet Amount</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    {config.betOptions.map((opt) => {
                      const isSelected = selectedBetOptions.includes(opt.id)
                      return (
                        <button
                          key={opt.id}
                          onClick={() => toggleBetOption(opt.id)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-background hover:bg-primary/5 hover:border-primary/30'
                          }`}
                        >
                          <p className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>{opt.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{opt.rate}</p>
                        </button>
                      )
                    })}
                  </div>

                  {/* Amount */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                      <input
                        type="number"
                        placeholder="Bet Amount"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-3 text-foreground font-bold focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-start">
                      {['5', '10', '25', '50', '100'].map((val) => (
                        <button
                          key={val}
                          onClick={() => setBetAmount(val)}
                          className={`px-3 py-3 border text-xs font-bold rounded-xl transition-all flex-1 sm:flex-initial ${
                            betAmount === val
                              ? 'border-primary text-primary bg-primary/10'
                              : 'border-border bg-background text-muted-foreground hover:border-border/80'
                          }`}
                        >
                          ${val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 border-t border-border/50 pt-6 text-right">
                    <Button
                      onClick={handleAddBet}
                      style={goldBtn}
                      className="px-8 py-6 font-bold rounded-xl hover:opacity-90"
                    >
                      Add Bet Card
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cart */}
            <div className="lg:col-span-1">
              <Card className="bg-fortune-card border border-border/60 sticky top-24">
                <CardContent className="p-6 flex flex-col justify-between min-h-[450px]">
                  <div>
                    <h3 className="font-bold text-lg text-foreground border-b border-border pb-3 mb-4">
                      Total Bets View ({cart.length})
                    </h3>

                    {cart.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-3">🎟️</div>
                        <p className="text-muted-foreground text-sm">No bets added to card yet.</p>
                        <p className="text-[11px] text-muted-foreground/60 mt-1">Configure options on the left and click "Add Bet Card".</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {cart.map((item) => (
                          <div key={item.id} className="p-3 bg-background border border-border rounded-xl flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-primary text-sm">#{item.number}</span>
                                <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-muted border border-border rounded-full">
                                  {item.gameName}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">Draw: {item.drawTime}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-sm text-foreground">${item.amount.toFixed(2)}</span>
                              <button
                                onClick={() => handleRemoveBet(item.id)}
                                className="text-muted-foreground hover:text-red-400 transition-colors"
                              >
                                <X className="size-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-4 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground text-sm">Grand Total:</span>
                      <span className="font-extrabold text-xl text-green-400">${cartTotal.toFixed(2)}</span>
                    </div>
                    <button
                      disabled={cart.length === 0}
                      onClick={handleCheckout}
                      style={cart.length > 0 ? goldBtn : undefined}
                      className={`w-full py-4 rounded-xl font-bold transition-all ${
                        cart.length === 0
                          ? 'bg-muted border border-border text-muted-foreground cursor-not-allowed'
                          : 'cursor-pointer hover:opacity-90'
                      }`}
                    >
                      Place Bets & Checkout
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        )}

        {/* PRIZE STRUCTURE */}
        {activeTab === 'prize' && (
          <Card className="bg-fortune-card border border-border/60">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Prize Payout Structure</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 px-4 text-muted-foreground uppercase text-xs">Bet Option</th>
                      <th className="py-3 px-4 text-muted-foreground uppercase text-xs">Odds</th>
                      <th className="py-3 px-4 text-muted-foreground uppercase text-xs text-right">Example Payout ($10 Bet)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-4 px-4 font-bold text-foreground">Cashpot</td>
                      <td className="py-4 px-4 text-primary font-semibold">26 to 1</td>
                      <td className="py-4 px-4 text-right text-green-400 font-bold">$260.00</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-4 px-4 font-bold text-foreground">Megaball</td>
                      <td className="py-4 px-4 text-purple-400 font-semibold">36 to 1</td>
                      <td className="py-4 px-4 text-right text-green-400 font-bold">$360.00</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-4 px-4 font-bold text-foreground">Monstaball</td>
                      <td className="py-4 px-4 text-primary font-semibold">50 to 1</td>
                      <td className="py-4 px-4 text-right text-green-400 font-bold">$500.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* HOW TO PLAY */}
        {activeTab === 'how' && (
          <Card className="bg-fortune-card border border-border/60">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-2xl font-bold text-foreground">How to Play {config.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {[
                  { step: '01', title: 'Choose Numbers', desc: `Select a single number from ${config.range === 36 ? '01 to 36' : '00 to 99'}. Use Quick Pick to generate a random selection.`, icon: '#' },
                  { step: '02', title: 'Select Draw Times', desc: 'Decide which draw times you want to play. You can select one, multiple, or all draws for the day.', icon: '⏱' },
                  { step: '03', title: 'Choose Options & Bet', desc: 'Pick a bet type (e.g. Cashpot, Megaball) and enter your bet amount. Add the bet card and check out!', icon: '🎟️' },
                ].map((s) => (
                  <div key={s.step} className="p-5 border border-border rounded-xl bg-white/[0.02]">
                    <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                      <span className="font-extrabold text-sm text-primary">{s.step}</span>
                    </div>
                    <h4 className="font-bold text-foreground mb-2">{s.title}</h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* SOLD OUT */}
        {activeTab === 'soldout' && (
          <Card className="bg-fortune-card border border-border/60">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Sold Out Numbers</h2>
              <p className="text-muted-foreground text-sm mb-6">
                The following numbers have reached their draw bet limit for today and cannot accept any more bets.
              </p>
              <div className="flex flex-wrap gap-3">
                {['14', '07', '22', '31'].map((num) => (
                  <span
                    key={num}
                    className="px-4 py-2 border border-red-500/30 bg-red-500/5 text-red-400 font-bold rounded-xl text-sm"
                  >
                    #{num} (Draw: 05:00 PM)
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
