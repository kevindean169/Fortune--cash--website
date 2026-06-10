import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, X, Ticket, Clock, Hash, ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useDateTimeCountdown } from '@/hooks/useDateTimeCountdown'
import { submitLotteryPurchase } from '@/lib/lotteryPurchase'

interface BetItem {
  id: number
  number: string
  gameName: string
  drawTime: string
  apiDrawTime?: string
  amount: number
}

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '/favicon.png'
  if (imagePath.startsWith('http')) return imagePath
  return `https://staging.fortunescash.com${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
}

export function MoneyTimePage() {
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
  const [showNumberGrid, setShowNumberGrid] = useState<boolean>(false)
  const [selectedNumber, setSelectedNumber] = useState('')
  const [selectedDrawTimes, setSelectedDrawTimes] = useState<string[]>([])
  const [betAmounts, setBetAmounts] = useState<Record<string, string>>({}) // GameId -> Amount mapping
  const [cart, setCart] = useState<BetItem[]>([])
  const [payoutSuccess, setPayoutSuccess] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  // Money Time Slot Modal States
  const [moneyTimeDraws, setMoneyTimeDraws] = useState<any[]>([])
  const [isDrawModalOpen, setIsDrawModalOpen] = useState<boolean>(false)
  const [tempSelectedDrawTimes, setTempSelectedDrawTimes] = useState<string[]>([])
  const [activeHourTab, setActiveHourTab] = useState<string>('')

  // Local configurations fallback
  const localConfig = {
    name: 'Money Time',
    type: 'Cashpot Money Time',
    range: 36,
    isGrid: true,
    betOptions: [
      { id: '6', name: 'Cashpot Money Time', rate: '26x payout' },
    ],
    drawTimes: ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'],
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
            return typeLower.includes('money time')
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

  // Fetch Money Time draws
  useEffect(() => {
    if (!lotteryId) return

    const headers: any = {
      'X-App-Key': import.meta.env.VITE_AUTH_API_KEY || 'c326d53a97bc32972cc7de9d4f03d27845efc9a81d8f1e7af347f3da42cbd52e',
    }
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const baseUrl = import.meta.env.VITE_API_URL || ''
    fetch(`${baseUrl}/api/lotteryDraws/${lotteryId}`, { headers })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data) {
          const drawsArray = Array.isArray(data.data) ? data.data : (Array.isArray(data.data.draws) ? data.data.draws : []);
          setMoneyTimeDraws(drawsArray)
        }
      })
      .catch(err => console.error('Failed to fetch money time draws:', err))
  }, [lotteryId])

  // Dynamic config construction
  const config = {
    name: lotteryData?.name || localConfig.name,
    type: lotteryData?.type || localConfig.type,
    range: 36,
    isGrid: true,
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

  const groups = getMoneyTimeGroups()
  useEffect(() => {
    if (groups.length > 0 && !activeHourTab) {
      setActiveHourTab((groups[0] as { key: string }).key)
    }
  }, [groups, activeHourTab])

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
      fetch(`${baseUrl}/api/cashpotMoney-sold-out-numbers/${lotteryId}?draw_time=${selectedSoldOutTime}`, { headers })
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

  function parseJamaicaDrawDate(dateTimeStr: string): Date {
    if (!dateTimeStr) return new Date(NaN);
    let cleaned = dateTimeStr.trim();
    if (cleaned.endsWith('Z') || /[\+\-]\d{2}:?\d{2}$/.test(cleaned) || cleaned.includes('GMT')) {
      return new Date(cleaned);
    }
    if (cleaned.includes(' ')) {
      cleaned = cleaned.replace(' ', 'T');
    }
    return new Date(cleaned + '-05:00');
  }

  function getMoneyTimeGroups() {
    if (!Array.isArray(moneyTimeDraws) || moneyTimeDraws.length === 0) return [];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const isNewFormat = moneyTimeDraws[0] && ('datetime' in moneyTimeDraws[0] || 'draws' in moneyTimeDraws[0]);

    if (isNewFormat) {
      return moneyTimeDraws.map((slot: any) => {
        if (!slot.datetime || !Array.isArray(slot.draws)) return null;

        const tIndex = slot.datetime.indexOf('T');
        if (tIndex === -1) return null;

        const datePart = slot.datetime.substring(0, tIndex);

        const slotDate = parseJamaicaDrawDate(slot.datetime);
        const localSlotHour = slotDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
        const localSlotDateLabel = `${String(slotDate.getDate()).padStart(2, '0')} ${months[slotDate.getMonth()]} ${slotDate.getFullYear()}`;
        const label = `${localSlotDateLabel}, ${localSlotHour}`;
        const key = slot.datetime;

        const parsedDraws = slot.draws.map((d: any) => {
          let drawDateTimeStr = d.draw_time;
          if (!drawDateTimeStr.includes('-') && !drawDateTimeStr.includes('T')) {
            drawDateTimeStr = `${datePart}T${drawDateTimeStr}`;
          }
          const drawDate = parseJamaicaDrawDate(drawDateTimeStr);
          const drawDisplayTime = drawDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
          const localDrawDateLabel = `${String(drawDate.getDate()).padStart(2, '0')} ${months[drawDate.getMonth()]} ${drawDate.getFullYear()}`;
          const fullTime = `${localDrawDateLabel}, ${drawDisplayTime}`;

          return {
            id: d.draw_no || d.timestamp || Math.random(),
            time: drawDisplayTime,
            fullTime: fullTime,
            apiDrawTime: d.draw_time,
            raw: d
          };
        });

        return {
          key,
          label,
          draws: parsedDraws
        };
      }).filter(Boolean);
    }

    // Old format fallback:
    const sortedDraws = [...moneyTimeDraws]
      .filter(d => d.draw_date && d.draw_time)
      .sort((a, b) => {
        const datetimeA = `${a.draw_date}T${a.draw_time}`;
        const datetimeB = `${b.draw_date}T${b.draw_time}`;
        return datetimeA.localeCompare(datetimeB);
      });

    const groups: { key: string; label: string; draws: any[] }[] = [];

    sortedDraws.forEach(draw => {
      const drawDate = parseJamaicaDrawDate(`${draw.draw_date}T${draw.draw_time}`);
      const drawMs = drawDate.getTime();

      let foundGroup = false;
      if (groups.length > 0) {
        const lastGroup = groups[groups.length - 1];
        const startDraw = lastGroup.draws[0].raw;
        const startDrawDate = parseJamaicaDrawDate(`${startDraw.draw_date}T${startDraw.draw_time}`);
        const startMs = startDrawDate.getTime();

        if (drawMs >= startMs && drawMs < startMs + 60 * 60 * 1000) {
          foundGroup = true;
          const displayTime = drawDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
          const dateLabel = `${String(drawDate.getDate()).padStart(2, '0')} ${months[drawDate.getMonth()]} ${drawDate.getFullYear()}`;
          lastGroup.draws.push({
            id: draw.id,
            time: displayTime,
            fullTime: `${dateLabel}, ${displayTime}`,
            apiDrawTime: draw.draw_time,
            raw: draw
          });
        }
      }

      if (!foundGroup) {
        const displayTime = drawDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateLabel = `${String(drawDate.getDate()).padStart(2, '0')} ${months[drawDate.getMonth()]} ${drawDate.getFullYear()}`;
        const label = `${dateLabel}, ${displayTime}`;
        const key = `${draw.draw_date}_${draw.draw_time}`;

        groups.push({
          key,
          label,
          draws: [{
            id: draw.id,
            time: displayTime,
            fullTime: `${dateLabel}, ${displayTime}`,
            apiDrawTime: draw.draw_time,
            raw: draw
          }]
        });
      }
    });

    return groups;
  }

  // getNumberWarning intentionally removed (unused)

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
    if (gameIdStr === '6') return parseFloat(detail.cashpot_bet_limit || 'Infinity')
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

  const handleAddBetOption = (gameId: string) => {
    if (!selectedNumber) { alert('Please select or enter Bet No. 1'); return }
    const valid = selectedNumber === '0' || selectedNumber === '00' || (parseInt(selectedNumber, 10) >= 1 && parseInt(selectedNumber, 10) <= 36)
    if (!valid) {
      alert('For Money Time, number must be 0, 00, or between 01 and 36.')
      return
    }

    if (selectedDrawTimes.length === 0) { alert('Please select at least one draw time'); return }

    const amountStr = betAmounts[gameId] || ''
    const amountVal = parseFloat(amountStr)
    if (amountStr === '' || isNaN(amountVal) || amountVal <= 0) {
      alert('Please enter or select a valid bet amount');
      return
    }

    // Validate limit
    for (const time of selectedDrawTimes) {
      const limit = getGameLimit(gameId, time)
      if (amountVal > limit) {
        alert(`Cannot place bet. Bet amount of $${amountVal} exceeds the remaining limit of $${limit} for draw time ${time}.`)
        return
      }
    }

    const game = config.games.find((g: { id: string }) => g.id === gameId)
    if (!game) return

    const numVal = (selectedNumber === '0' || selectedNumber === '00') ? selectedNumber : selectedNumber.toString().padStart(2, '0')

    const newBets: BetItem[] = []
    selectedDrawTimes.forEach((time) => {
      const currentGroups = getMoneyTimeGroups();
      let apiDrawTime = '';
      for (const g of currentGroups) {
        const found = g?.draws?.find((d: any) => d.fullTime === time);
        if (found) {
          apiDrawTime = found.apiDrawTime || found.raw.draw_time;
          break;
        }
      }

      newBets.push({
        id: Date.now() + Math.random(),
        number: numVal,
        gameName: game.name,
        drawTime: time,
        apiDrawTime: apiDrawTime,
        amount: amountVal,
      })
    })

    setCart([...cart, ...newBets])
    setBetAmounts(prev => ({ ...prev, [gameId]: '' }))
  }

  const handleAddAllBets = () => {
    if (!selectedNumber) { alert('Please select or enter Bet No. 1'); return }
    const valid = selectedNumber === '0' || selectedNumber === '00' || (parseInt(selectedNumber, 10) >= 1 && parseInt(selectedNumber, 10) <= 36)
    if (!valid) {
      alert('For Money Time, number must be 0, 00, or between 01 and 36.')
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

    const numVal = (selectedNumber === '0' || selectedNumber === '00') ? selectedNumber : selectedNumber.toString().padStart(2, '0')

    const newBets: BetItem[] = []
    let hasValidBet = false

    config.games.forEach((game: { id: string; name: string; presets: string[] }) => {
      const amountStr = betAmounts[game.id] || ''
      const amountVal = parseFloat(amountStr)
      if (amountStr !== '' && !isNaN(amountVal) && amountVal > 0) {
        hasValidBet = true
        selectedDrawTimes.forEach((time) => {
          const currentGroups = getMoneyTimeGroups();
          let apiDrawTime = '';
          for (const g of currentGroups) {
            const found = g?.draws?.find((d: any) => d.fullTime === time);
            if (found) {
              apiDrawTime = found.apiDrawTime || found.raw.draw_time;
              break;
            }
          }

          newBets.push({
            id: Date.now() + Math.random(),
            number: numVal,
            gameName: game.name,
            drawTime: time,
            apiDrawTime: apiDrawTime,
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
    // Reset inputs
    setSelectedNumber('')
    setSelectedDrawTimes([])
    setBetAmounts({})
    setShowNumberGrid(false)
  }

  const handleClearData = () => {
    setSelectedNumber('')
    setSelectedDrawTimes([])
    setBetAmounts({})
    setShowNumberGrid(false)
  }

  const handleRemoveBet = (betId: number) => setCart(cart.filter((b) => b.id !== betId))
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
        purchasePath: `/api/customer/purchase-cashpot-lottery/${lotteryId}`,
        printStatusPath: '/api/customer/printstatus-cashpot-money',
        getGameId: (item) => {
          const game = config.games.find((g: { id: string; name: string }) => g.name === item.gameName)
          return game?.id || '1'
        },
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
        <Card className="bg-fortune-card border border-border/60 mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 blur-3xl rounded-full" />
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate('lotteries')}
                className="size-12 bg-background border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shrink-0"
              >
                <ArrowLeft className="size-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl bg-background/50 border border-primary/20 p-2 flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={getImageUrl(lotteryData?.image)}
                    alt={config.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground uppercase tracking-wide">{config.name}</h1>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                    Type: <span className="text-primary font-bold">{config.type}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Countdown Blocks */}
            <div className="flex flex-col items-start md:items-end">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1.5 pl-0.5">
                Next Draw In
              </p>
              <div className="flex gap-2">
                {[{ v: d, l: 'Day' }, { v: h, l: 'Hour' }, { v: m, l: 'Minute' }, { v: s, l: 'Second' }].map((t) => (
                  <div key={t.l} className="flex flex-col items-center">
                    <div className="w-12 h-10 rounded border border-neutral-800 flex items-center justify-center bg-black/60 mb-1 shadow-inner">
                      <span className="font-extrabold text-sm text-white tabular-nums">{t.v}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{t.l}</span>
                  </div>
                ))}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

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
                  <div>
                    <Button
                      type="button"
                      onClick={() => {
                        setTempSelectedDrawTimes(selectedDrawTimes)
                        setIsDrawModalOpen(true)
                      }}
                      className="w-full py-4 bg-primary text-primary-foreground font-extrabold rounded-xl hover:bg-primary/95 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(224,172,44,0.1)]"
                    >
                      <Clock className="size-4" />
                      Select Draw Times
                    </Button>
                    
                    {selectedDrawTimes.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 max-h-[120px] overflow-y-auto p-1 bg-background/50 border border-neutral-900 rounded-xl">
                        {selectedDrawTimes.map(time => (
                          <span 
                            key={time} 
                            className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary font-bold text-xs rounded-lg flex items-center gap-1.5"
                          >
                            {time}
                            <button 
                              type="button"
                              onClick={() => setSelectedDrawTimes(prev => prev.filter(t => t !== time))}
                              className="text-primary/70 hover:text-primary transition-colors font-black text-xs"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pick Number Panel */}
              <Card className="bg-fortune-card border border-border/60">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-extrabold text-lg text-foreground">Pick your Bet Number</h3>
                      <p className="text-xs text-muted-foreground">Select a single lottery number to place bets on</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bet No.</span>
                      <button
                        type="button"
                        onClick={() => setShowNumberGrid(!showNumberGrid)}
                        className="min-w-[160px] bg-background border border-border hover:border-primary/40 px-4 py-3 rounded-xl flex items-center justify-between font-bold text-sm text-foreground transition-all"
                      >
                        <span className={selectedNumber ? 'text-primary' : 'text-muted-foreground'}>
                          {selectedNumber ? `#${selectedNumber}` : 'Select Bet Number'}
                        </span>
                        {showNumberGrid ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {showNumberGrid && (
                    <div className="mt-6 pt-6 border-t border-border/40 animate-fadeIn">
                      <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 max-h-[300px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-neutral-800">
                        {/* 0, 00 and 01-36 */}
                        {['0', '00', ...Array.from({ length: 36 }, (_, i) => String(i + 1).padStart(2, '0'))].map((numStr) => {
                          const isSelected = selectedNumber === numStr
                          return (
                            <button
                              key={numStr}
                              type="button"
                              onClick={() => {
                                setSelectedNumber(numStr)
                                setShowNumberGrid(false)
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

                          <Button
                            type="button"
                            onClick={() => handleAddBetOption(game.id)}
                            className="w-full mt-4 py-2 text-xs font-bold uppercase tracking-wider border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl"
                          >
                            + Add
                          </Button>
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
                      Total Bets View ({cart.length})
                    </h3>

                    {cart.length === 0 ? (
                      <div className="text-center py-12 flex flex-col items-center justify-center">
                        <Ticket className="size-12 text-primary/60 mb-3" />
                        <p className="text-muted-foreground text-sm font-semibold">No bets added to card yet.</p>
                        <p className="text-xs text-muted-foreground/50 mt-1">Configure options on the left and click "Add Bet".</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {cart.map((item) => (
                          <div key={item.id} className="p-3 bg-[#0a0a0a] border border-border rounded-xl flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-primary text-sm">#{item.number}</span>
                                <span className="text-[10px] text-muted-foreground px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-full font-bold">
                                  {item.gameName}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Draw: {item.drawTime}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-black text-sm text-foreground">${item.amount.toFixed(2)}</span>
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
                    if (game.bet_amount_monsta !== undefined && game.bet_amount_monsta !== null) {
                      payouts.push({ label: 'Without Mega', value: game.bet_amount })
                      payouts.push({ label: 'With Mega', value: game.bet_amount_monsta })
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
                            <div key={pIdx} className="flex justify-between items-start gap-4 text-sm py-1 border-b border-border/5 last:border-b-0">
                              <span className="text-xs text-muted-foreground font-semibold shrink-0">
                                {p.label}
                              </span>
                              <span className="font-extrabold text-primary text-right break-all">
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
                    { step: '01', title: 'Choose Numbers', desc: 'Select 0, 00, or 01 to 36. Use grid selections.', icon: <Hash className="size-4 text-primary" /> },
                    { step: '02', title: 'Select Draw Times', desc: 'Decide which draw times you want to play.', icon: <Clock className="size-4 text-primary" /> },
                    { step: '03', title: 'Choose Options & Bet', desc: 'Pick a bet type and enter your bet amount.', icon: <Ticket className="size-4 text-primary" /> },
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
                The following numbers have reached their draw limit and cannot accept bets.
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

      {/* Draw Times Selector Modal for Money Time */}
      {isDrawModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <Card className="max-w-md w-full bg-[#0d111b] border border-[#1e293b] shadow-2xl rounded-2xl overflow-hidden">
            <CardContent className="p-6 md:p-8 space-y-6">
              
              {/* Header: Title and Select All */}
              <div className="flex justify-between items-center border-b border-border/20 pb-4">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white tracking-wide">Select Draw Times</span>
                </div>
                
                {/* Select All Toggle Switch */}
                {activeHourTab && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Select All</span>
                    <button
                      type="button"
                      onClick={() => {
                        const activeGroup = groups.find((g: { key: string } | null) => g?.key === activeHourTab) as { draws: { fullTime: string }[] } | undefined;
                        const activeFullTimes = activeGroup?.draws.map((d: { fullTime: string }) => d.fullTime) || [];
                        const isAllSelected = activeFullTimes.length > 0 && activeFullTimes.every((ft: string) => tempSelectedDrawTimes.includes(ft));
                        
                        if (isAllSelected) {
                          setTempSelectedDrawTimes(prev => prev.filter((ft: string) => !activeFullTimes.includes(ft)));
                        } else {
                          setTempSelectedDrawTimes(prev => {
                            const next = [...prev];
                            activeFullTimes.forEach((ft: string) => {
                              if (!next.includes(ft)) next.push(ft);
                            });
                            return next;
                          });
                        }
                      }}
                      className={`w-11 h-6 rounded-full transition-all relative outline-none flex items-center ${
                        activeHourTab && (groups.find((g: { key: string } | null) => g?.key === activeHourTab) as { draws: { fullTime: string }[] } | undefined)?.draws.map((d: { fullTime: string }) => d.fullTime).every((ft: string) => tempSelectedDrawTimes.includes(ft))
                          ? 'bg-[#0073ec]'
                          : 'bg-neutral-800 border border-neutral-700'
                      }`}
                    >
                      <span 
                        className={`absolute size-4.5 rounded-full bg-white transition-all shadow-md ${
                          activeHourTab && (groups.find((g: { key: string } | null) => g?.key === activeHourTab) as { draws: { fullTime: string }[] } | undefined)?.draws.map((d: { fullTime: string }) => d.fullTime).every((ft: string) => tempSelectedDrawTimes.includes(ft))
                            ? 'left-[22px]'
                            : 'left-1'
                        }`} 
                      />
                    </button>
                  </div>
                )}
              </div>

              {/* Hour Selection Slots (Horizontal Scroll) */}
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-neutral-800">
                {groups.map((group: { key: string; label: string; draws: any[] } | null) => {
                  if (!group) return null;
                  const isActive = activeHourTab === group.key;
                  return (
                    <button
                      key={group.key}
                      type="button"
                      onClick={() => setActiveHourTab(group.key)}
                      className={`px-4 py-3 text-xs font-semibold rounded-lg border whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-[#0073ec] border-[#0073ec] text-white shadow-lg'
                          : 'bg-[#131722] border-[#222e47] text-muted-foreground hover:border-[#33466d] hover:text-white'
                      }`}
                    >
                      {group.label}
                    </button>
                  );
                })}
              </div>

              {/* Draws Grid */}
              <div className="max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
                <div className="grid grid-cols-4 gap-2">
                  {(groups.find((g: { key: string } | null) => g?.key === activeHourTab) as { draws: any[] } | undefined)?.draws.map((draw: any) => {
                    const isSelected = tempSelectedDrawTimes.includes(draw.fullTime);
                    return (
                      <button
                        key={draw.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setTempSelectedDrawTimes(prev => prev.filter(ft => ft !== draw.fullTime));
                          } else {
                            setTempSelectedDrawTimes(prev => [...prev, draw.fullTime]);
                          }
                        }}
                        className={`py-2.5 text-xs font-semibold rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#1e2d4a] border-[#0073ec] text-white'
                            : 'bg-[#131722]/50 border-neutral-800 text-muted-foreground hover:border-[#1e2d4a] hover:text-white'
                        }`}
                      >
                        {draw.time}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-4 border-t border-border/20 pt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDrawModalOpen(false)}
                  className="flex-1 py-3 border-neutral-800 bg-transparent text-muted-foreground text-xs font-bold uppercase rounded-xl hover:bg-neutral-900"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedDrawTimes(tempSelectedDrawTimes);
                    setIsDrawModalOpen(false);
                  }}
                  className="flex-1 py-3 bg-[#0073ec] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#0062c9]"
                >
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
