import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, X, Ticket, Clock, Hash, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useDateTimeCountdown } from '@/hooks/useDateTimeCountdown'
import { submitLotteryPurchase } from '@/lib/lotteryPurchase'

interface BetItem {
  id: number
  number: string
  gameName: string
  drawTime: string
  amount: number
  batchId?: string
}

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '/favicon.png'
  if (imagePath.startsWith('http')) return imagePath
  return `https://staging.fortunescash.com${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
}

function formatDrawTimeToLocal(timeStr: string): { display: string; original: string } {
  if (!timeStr) return { display: '-', original: '' }

  let cleanTime = timeStr.trim();
  if (/[AP]M/i.test(cleanTime)) {
    const parts = cleanTime.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
    if (parts) {
      let hrs = parseInt(parts[1], 10);
      const mins = parts[2];
      const ampm = parts[3].toUpperCase();
      if (ampm === 'PM' && hrs < 12) hrs += 12;
      if (ampm === 'AM' && hrs === 12) hrs = 0;
      cleanTime = `${String(hrs).padStart(2, '0')}:${mins}:00`;
    }
  }

  if (cleanTime.split(':').length === 2) {
    cleanTime += ':00';
  }

  const today = new Date();
  const jDateStr = today.toLocaleString('en-US', { timeZone: 'America/Jamaica' }).split(',')[0];
  const [m, d, y] = jDateStr.split('/');
  const dateIso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;

  const dateStr = `${dateIso}T${cleanTime}-05:00`;
  const localDate = new Date(dateStr);

  if (isNaN(localDate.getTime())) {
    return { display: timeStr, original: timeStr };
  }

  const localTimeDisplay = localDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  const localDateDisplay = localDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });

  return {
    display: `${localTimeDisplay} (${localDateDisplay})`,
    original: timeStr
  };
}

export function Pick2DoublePage() {
  const routerNavigate = useNavigate()
  const navigate = (path: string) => routerNavigate(path === 'home' ? '/' : `/${path}`)
  const [searchParams] = useSearchParams()
  const urlId = searchParams.get('id')

  const { accessToken, fetchWallet } = useAuth()

  // Dynamic States
  const [lotteryId, setLotteryId] = useState<string | null>(urlId)
  const [lotteryData, setLotteryData] = useState<any>(null)
  const [howToPlayData, setHowToPlayData] = useState<string>('')
  const [priceData, setPriceData] = useState<any>(null)
  const [soldOutList, setSoldOutList] = useState<string[]>([])
  const [selectedSoldOutTime, setSelectedSoldOutTime] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Flow states
  const [selectedNumber, setSelectedNumber] = useState('')
  const [selectedNumber2, setSelectedNumber2] = useState('')
  const [showGrid1, setShowGrid1] = useState<boolean>(false)
  const [showGrid2, setShowGrid2] = useState<boolean>(false)
  const [selectedDrawTimes, setSelectedDrawTimes] = useState<string[]>([])
  const [betAmounts, setBetAmounts] = useState<Record<string, string>>({}) // GameId -> Amount mapping
  const [cart, setCart] = useState<BetItem[]>([])
  const [payoutSuccess, setPayoutSuccess] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)
  const [editingGameAmount, setEditingGameAmount] = useState<string | null>(null)


  // Local configurations fallback
  const localConfig = {
    name: 'P2 Double Digit',
    type: 'Pick 2 Double',
    range: 99,
    isGrid: false,
    betOptions: [
      { id: '5', name: 'Pick 2 Double', rate: 'Based on match' },
    ],
    drawTimes: ['11:00 AM', '03:00 PM', '08:00 PM'],
  }

  // 1. Resolve Lottery ID from type if not in URL
  useEffect(() => {
    if (urlId) {
      setLotteryId(urlId)
      return
    }

    const headers: any = {
      'X-App-Key': import.meta.env.VITE_AUTH_API_KEY || 'c326d53a97bc32972cc7de9d4f03d27845efc9a81d8f1e7af347f3da42cbd52e',
    }
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const baseUrl = import.meta.env.VITE_API_URL || ''
    fetch(`${baseUrl}/api/lotteries`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          const matched = data.data.find((lot: any) => {
            const typeLower = lot.type.toLowerCase()
            return typeLower.includes('double')
          })
          if (matched) {
            setLotteryId(String(matched.id))
          }
        }
      })
      .catch((err) => console.error('Failed to resolve lottery ID from list:', err))
  }, [urlId, accessToken])

  // 2. Fetch Lottery details (singlelottery, how-to-play, price) once ID is resolved
  useEffect(() => {
    if (!lotteryId) return

    setLoading(true)
    setError(null)

    const headers: any = {
      'X-App-Key': import.meta.env.VITE_AUTH_API_KEY || 'c326d53a97bc32972cc7de9d4f03d27845efc9a81d8f1e7af347f3da42cbd52e',
    }
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const baseUrl = import.meta.env.VITE_API_URL || ''

    Promise.all([
      fetch(`${baseUrl}/api/singlelottery/${lotteryId}`, { headers }).then(res => res.json()),
      fetch(`${baseUrl}/api/how-to-play/${lotteryId}`, { headers }).then(res => res.json()).catch(() => null),
      fetch(`${baseUrl}/api/price/${lotteryId}`, { headers }).then(res => res.json()).catch(() => null),
    ])
      .then(([singleRes, howRes, priceRes]) => {
        if (singleRes.status === 'success' && singleRes.data) {
          setLotteryData(singleRes.data)
        } else {
          throw new Error(singleRes.message || 'Failed to fetch lottery details')
        }

        if (howRes?.status === 'success' && howRes.data) {
          setHowToPlayData(howRes.data.howToPlay)
        }

        if (priceRes?.status === 'success' && priceRes.data) {
          setPriceData(priceRes.data)
        }

        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching lottery details:', err)
        setError(err.message || 'An error occurred while loading lottery details.')
        setLoading(false)
      })
  }, [lotteryId, accessToken])

  // Dynamic config construction
  const config = {
    name: lotteryData?.name || localConfig.name,
    type: lotteryData?.type || localConfig.type,
    range: 99,
    isGrid: false,
    drawTimes: lotteryData?.drawDetails?.map((d: any) => d.draw_time) || localConfig.drawTimes,
    games: (lotteryData?.gameDetails || priceData?.gameDetails) ?
      (lotteryData?.gameDetails || priceData?.gameDetails).map((game: any) => {
        const lotGame = lotteryData?.gameDetails?.find((g: any) => g.game_id === game.game_id);
        const presets = game.bet_option || lotGame?.bet_option || [];
        return {
          id: game.game_id.toString(),
          name: game.game_name,
          defaultAmount: game.bet_amount,
          defaultAmountMonsta: game.bet_amount_monsta,
          presets: presets.length > 0 ? presets : ['5', '10', '25', '50', '100'],
        }
      }) : localConfig.betOptions.map(o => ({
        id: o.id,
        name: o.name,
        defaultAmount: 10,
        defaultAmountMonsta: null,
        presets: ['5', '10', '25', '50', '100']
      }))
  }

  // Live countdown to next draw
  const targetDate = lotteryData?.currentDrawUtc || lotteryData?.currentDraw
  const [d, h, m, s] = useDateTimeCountdown(targetDate || '')

  // Tab State
  const [activeTab, setActiveTab] = useState<'buy' | 'prize' | 'how' | 'soldout'>('buy')

  // 3. Automatically pick first draw time for soldout page if none selected
  useEffect(() => {
    if (activeTab === 'soldout' && !selectedSoldOutTime && config.drawTimes.length > 0) {
      setSelectedSoldOutTime(config.drawTimes[0])
    }
  }, [activeTab, config.drawTimes, selectedSoldOutTime])

  // 4. Fetch Sold Out Numbers when tab active or draw time changes
  useEffect(() => {
    if (activeTab === 'soldout' && lotteryId && selectedSoldOutTime) {
      const headers: any = {
        'X-App-Key': import.meta.env.VITE_AUTH_API_KEY || 'c326d53a97bc32972cc7de9d4f03d27845efc9a81d8f1e7af347f3da42cbd52e',
      }
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      const baseUrl = import.meta.env.VITE_API_URL || ''
      fetch(`${baseUrl}/api/pick-sold-out-numbers/${lotteryId}?draw_time=${selectedSoldOutTime}`, { headers })
        .then(res => res.json())
        .then(resData => {
          if (resData.status === 'success' && Array.isArray(resData.data)) {
            setSoldOutList(resData.data)
          } else {
            setSoldOutList([])
          }
        })
        .catch(err => {
          console.error('Fetch sold out numbers error:', err)
          setSoldOutList([])
        })
    }
  }, [activeTab, selectedSoldOutTime, lotteryId, accessToken])

  const toggleDrawTime = (time: string) => {
    setSelectedDrawTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    )
  }

  const getNumberWarning = (num: string, label: string): string | null => {
    if (!num) return null
    const val = parseInt(num, 10)
    if (num === '0' || num === '00' || isNaN(val) || val < 1 || val > 36) {
      return `${label} must be between 01 and 36.`
    }
    return null
  }

  const getBetAmountWarning = (gameIdStr: string, amountStr: string): string | null => {
    if (!amountStr) return null
    const amountVal = parseFloat(amountStr)
    if (isNaN(amountVal) || amountVal <= 0) return 'Enter a valid amount.'

    // Realtime Bet limit warning
    const limitInfo = getMinLimitForGame(gameIdStr)
    if (limitInfo.limit !== Infinity && amountVal > limitInfo.limit) {
      return `Exceeds limit of $${limitInfo.limit}${limitInfo.time ? ` for ${limitInfo.time}` : ''}`
    }

    return null
  }

  const getGameLimit = (gameIdStr: string, time: string): number => {
    const detail = lotteryData?.betlimit?.find((d: any) => d.draw_time === time)
    if (!detail) return Infinity
    if (gameIdStr === '5') return parseFloat(detail.pick2_bet_limit || 'Infinity')
    return Infinity
  }

  const getMinLimitForGame = (gameIdStr: string): { limit: number; time?: string } => {
    if (selectedDrawTimes.length === 0) return { limit: Infinity }
    let minLimit = Infinity
    let minTime = ''
    selectedDrawTimes.forEach(time => {
      const lim = getGameLimit(gameIdStr, time)
      if (lim < minLimit) {
        minLimit = lim
        minTime = time
      }
    })
    return { limit: minLimit, time: minTime }
  }



  const handleAddAllBets = () => {
    if (!selectedNumber) { alert('Please select or enter Bet No. 1'); return }
    if (!selectedNumber2) { alert('Please select or enter Bet No. 2'); return }
    const val1 = parseInt(selectedNumber, 10)
    const val2 = parseInt(selectedNumber2, 10)
    if (isNaN(val1) || val1 < 1 || val1 > 36 || selectedNumber === '0' || selectedNumber === '00') {
      alert('Bet No. 1 must be between 01 and 36.')
      return
    }
    if (isNaN(val2) || val2 < 1 || val2 > 36 || selectedNumber2 === '0' || selectedNumber2 === '00') {
      alert('Bet No. 2 must be between 01 and 36.')
      return
    }

    if (selectedDrawTimes.length === 0) { alert('Please select at least one draw time'); return }

    // Validate limits
    for (const game of config.games) {
      const amountStr = betAmounts[game.id] || ''
      const amountVal = parseFloat(amountStr)
      if (amountStr !== '' && !isNaN(amountVal) && amountVal > 0) {
        for (const time of selectedDrawTimes) {
          const limit = getGameLimit(game.id, time)
          if (amountVal > limit) {
            alert(`Cannot place bet. Bet amount of $${amountVal} for ${game.name} exceeds the remaining limit of $${limit} for draw time ${time}.`)
            return
          }
        }
      }
    }

    const numVal = `${selectedNumber.toString().padStart(2, '0')} - ${selectedNumber2.toString().padStart(2, '0')}`

    const batchId = `batch-${Date.now()}-${Math.random()}`
    const newBets: BetItem[] = []
    let hasValidBet = false

    config.games.forEach((game: { id: string; name: string; presets: string[] }) => {
      const amountStr = betAmounts[game.id] || ''
      const amountVal = parseFloat(amountStr)
      if (amountStr !== '' && !isNaN(amountVal) && amountVal > 0) {
        hasValidBet = true
        selectedDrawTimes.forEach((time) => {
          newBets.push({
            id: Date.now() + Math.random(),
            batchId,
            number: numVal,
            gameName: game.name,
            drawTime: time,
            amount: amountVal,
          })
        })
      }
    })

    if (!hasValidBet) {
      alert('Please enter a bet amount for at least one of the options');
      return
    }

    setCart([...cart, ...newBets])

  }

  const handleClearData = () => {
    setSelectedNumber('')
    setSelectedNumber2('')
    setSelectedDrawTimes([])
    setBetAmounts({})
    setShowGrid1(false)
    setShowGrid2(false)

  }

  const groupedCart = (() => {
    const groups: { batchId: string; number: string; draws: string[]; games: { name: string; amount: number }[] }[] = [];
    cart.forEach(item => {
      const bId = item.batchId || `batch-legacy-${item.number}`;
      let existing = groups.find(g => g.batchId === bId);
      if (!existing) {
        existing = {
          batchId: bId,
          number: item.number,
          draws: [],
          games: []
        };
        groups.push(existing);
      }
      if (!existing.draws.includes(item.drawTime)) {
        existing.draws.push(item.drawTime);
      }
      const gameExists = existing.games.find(g => g.name === item.gameName && g.amount === item.amount);
      if (!gameExists) {
        existing.games.push({ name: item.gameName, amount: item.amount });
      }
    });
    return groups;
  })();

  const handleRemoveBatch = (batchId: string) => {
    setCart(cart.filter(item => (item.batchId || `batch-legacy-${item.number}`) !== batchId));
  };

  const handleRemoveDrawFromBatch = (batchId: string, drawTime: string) => {
    setCart(cart.filter(item => !((item.batchId || `batch-legacy-${item.number}`) === batchId && item.drawTime === drawTime)));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.amount, 0)

  const handleCheckout = async () => {
    if (cart.length === 0 || !lotteryId || checkoutLoading) return

    setCheckoutLoading(true)
    try {
      await submitLotteryPurchase({
        baseUrl: import.meta.env.VITE_API_URL || '',
        accessToken,
        appKey: import.meta.env.VITE_AUTH_API_KEY || 'c326d53a97bc32972cc7de9d4f03d27845efc9a81d8f1e7af347f3da42cbd52e',
        lotteryId,
        cart,
        purchasePath: `/api/customer/picktwodouble-purchase/${lotteryId}`,
        printStatusPath: '/api/customer/pickprintstatus',
        getGameId: (item) => {
          const game = config.games.find((g: { id: string; name: string }) => g.name === item.gameName)
          return game?.id || '5'
        },
        doubleNumber: true,
      })

      setPayoutSuccess(true)
      fetchWallet()
      setTimeout(() => {
        setPayoutSuccess(false)
        setCart([])
      }, 3000)
    } catch (err: any) {
      console.error('Purchase error:', err)
      alert(err.message || 'An error occurred while submitting purchase request.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <p className="text-red-400 font-semibold mb-4">{error}</p>
        <Button onClick={() => navigate('lotteries')} className="gold-gradient text-white font-bold">
          Back to Lotteries
        </Button>
      </div>
    )
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

        {/* Lottery Header styled like App */}
        <Card className="border border-border/60 mb-6 overflow-hidden relative min-h-[64px] flex items-center bg-[#0c0c0c]">
          {/* Background Image covering full card */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={getImageUrl(lotteryData?.image)}
              alt={config.name}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          </div>

          <CardContent className="p-3 md:p-4 flex flex-row items-center justify-between gap-4 w-full relative z-10">
            {/* Left side: Back button + Name and Type in one row */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate('lotteries')}
                className="size-10 bg-background/80 backdrop-blur border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shrink-0"
              >
                <ArrowLeft className="size-4" />
              </button>

              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-black text-white uppercase tracking-wide truncate">
                  {config.name}
                </h1>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider truncate">
                  Type: <span className="text-primary">{config.type}</span>
                </p>
              </div>
            </div>

            {/* Right side: Timer in one compact row */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[9px] lg:text-xs text-muted-foreground font-black uppercase tracking-widest hidden sm:inline mr-1 lg:mr-3">
                Next Draw:
              </span>
              <div className="flex items-center gap-1 text-[11px] sm:text-xs lg:text-lg font-black tabular-nums bg-black/60 border border-primary/20 px-2.5 py-1.5 lg:px-4 lg:py-2 rounded-xl text-white shadow-[0_0_10px_rgba(var(--primary),0.1)]">
                <span className="text-primary">{d}d</span>
                <span className="text-muted-foreground/60">:</span>
                <span>{h}h</span>
                <span className="text-muted-foreground/60">:</span>
                <span>{m}m</span>
                <span className="text-muted-foreground/60">:</span>
                <span className="text-primary animate-pulse">{s}s</span>
              </div>
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
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
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
          <div>
            {/* Desktop View */}
            <div className="hidden lg:grid grid-cols-3 gap-8">

              {/* Play Area */}
              <div className="lg:col-span-2 space-y-6">

                {/* Draw Selector Slots */}
                <Card className="bg-fortune-card border border-border/60">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4 border-b border-border/40 pb-3">
                      <span className="px-3 py-1 bg-primary/10 border border-primary/30 text-primary font-extrabold text-xs rounded-lg uppercase tracking-wider">
                        Daily Schedule
                      </span>
                      <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-foreground font-extrabold text-xs rounded-lg">
                        {selectedDrawTimes.length.toString().padStart(2, '0')} Selected Draws
                      </span>
                    </div>

                    <h3 className="font-extrabold text-lg text-foreground mb-4">Select your Next Draw Slots</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {config.drawTimes.map((time: string) => {
                        const isSelected = selectedDrawTimes.includes(time)
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => toggleDrawTime(time)}
                            className={`py-3.5 px-2 text-xs font-bold rounded-xl border transition-all ${isSelected
                              ? 'border-primary bg-primary/15 text-primary shadow-[0_0_10px_rgba(224,172,44,0.15)]'
                              : 'border-neutral-800 bg-[#0d0d0d] text-muted-foreground hover:border-primary/30 hover:text-foreground'
                              }`}
                          >
                            {formatDrawTimeToLocal(time).display}
                          </button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Pick Number Panel */}
                <Card className="bg-fortune-card border border-border/60">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-extrabold text-lg text-foreground">Pick your Bet Numbers</h3>
                        <p className="text-xs text-muted-foreground">Select two numbers (01-36) for Pick 2 Double</p>
                      </div>

                      <div className="space-y-4">
                        {/* Bet No. 1 */}
                        <div className="flex flex-col gap-4 border-b border-border/45 pb-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <span className="text-sm font-extrabold text-foreground uppercase tracking-wider font-semibold">Bet No. 1</span>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setShowGrid1(!showGrid1)}
                                className="min-w-[160px] bg-background border border-border hover:border-primary/40 px-4 py-3 rounded-xl flex items-center justify-between font-bold text-sm text-foreground transition-all"
                              >
                                <span className={selectedNumber ? 'text-primary' : 'text-muted-foreground'}>
                                  {selectedNumber ? `#${selectedNumber}` : 'Select Bet No. 1'}
                                </span>
                                {showGrid1 ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedNumber(String(Math.floor(Math.random() * 36) + 1).padStart(2, '0'))
                                }}
                                className="px-4 py-3 bg-background border border-border text-foreground text-xs font-bold rounded-xl hover:border-primary/40 hover:text-primary transition-colors whitespace-nowrap"
                              >
                                Quick Pick
                              </button>
                            </div>
                          </div>
                          {showGrid1 && (
                            <div className="mt-2 p-4 bg-background/50 border border-border/40 rounded-xl animate-fadeIn">
                              <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                                {Array.from({ length: 36 }, (_, i) => String(i + 1).padStart(2, '0')).map((numStr) => {
                                  const isSelected = selectedNumber === numStr
                                  return (
                                    <button
                                      key={numStr}
                                      type="button"
                                      onClick={() => {
                                        setSelectedNumber(numStr)
                                        setShowGrid1(false)
                                      }}
                                      className={`aspect-square rounded-xl flex items-center justify-center font-bold text-sm border transition-all ${isSelected
                                        ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(224,172,44,0.3)] scale-105'
                                        : 'border-neutral-800 bg-[#0d0d0d] text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                        }`}
                                    >
                                      {numStr}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          {getNumberWarning(selectedNumber, 'Bet No. 1') && (
                            <span className="text-red-400 text-xs mt-1 font-semibold text-right">{getNumberWarning(selectedNumber, 'Bet No. 1')}</span>
                          )}
                        </div>

                        {/* Bet No. 2 */}
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <span className="text-sm font-extrabold text-foreground uppercase tracking-wider font-semibold">Bet No. 2</span>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setShowGrid2(!showGrid2)}
                                className="min-w-[160px] bg-background border border-border hover:border-primary/40 px-4 py-3 rounded-xl flex items-center justify-between font-bold text-sm text-foreground transition-all"
                              >
                                <span className={selectedNumber2 ? 'text-primary' : 'text-muted-foreground'}>
                                  {selectedNumber2 ? `#${selectedNumber2}` : 'Select Bet No. 2'}
                                </span>
                                {showGrid2 ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedNumber2(String(Math.floor(Math.random() * 36) + 1).padStart(2, '0'))
                                }}
                                className="px-4 py-3 bg-background border border-border text-foreground text-xs font-bold rounded-xl hover:border-primary/40 hover:text-primary transition-colors whitespace-nowrap"
                              >
                                Quick Pick
                              </button>
                            </div>
                          </div>
                          {showGrid2 && (
                            <div className="mt-2 p-4 bg-background/50 border border-border/40 rounded-xl animate-fadeIn">
                              <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                                {Array.from({ length: 36 }, (_, i) => String(i + 1).padStart(2, '0')).map((numStr) => {
                                  const isSelected = selectedNumber2 === numStr
                                  return (
                                    <button
                                      key={numStr}
                                      type="button"
                                      onClick={() => {
                                        setSelectedNumber2(numStr)
                                        setShowGrid2(false)
                                      }}
                                      className={`aspect-square rounded-xl flex items-center justify-center font-bold text-sm border transition-all ${isSelected
                                        ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(224,172,44,0.3)] scale-105'
                                        : 'border-neutral-800 bg-[#0d0d0d] text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                        }`}
                                    >
                                      {numStr}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          {getNumberWarning(selectedNumber2, 'Bet No. 2') && (
                            <span className="text-red-400 text-xs mt-1 font-semibold text-right">{getNumberWarning(selectedNumber2, 'Bet No. 2')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enter Bet Amounts for Each Game Option */}
                <Card className="bg-fortune-card border border-border/60">
                  <CardContent className="p-6">
                    <h3 className="font-extrabold text-lg text-foreground mb-4">Enter your Bet Amount</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {config.games.map((game: { id: string; name: string; defaultAmount: any; defaultAmountMonsta: any; presets: string[] }) => {
                        const amount = betAmounts[game.id] || ''
                        const warning = getBetAmountWarning(game.id, amount)
                        return (
                          <div key={game.id} className="bg-background/40 border border-neutral-900 rounded-2xl p-4 flex flex-col justify-between min-h-[220px]">
                            <div>
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1">
                                {game.name}
                              </span>

                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-extrabold text-sm">$</span>
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={amount}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    setBetAmounts(prev => ({ ...prev, [game.id]: val }))
                                  }}
                                  className="w-full bg-[#0d0d0d] border border-border/80 rounded-xl pl-8 pr-4 py-3 text-sm font-extrabold text-foreground focus:outline-none focus:border-primary"
                                />
                              </div>

                              {warning && (
                                <p className="text-red-400 text-[11px] font-semibold mt-1.5 leading-tight">{warning}</p>
                              )}

                              {/* Preset Buttons per Game Input */}
                              <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {game.presets.map((val: string) => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setBetAmounts(prev => ({ ...prev, [game.id]: val }))}
                                    className={`px-2 py-1 border text-[10px] font-extrabold rounded transition-all ${amount === val
                                      ? 'border-primary text-primary bg-primary/15'
                                      : 'border-neutral-800 bg-[#0d0d0d] text-muted-foreground hover:border-neutral-700'
                                      }`}
                                  >
                                    ${val}
                                  </button>
                                ))}
                              </div>
                            </div>


                          </div>
                        )
                      })}
                    </div>

                    {/* Actions Row */}
                    <div className="mt-8 border-t border-border/40 pt-6 flex justify-between gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClearData}
                        className="px-6 py-3 border-neutral-800 bg-transparent text-muted-foreground text-xs font-extrabold uppercase tracking-wider rounded-xl hover:bg-neutral-900"
                      >
                        Clear Data
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddAllBets}
                        className="px-6 py-3 gold-gradient text-fortune-navy font-bold text-xs uppercase tracking-wider rounded-xl gold-glow hover:opacity-90"
                      >
                        Add Bet +
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cart Section */}
              <div className="lg:col-span-1">
                <Card className="bg-fortune-card border border-border/60 sticky top-24">
                  <CardContent className="p-6 flex flex-col justify-between min-h-[450px]">
                    <div>
                      <h3 className="font-extrabold text-lg text-foreground border-b border-border pb-3 mb-4">
                        Total Bets View ({groupedCart.length})
                      </h3>

                      {cart.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center justify-center">
                          <Ticket className="size-12 text-primary/60 mb-3" />
                          <p className="text-muted-foreground text-sm font-semibold">No bets added to card yet.</p>
                          <p className="text-xs text-muted-foreground/50 mt-1">Configure options on the left and click "Add Bet".</p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
                          {groupedCart.map((group, idx) => {
                            const groupItems = cart.filter(c => c.batchId === group.batchId);
                            const itemsByDraw = groupItems.reduce((acc, item) => {
                              if (!acc[item.drawTime]) acc[item.drawTime] = [];
                              acc[item.drawTime].push(item);
                              return acc;
                            }, {} as Record<string, typeof cart>);

                            return (
                              <div key={group.batchId} className="animate-fadeIn">
                                <div className="flex items-center justify-between bg-primary/10 border border-primary/20 border-b-0 px-3 py-2 rounded-t-xl">
                                  <span className="text-[11px] font-bold text-primary px-1">Entry {idx + 1}</span>
                                  <button
                                    onClick={() => handleRemoveBatch(group.batchId)}
                                    className="text-muted-foreground hover:text-red-400 p-1"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                                <div className="bg-[#0d0d0d] border border-border/40 rounded-b-xl p-2.5">
                                  {Object.entries(itemsByDraw).map(([time, items], tIdx) => (
                                    <div key={time} className={tIdx > 0 ? "border-t border-border/30 pt-2 mt-2 relative" : "relative"}>
                                      <button
                                        onClick={() => typeof handleRemoveDrawFromBatch === 'function' ? handleRemoveDrawFromBatch(group.batchId, time) : handleRemoveBatch(group.batchId)}
                                        className="absolute right-1 top-1 z-10 text-muted-foreground/40 hover:text-red-400 transition-colors"
                                        title="Remove this draw"
                                      >
                                        <X className="size-3.5" />
                                      </button>
                                      {items.map(item => (
                                        <div key={item.id} className="flex items-center justify-between text-[11px] py-1.5 px-1">
                                          <div className="flex items-center gap-2.5 w-[45%]">
                                            {item.gameName.toLowerCase().includes('cashpot') || item.gameName.toLowerCase().includes('pick') ? (
                                              <span className="flex items-center justify-center min-w-[22px] px-2 h-[22px] w-fit whitespace-nowrap bg-white text-black rounded-full font-black text-[10px] shadow-sm">
                                                {item.number}
                                              </span>
                                            ) : item.gameName.toLowerCase().includes('mega') ? (
                                              <span className="size-[22px] bg-[#d4af37] rounded-full shadow-sm"></span>
                                            ) : item.gameName.toLowerCase().includes('monsta') ? (
                                              <span className="size-[22px] bg-[#ef4444] rounded-full shadow-sm"></span>
                                            ) : (
                                              <span className="size-[22px] bg-neutral-600 rounded-full shadow-sm"></span>
                                            )}
                                            <span className="font-bold text-foreground truncate">{item.gameName}</span>
                                          </div>
                                          <span className="text-muted-foreground w-[25%] text-left font-medium">
                                            {time.includes(',') ? time.split(',')[1].trim() : formatDrawTimeToLocal(time).display.split(' ')[0]}
                                          </span>
                                          <span className="font-extrabold text-foreground w-[30%] text-right pr-5">
                                            $ {item.amount.toFixed(2)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border pt-4 mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-muted-foreground text-sm font-bold">Grand Total:</span>
                        <span className="font-extrabold text-lg text-green-400">${cartTotal.toFixed(2)}</span>
                      </div>
                      <Button
                        disabled={cart.length === 0 || checkoutLoading}
                        onClick={handleCheckout}
                        size="lg"
                        className={`w-full font-bold text-xs uppercase tracking-widest transition-all ${cart.length === 0 || checkoutLoading
                          ? 'bg-muted border border-border text-muted-foreground cursor-not-allowed'
                          : 'gold-gradient text-fortune-navy gold-glow hover:opacity-90'
                          }`}
                      >
                        {checkoutLoading ? 'Processing...' : 'Place Bets & Checkout'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>

            {/* Mobile Responsive Stepped View */}
            <div className="lg:hidden space-y-2 pb-36">
              {/* Draws selection */}
              <Card className="bg-fortune-card border border-border/60 py-3 gap-2">
                <CardContent className="px-3 py-1">
                  <div className="flex justify-between items-center mb-1 pb-1 border-b border-border/40">
                    <span className="text-xs text-primary font-black uppercase tracking-wider">Draw Schedule</span>
                    <span className="text-xs text-muted-foreground font-bold">{selectedDrawTimes.length} Selected</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {config.drawTimes.map((time: string) => {
                      const isSelected = selectedDrawTimes.includes(time)
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => toggleDrawTime(time)}
                          className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition-all ${isSelected
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-neutral-800 bg-[#0d0d0d] text-muted-foreground'
                            }`}
                        >
                          {formatDrawTimeToLocal(time).display.split(' ')[0]}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Pick Numbers */}
              <Card className="bg-fortune-card border border-border/60 py-3 gap-2">
                <CardContent className="px-3 py-1 space-y-3">
                  <h3 className="font-extrabold text-sm text-foreground mb-1">Pick your Bet Numbers</h3>

                  {/* Bet No. 1 Mobile */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Bet No. 1</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNumber(String(Math.floor(Math.random() * 36) + 1).padStart(2, '0'))
                        }}
                        className="px-2 py-1 bg-neutral-900 border border-neutral-850 text-foreground text-[10px] font-bold rounded-md"
                      >
                        Quick Pick
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setShowGrid1(!showGrid1); setShowGrid2(false) }}
                      className="w-full bg-background border border-border px-3 py-2.5 rounded-lg flex items-center justify-between font-bold text-xs text-foreground"
                    >
                      <span className={selectedNumber ? 'text-primary font-extrabold' : 'text-muted-foreground'}>
                        {selectedNumber ? `#${selectedNumber}` : 'Select Number 1'}
                      </span>
                      {showGrid1 ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                    </button>
                    {showGrid1 && (
                      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-fortune-card border border-border/60 rounded-2xl w-full max-w-sm p-6 flex flex-col relative animate-fadeIn shadow-2xl">
                          <h3 className="font-extrabold text-lg text-foreground mb-4">Pick Bet No. 1</h3>
                          <div className="grid grid-cols-6 gap-1.5 mb-6 max-h-[50vh] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-neutral-800">
                            {Array.from({ length: 36 }, (_, i) => String(i + 1).padStart(2, '0')).map((numStr) => (
                              <button
                                key={numStr}
                                type="button"
                                onClick={() => { setSelectedNumber(numStr); setShowGrid1(false) }}
                                className={`aspect-square rounded-lg flex items-center justify-center font-bold text-xs border transition-all ${selectedNumber === numStr
                                  ? 'border-primary bg-primary text-primary-foreground font-black shadow-[0_0_15px_rgba(224,172,44,0.3)] scale-105'
                                  : 'border-neutral-800 bg-[#0d0d0d] text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                  }`}
                              >
                                {numStr}
                              </button>
                            ))}
                          </div>
                          <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-border/40">
                            <Button variant="outline" onClick={() => setShowGrid1(false)} className="border-neutral-800 bg-transparent text-muted-foreground hover:bg-neutral-900 rounded-xl">Cancel</Button>
                            <Button onClick={() => setShowGrid1(false)} className="bg-[#468a35] hover:bg-[#3a7526] text-white font-bold rounded-xl shadow-sm border border-white">Done</Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bet No. 2 Mobile */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Bet No. 2</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNumber2(String(Math.floor(Math.random() * 36) + 1).padStart(2, '0'))
                        }}
                        className="px-2 py-1 bg-neutral-900 border border-neutral-850 text-foreground text-[10px] font-bold rounded-md"
                      >
                        Quick Pick
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setShowGrid2(!showGrid2); setShowGrid1(false) }}
                      className="w-full bg-background border border-border px-3 py-2.5 rounded-lg flex items-center justify-between font-bold text-xs text-foreground"
                    >
                      <span className={selectedNumber2 ? 'text-primary font-extrabold' : 'text-muted-foreground'}>
                        {selectedNumber2 ? `#${selectedNumber2}` : 'Select Number 2'}
                      </span>
                      {showGrid2 ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                    </button>
                    {showGrid2 && (
                      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-fortune-card border border-border/60 rounded-2xl w-full max-w-sm p-6 flex flex-col relative animate-fadeIn shadow-2xl">
                          <h3 className="font-extrabold text-lg text-foreground mb-4">Pick Bet No. 2</h3>
                          <div className="grid grid-cols-6 gap-1.5 mb-6 max-h-[50vh] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-neutral-800">
                            {Array.from({ length: 36 }, (_, i) => String(i + 1).padStart(2, '0')).map((numStr) => (
                              <button
                                key={numStr}
                                type="button"
                                onClick={() => { setSelectedNumber2(numStr); setShowGrid2(false) }}
                                className={`aspect-square rounded-lg flex items-center justify-center font-bold text-xs border transition-all ${selectedNumber2 === numStr
                                  ? 'border-primary bg-primary text-primary-foreground font-black shadow-[0_0_15px_rgba(224,172,44,0.3)] scale-105'
                                  : 'border-neutral-800 bg-[#0d0d0d] text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                  }`}
                              >
                                {numStr}
                              </button>
                            ))}
                          </div>
                          <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-border/40">
                            <Button variant="outline" onClick={() => setShowGrid2(false)} className="border-neutral-800 bg-transparent text-muted-foreground hover:bg-neutral-900 rounded-xl">Cancel</Button>
                            <Button onClick={() => setShowGrid2(false)} className="bg-[#468a35] hover:bg-[#3a7526] text-white font-bold rounded-xl shadow-sm border border-white">Done</Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Enter Bet Amounts */}
              <Card className="bg-fortune-card border border-border/60 py-3 gap-2">
                <CardContent className="px-3 py-1 space-y-1">
                  <h3 className="font-extrabold text-sm text-foreground">Enter your Bet Amount</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {config.games.map((game: { id: string; name: string; presets: string[] }, index: number) => {
                      const amount = betAmounts[game.id] || ''
                      let isDisabled = false;
                      if (index > 0) {
                        const prevGameId = config.games[index - 1].id;
                        const prevAmount = parseFloat(betAmounts[prevGameId] || '0');
                        isDisabled = isNaN(prevAmount) || prevAmount <= 0;
                      }

                      return (
                        <div key={game.id} className="flex flex-col space-y-1.5">
                          <span className={`text-[10px] font-bold text-center ${isDisabled ? 'text-muted-foreground/50' : 'text-foreground'}`}>
                            {game.name}
                          </span>
                          <div className={`flex items-center bg-[#0d0d0d] border rounded-md py-1.5 px-2 transition-all ${isDisabled ? 'border-primary/20 opacity-40 cursor-not-allowed' : 'border-primary/50'}`}>
                            <span className="text-muted-foreground text-sm font-bold mr-1">$</span>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={amount}
                              disabled={isDisabled}
                              onChange={(e) => setBetAmounts(prev => ({ ...prev, [game.id]: e.target.value }))}
                              className={`bg-transparent w-full outline-none text-sm font-bold ${isDisabled ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground'}`}
                            />
                          </div>
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => setEditingGameAmount(game.id)}
                            className={`rounded-md py-1.5 text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${isDisabled
                              ? 'bg-primary/5 border border-primary/20 text-primary/40 cursor-not-allowed'
                              : 'bg-primary/10 border border-primary text-primary hover:bg-primary/20'}`}
                          >
                            + Add
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Fixed Bottom Action Buttons */}
              <div className="fixed bottom-[80px] left-4 right-4 sm:left-6 sm:right-6 z-40 bg-[#0c0c0c]/95 backdrop-blur-xl border border-border/40 rounded-xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)] p-3 flex flex-col gap-2 animate-slideUp">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearData}
                    className="w-1/3 h-10 border-transparent bg-neutral-900/50 text-muted-foreground text-xs font-extrabold rounded-lg hover:bg-neutral-800 hover:text-white"
                  >
                    Clear Data
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddAllBets}
                    className="w-2/3 h-10 bg-[#468a35] hover:bg-[#3a7526] border border-white text-white font-extrabold text-[15px] uppercase tracking-wider rounded-lg shadow-sm transition-all"
                  >
                    ADD BET +
                  </Button>
                </div>

                <Button
                  onClick={() => setShowCartModal(true)}
                  className="w-full h-[50px] bg-[#0d0d0d] border border-primary text-primary font-bold text-[15px] rounded-xl hover:bg-neutral-900 transition-all shadow-[0_0_10px_rgba(255,215,0,0.1)]"
                >
                  Total Bets View ({groupedCart.length})
                </Button>
              </div>

              {/* Custom Amount Pad Popup */}
              {editingGameAmount && (
                <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-fortune-card border border-border/60 rounded-3xl w-full max-w-[300px] p-5 flex flex-col relative animate-fadeIn shadow-2xl">
                    <h3 className="font-extrabold text-base text-foreground mb-0.5 tracking-wide">
                      {config.games.find((g: any) => g.id === editingGameAmount)?.name}
                    </h3>
                    <p className="text-muted-foreground text-[10px] mb-3">Enter the Amount</p>

                    <div className="bg-[#0d0d0d] border border-primary/30 rounded-xl px-4 py-3 text-lg font-bold text-primary mb-4 flex items-center shadow-inner">
                      <span className="text-primary/70 mr-2">$</span>
                      {betAmounts[editingGameAmount] || '0.00'}
                    </div>

                    <div className="flex gap-2 mb-4">
                      {config.games.find((g: any) => g.id === editingGameAmount)?.presets.map((val: string) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setBetAmounts(prev => ({ ...prev, [editingGameAmount]: val }))}
                          className="px-3 py-1.5 bg-[#0d0d0d] border border-primary/30 text-foreground font-bold rounded-lg text-[10px] hover:border-primary transition-colors"
                        >
                          $ {val}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 mb-5">
                      <button onClick={() => setBetAmounts(p => ({ ...p, [editingGameAmount]: (p[editingGameAmount] || '') + '1' }))} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">1</button>
                      <button onClick={() => setBetAmounts(p => ({ ...p, [editingGameAmount]: (p[editingGameAmount] || '') + '2' }))} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">2</button>
                      <button onClick={() => setBetAmounts(p => ({ ...p, [editingGameAmount]: (p[editingGameAmount] || '') + '3' }))} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">3</button>
                      <button onClick={() => setBetAmounts(p => ({ ...p, [editingGameAmount]: (p[editingGameAmount] || '') + (p[editingGameAmount]?.includes('.') ? '' : '.') }))} className="bg-transparent border border-neutral-800 rounded-xl text-2xl font-bold text-foreground py-3 row-span-2 hover:bg-neutral-900 transition-colors">.</button>

                      <button onClick={() => setBetAmounts(p => ({ ...p, [editingGameAmount]: (p[editingGameAmount] || '') + '4' }))} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">4</button>
                      <button onClick={() => setBetAmounts(p => ({ ...p, [editingGameAmount]: (p[editingGameAmount] || '') + '5' }))} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">5</button>
                      <button onClick={() => setBetAmounts(p => ({ ...p, [editingGameAmount]: (p[editingGameAmount] || '') + '6' }))} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">6</button>

                      <button onClick={() => setBetAmounts(p => ({ ...p, [editingGameAmount]: (p[editingGameAmount] || '') + '7' }))} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">7</button>
                      <button onClick={() => setBetAmounts(p => ({ ...p, [editingGameAmount]: (p[editingGameAmount] || '') + '8' }))} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">8</button>
                      <button onClick={() => setBetAmounts(p => ({ ...p, [editingGameAmount]: (p[editingGameAmount] || '') + '9' }))} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">9</button>
                      <button onClick={() => setBetAmounts(p => ({ ...p, [editingGameAmount]: '' }))} className="bg-transparent border border-neutral-800 rounded-xl text-xs font-bold text-red-400 py-3 row-span-2 hover:bg-neutral-900 transition-colors">Clear</button>

                      <button onClick={() => setBetAmounts(p => ({ ...p, [editingGameAmount]: (p[editingGameAmount] || '') + '0' }))} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 col-span-3 hover:bg-neutral-900 transition-colors">0</button>
                    </div>

                    <div className="flex justify-between items-center gap-3">
                      <button type="button" onClick={() => setEditingGameAmount(null)} className="w-1/2 bg-transparent text-muted-foreground text-xs hover:text-foreground font-extrabold pb-1">Cancel</button>
                      <button type="button" onClick={() => setEditingGameAmount(null)} className="w-1/2 gold-gradient text-fortune-navy text-sm font-bold py-3.5 rounded-xl gold-glow transition-all">Done</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Screen Cart View on Mobile */}
              {showCartModal && (
                <div className="fixed inset-0 z-[110] bg-[#0a0a0a] sm:bg-black/80 sm:backdrop-blur-sm flex sm:items-center sm:justify-center animate-slideUp">
                  <div className="bg-fortune-card sm:border sm:border-border/60 sm:rounded-2xl w-full sm:max-w-md h-full sm:h-auto sm:max-h-[85vh] flex flex-col relative">
                    <div className="p-4 border-b border-border/40 flex justify-between items-center bg-[#0d0d0d] sm:rounded-t-2xl">
                      <h3 className="font-black text-lg text-foreground tracking-wide flex items-center gap-2">
                        <Ticket className="size-5 text-primary" /> Total Bets ({groupedCart.length})
                      </h3>
                      <button onClick={() => setShowCartModal(false)} className="bg-neutral-900 p-1.5 rounded-full text-muted-foreground hover:text-white transition-colors">
                        <X className="size-5" />
                      </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800 bg-[#0a0a0a]">
                      {cart.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center justify-center">
                          <Ticket className="size-12 text-primary/60 mb-4" />
                          <p className="text-muted-foreground text-sm font-semibold">No bets added to cart yet.</p>
                          <p className="text-xs text-muted-foreground/50 mt-1">Configure options and click "Add Bet".</p>
                        </div>
                      ) : (
                        <div className="space-y-4 pr-1">
                          {groupedCart.map((group, idx) => {
                            const groupItems = cart.filter(c => c.batchId === group.batchId);
                            const itemsByDraw = groupItems.reduce((acc, item) => {
                              if (!acc[item.drawTime]) acc[item.drawTime] = [];
                              acc[item.drawTime].push(item);
                              return acc;
                            }, {} as Record<string, typeof cart>);

                            return (
                              <div key={group.batchId} className="animate-fadeIn">
                                <div className="flex items-center justify-between bg-primary/10 border border-primary/20 border-b-0 px-3 py-2 rounded-t-xl">
                                  <span className="text-[11px] font-bold text-primary px-1">Entry {idx + 1}</span>
                                  <button
                                    onClick={() => handleRemoveBatch(group.batchId)}
                                    className="text-muted-foreground hover:text-red-400 p-1"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                                <div className="bg-[#0d0d0d] border border-border/40 rounded-b-xl p-2.5">
                                  {Object.entries(itemsByDraw).map(([time, items], tIdx) => (
                                    <div key={time} className={tIdx > 0 ? "border-t border-border/30 pt-2 mt-2 relative" : "relative"}>
                                      <button
                                        onClick={() => typeof handleRemoveDrawFromBatch === 'function' ? handleRemoveDrawFromBatch(group.batchId, time) : handleRemoveBatch(group.batchId)}
                                        className="absolute right-1 top-1 z-10 text-muted-foreground/40 hover:text-red-400 transition-colors"
                                        title="Remove this draw"
                                      >
                                        <X className="size-3.5" />
                                      </button>
                                      {items.map(item => (
                                        <div key={item.id} className="flex items-center justify-between text-[11px] py-1.5 px-1">
                                          <div className="flex items-center gap-2.5 w-[45%]">
                                            {item.gameName.toLowerCase().includes('cashpot') || item.gameName.toLowerCase().includes('pick') ? (
                                              <span className="flex items-center justify-center min-w-[22px] px-2 h-[22px] w-fit whitespace-nowrap bg-white text-black rounded-full font-black text-[10px] shadow-sm">
                                                {item.number}
                                              </span>
                                            ) : item.gameName.toLowerCase().includes('mega') ? (
                                              <span className="size-[22px] bg-[#d4af37] rounded-full shadow-sm"></span>
                                            ) : item.gameName.toLowerCase().includes('monsta') ? (
                                              <span className="size-[22px] bg-[#ef4444] rounded-full shadow-sm"></span>
                                            ) : (
                                              <span className="size-[22px] bg-neutral-600 rounded-full shadow-sm"></span>
                                            )}
                                            <span className="font-bold text-foreground truncate">{item.gameName}</span>
                                          </div>
                                          <span className="text-muted-foreground w-[25%] text-left font-medium">
                                            {time.includes(',') ? time.split(',')[1].trim() : formatDrawTimeToLocal(time).display.split(' ')[0]}
                                          </span>
                                          <span className="font-extrabold text-foreground w-[30%] text-right pr-5">
                                            $ {item.amount.toFixed(2)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-border/40 bg-[#0d0d0d] sm:rounded-b-2xl pb-safe">
                      <div className="flex justify-between items-center mb-4 px-1">
                        <span className="text-muted-foreground text-sm font-bold">Grand Total:</span>
                        <span className="font-black text-2xl text-green-400">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowCartModal(false)}
                          className="flex-1 h-[54px] border-primary/40 bg-primary/5 text-primary text-sm font-extrabold rounded-xl hover:bg-primary/20 hover:text-primary transition-colors"
                        >
                          + Add More
                        </Button>
                        <Button
                          disabled={cart.length === 0 || checkoutLoading}
                          onClick={() => {
                            setShowCartModal(false);
                            handleCheckout();
                          }}
                          className={`flex-[1.2] h-[54px] font-extrabold text-[15px] uppercase tracking-wider rounded-lg transition-all ${cart.length === 0 || checkoutLoading
                            ? 'bg-muted border border-border text-muted-foreground cursor-not-allowed'
                            : 'bg-[#468a35] hover:bg-[#3a7526] border border-white text-white shadow-sm'
                            }`}
                        >
                          {checkoutLoading ? 'Processing...' : 'Place Bets'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRIZE STRUCTURE */}
        {activeTab === 'prize' && (
          <Card className="bg-fortune-card border border-border/60">
            <CardContent className="p-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-6">Prize Payout Structure</h2>

              <div className="space-y-4">
                {(priceData?.gameDetails || lotteryData?.gameDetails) ? (
                  (priceData?.gameDetails || lotteryData?.gameDetails).map((game: any, idx: number) => {
                    const numStr = String(idx + 1).padStart(2, '0')

                    const payouts: { label?: string; value: any }[] = []
                    if (game.reverse_bet_amount !== undefined && game.reverse_bet_amount !== null) {
                      payouts.push({ label: 'Straight Match', value: game.bet_amount })
                      payouts.push({ label: 'Reverse / Mix Match', value: game.reverse_bet_amount })
                      if (game.single_bet_amount !== undefined && game.single_bet_amount !== null) {
                        payouts.push({ label: 'Single Digit Match', value: game.single_bet_amount })
                      }
                    } else {
                      payouts.push({ label: 'Straight Match', value: game.bet_amount })
                    }

                    return (
                      <div key={game.game_id} className="bg-background/40 border border-neutral-900 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-900/60 pb-3">
                          <div className="flex items-center gap-4">
                            <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-extrabold text-sm text-primary shrink-0">
                              {numStr}
                            </div>
                            <h4 className="font-extrabold text-base text-foreground">{game.game_name}</h4>
                          </div>
                          <span className="text-[10px] text-muted-foreground/60 uppercase font-black tracking-widest">Payout Details</span>
                        </div>

                        <div className="space-y-3">
                          {payouts.map((p, pIdx) => (
                            <div key={pIdx} className="flex justify-between items-center text-sm py-1 border-b border-border/5 last:border-b-0">
                              <span className="text-xs text-muted-foreground font-semibold">
                                {p.label}
                              </span>
                              <span className="font-extrabold text-primary">
                                Bet Amount x {p.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-4">No prize details available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* HOW TO PLAY */}
        {activeTab === 'how' && (
          <Card className="bg-fortune-card border border-border/60">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">How to Play {config.name}</h2>
              {howToPlayData ? (
                <div className="text-muted-foreground text-base whitespace-pre-wrap leading-relaxed">
                  {howToPlayData}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {[
                    { step: '01', title: 'Choose Numbers', desc: 'Select two distinct numbers from 01 to 36.', icon: <Hash className="size-4 text-primary" /> },
                    { step: '02', title: 'Select Draw Times', desc: 'Decide which draw times you want to play.', icon: <Clock className="size-4 text-primary" /> },
                    { step: '03', title: 'Choose Options & Bet', desc: 'Enter bet amount for Straight, Reverse, or Mix match.', icon: <Ticket className="size-4 text-primary" /> },
                  ].map((s) => (
                    <div key={s.step} className="p-5 border border-border rounded-xl bg-white/[0.02]">
                      <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                        {s.icon}
                      </div>
                      <h4 className="font-extrabold text-lg text-foreground mb-2">{s.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* SOLD OUT */}
        {activeTab === 'soldout' && (
          <Card className="bg-fortune-card border border-border/60">
            <CardContent className="p-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">Sold Out Numbers</h2>
              <p className="text-muted-foreground text-base mb-6">
                The following numbers have reached their limit for today and cannot accept any more bets.
              </p>

              <div className="mb-6 flex items-center gap-4">
                <span className="text-sm font-bold text-muted-foreground uppercase">Select Draw Time:</span>
                <select
                  value={selectedSoldOutTime}
                  onChange={(e) => setSelectedSoldOutTime(e.target.value)}
                  className="bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm font-semibold focus:outline-none focus:border-primary"
                >
                  <option value="">-- Choose Draw Time --</option>
                  {config.drawTimes.map((time: string) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              {soldOutList.length === 0 ? (
                <p className="text-muted-foreground text-sm italic">
                  {selectedSoldOutTime ? 'No sold out numbers for this draw time.' : 'Please select a draw time to view sold out numbers.'}
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {soldOutList.map((num) => (
                    <span
                      key={num}
                      className="px-4 py-2 border border-red-500/30 bg-red-500/5 text-red-400 font-bold rounded-xl text-sm"
                    >
                      #{num} (Draw: {selectedSoldOutTime})
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
