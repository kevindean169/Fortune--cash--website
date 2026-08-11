import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, X, Ticket, Clock, Hash, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useDateTimeCountdown } from '@/hooks/useDateTimeCountdown'
import { submitLotteryPurchase } from '@/lib/lotteryPurchase'
import { clampRemainingLimit, getCartHeldAmount } from '@/lib/betLimits'
import { RecentDrawsTab } from '@/components/RecentDrawsTab'

interface BetItem {
  id: number
  gameId?: string
  number: string
  gameName: string
  drawTime: string
  amount: number
  batchId?: string
}

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '/favicon.png'
  if (imagePath.startsWith('http')) return imagePath
  const baseUrl = (import.meta.env.VITE_API_URL || 'https://fortunescash.com').replace(/\/$/, '')
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
}

function formatDrawTimeToLocal(timeStr: string): { display: string; original: string } {
  if (!timeStr) return { display: '', original: '' };

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
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const dateIso = `${y}-${m}-${d}`;

  const dateStr = `${dateIso}T${cleanTime}-05:00`;
  const localDate = new Date(dateStr);

  if (isNaN(localDate.getTime())) {
    return { display: timeStr, original: timeStr };
  }

  const localTimeDisplay = localDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
  const localDateDisplay = localDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });

  return {
    display: `${localTimeDisplay} (${localDateDisplay})`,
    original: timeStr
  };
}

function isDrawTimePassed(timeStr: string): boolean {
  if (!timeStr) return false

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
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const dateIso = `${y}-${m}-${d}`;

  const dateStr = `${dateIso}T${cleanTime}-05:00`;
  const localDate = new Date(dateStr);

  if (isNaN(localDate.getTime())) {
    return false;
  }

  return new Date().getTime() > localDate.getTime();
}

import './LotteryPurchase.css';
export function CashpotPage() {
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
  const [soldOutList, setSoldOutList] = useState<any[]>([])
  const [megaballLimit, setMegaballLimit] = useState<any>(null)
  const [monstaballLimit, setMonstaballLimit] = useState<any>(null)
  const [selectedSoldOutTime, setSelectedSoldOutTime] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Flow states
  const [showNumberGrid, setShowNumberGrid] = useState<boolean>(false)
  const [selectedNumber, setSelectedNumber] = useState('')
  const [selectedDrawTimes, setSelectedDrawTimes] = useState<string[]>([])
  const [betAmounts, setBetAmounts] = useState<Record<string, string>>({}) // GameId -> Amount mapping
  const [amountInputWarnings, setAmountInputWarnings] = useState<Record<string, string>>({})
  const [cart, setCart] = useState<BetItem[]>([])
  const [payoutSuccess, setPayoutSuccess] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; isLoginRedirect?: boolean }>({ isOpen: false, message: '', isLoginRedirect: false })
  const showAlert = (message: string, isLoginRedirect = false) => setAlertModal({ isOpen: true, message, isLoginRedirect })
  const [editingGameAmount, setEditingGameAmount] = useState<string | null>(null)
  const [showCartModal, setShowCartModal] = useState(false)
  const [tempSelectedNumber, setTempSelectedNumber] = useState('')
  const [tempBetAmount, setTempBetAmount] = useState('')

  // Local configurations fallback
  const localConfig = {
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
            return !typeLower.includes('double') && !typeLower.includes('single') && !typeLower.includes('money time')
          })
          if (matched) {
            setLotteryId(String(matched.id))
          }
        }
      })
      .catch((err) => console.error('Failed to resolve lottery ID from list:', err))
  }, [urlId, accessToken])

  // 2. Fetch Lottery details (singlelottery, how-to-play, price) once ID is resolved
  const fetchLotteryData = useCallback(() => {
    if (!lotteryId) return

    setError(null)

    const headers: any = {
      'X-App-Key': import.meta.env.VITE_AUTH_API_KEY || 'c326d53a97bc32972cc7de9d4f03d27845efc9a81d8f1e7af347f3da42cbd52e',
    }
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const baseUrl = import.meta.env.VITE_API_URL || ''

    const safeFetchJson = (url: string, options?: any) =>
      fetch(url, options).then(async (res) => {
        const contentType = res.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json()
          if (!res.ok) throw new Error(data.message || `API error: ${res.status}`)
          return data
        }
        throw new Error(`Invalid API response (Status: ${res.status}). Expected JSON.`)
      })

    Promise.allSettled([
      safeFetchJson(`${baseUrl}/api/singlelottery/${lotteryId}`, { headers }),
      safeFetchJson(`${baseUrl}/api/how-to-play/${lotteryId}`, { headers }),
      safeFetchJson(`${baseUrl}/api/price/${lotteryId}`, { headers })
    ]).then(([singleRes, howRes, priceRes]) => {
      if (singleRes.status === 'fulfilled' && singleRes.value?.status === 'success' && singleRes.value.data) {
        setLotteryData(singleRes.value.data)
      } else if (singleRes.status === 'rejected') {
        console.error('Error fetching lottery details:', singleRes.reason)
        setError(singleRes.reason.message || 'An error occurred while loading lottery details.')
      } else {
        setError('Failed to fetch lottery details')
      }

      if (howRes.status === 'fulfilled' && howRes.value?.status === 'success' && howRes.value.data) {
        setHowToPlayData(howRes.value.data.howToPlay)
      }

      if (priceRes.status === 'fulfilled' && priceRes.value?.status === 'success' && priceRes.value.data) {
        setPriceData(priceRes.value.data)
      }
    }).finally(() => {
      setLoading(false)
    })
  }, [lotteryId, accessToken])

  useEffect(() => {
    if (lotteryId) {
      setLoading(true)
      fetchLotteryData()
    }
  }, [lotteryId, fetchLotteryData])

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
  const isNotStarted = lotteryData?.startDateTime ? new Date().getTime() < new Date(lotteryData.startDateTime).getTime() : false;
  const isExpired = lotteryData?.stopDateTime ? new Date().getTime() > new Date(lotteryData.stopDateTime).getTime() : false;
  const targetDate = isNotStarted ? lotteryData?.startDateTime : (lotteryData?.currentDrawUtc || lotteryData?.currentDraw);
  const [d, h, m, s] = useDateTimeCountdown(targetDate || '', () => fetchLotteryData())
  const showCross = isNotStarted || isExpired;



  // Tab State
  const [activeTab, setActiveTab] = useState<'buy' | 'prize' | 'how' | 'soldout'>('buy')

  // 3. Keep sold out draw selection aligned with the available schedule
  useEffect(() => {
    if (
      activeTab === 'soldout' &&
      config.drawTimes.length > 0 &&
      !config.drawTimes.includes(selectedSoldOutTime)
    ) {
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
      const cleanDrawTime = selectedSoldOutTime.includes(':')
        ? selectedSoldOutTime.split(':').slice(0, 2).join(':')
        : selectedSoldOutTime
      fetch(`${baseUrl}/api/sold-out-numbers/${lotteryId}?draw_time=${cleanDrawTime}`, { headers })
        .then(async (res) => {
          const contentType = res.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            return res.json()
          }
          throw new Error('Expected JSON response')
        })
        .then(resData => {
          if (resData.status === 'success' && Array.isArray(resData.data)) {
            setSoldOutList(resData.data)
            setMegaballLimit(resData.megaball !== undefined ? resData.megaball : null)
            setMonstaballLimit(resData.monstaball !== undefined ? resData.monstaball : null)
          } else {
            setSoldOutList([])
            setMegaballLimit(null)
            setMonstaballLimit(null)
          }
        })
        .catch(err => {
          console.error('Fetch sold out numbers error:', err)
          setSoldOutList([])
          setMegaballLimit(null)
          setMonstaballLimit(null)
        })
    }
  }, [activeTab, selectedSoldOutTime, lotteryId, accessToken])

  // Monitor draw times and remove passed ones
  useEffect(() => {
    const interval = setInterval(() => {
      const passedSelected = selectedDrawTimes.filter(time => isDrawTimePassed(time))
      const passedInCart = Array.from(new Set(
        cart.map(item => item.drawTime).filter(time => isDrawTimePassed(time))
      ))

      const allPassed = Array.from(new Set([...passedSelected, ...passedInCart]))

      if (allPassed.length > 0) {
        const displays = allPassed.map(t => formatDrawTimeToLocal(t).display.split(' (')[0]).join(', ')
        showAlert(`The following draw time(s) have passed: ${displays}. They have been removed from your selection and cart.`)

        setSelectedDrawTimes(prev => prev.filter(t => !allPassed.includes(t)))
        setCart(prev => prev.filter(item => !allPassed.includes(item.drawTime)))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedDrawTimes, cart])

  const toggleDrawTime = (time: string) => {
    setSelectedDrawTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    )
  }

  const getCashpotGameIds = () => {
    const cashpotGame = config.games.find((game: { id: string; name: string }) => game.name.toLowerCase().includes('cashpot'))
    const megaballGame = config.games.find((game: { id: string; name: string }) => game.name.toLowerCase().includes('mega'))
    const monstaballGame = config.games.find((game: { id: string; name: string }) => game.name.toLowerCase().includes('monsta'))

    return {
      cashpot: cashpotGame?.id,
      megaball: megaballGame?.id,
      monstaball: monstaballGame?.id,
    }
  }

  // getNumberWarning intentionally removed (unused)

  const getBetAmountWarning = (gameIdStr: string, amountStr: string): string | null => {
    if (!amountStr) return null
    const amountVal = parseFloat(amountStr)
    if (isNaN(amountVal) || amountVal <= 0) return 'Enter a valid amount.'

    const gameIds = getCashpotGameIds()
    const cashpotVal = parseFloat(betAmounts[gameIds.cashpot || ''] || '0')

    // Cant bet in Mega / Monsta without Cashpot first
    if ((gameIdStr === gameIds.megaball || gameIdStr === gameIds.monstaball) && cashpotVal <= 0) {
      return 'Must place a Cashpot bet first.'
    }

    // Mega / Monsta cannot be greater than Cashpot
    if (gameIdStr === gameIds.megaball && amountVal > cashpotVal) {
      return 'Cannot be greater than Cashpot bet.'
    }
    if (gameIdStr === gameIds.monstaball) {
      if (amountVal > cashpotVal) {
        return 'Cannot be greater than Cashpot bet.'
      }
      const megaVal = parseFloat(betAmounts[gameIds.megaball || ''] || '0')
      if (amountVal > megaVal) {
        return 'Cannot be greater than Megaball bet.'
      }
    }

    // Realtime Bet limit warning
    const limitInfo = getMinLimitForGame(gameIdStr)
    if (limitInfo.limit !== Infinity && amountVal > limitInfo.limit) {
      return `Exceeds limit of $${limitInfo.limit}${limitInfo.time ? ` for ${limitInfo.time}` : ''}`
    }

    return null
  }

  const getSelectedTicketNumber = () => {
    if (!selectedNumber) return ''
    return selectedNumber.toString().padStart(2, '0')
  }

  const getNumberSpecificLimit = (gameIdStr: string, time: string): number => {
    const ticketNumber = getSelectedTicketNumber()
    if (!ticketNumber) return Infinity

    const entries = Array.isArray(lotteryData?.remainingBetLimit) ? lotteryData.remainingBetLimit : []
    const matched = entries.filter((entry: any) =>
      String(entry?.game_id).trim() === gameIdStr &&
      String(entry?.draw_time).trim().toLowerCase() === String(time).trim().toLowerCase() &&
      String(entry?.ticket_number).trim() === ticketNumber
    )

    if (matched.length === 0) return Infinity

    const remaining = matched
      .map((entry: any) => Number(entry?.remaining_bet))
      .filter((value: number) => Number.isFinite(value))

    return remaining.length > 0 ? Math.min(...remaining) : Infinity
  }

  const getGameLimit = (gameIdStr: string, time: string): number => {
    const drawLimitDetails = Array.isArray(lotteryData?.betlimit) && lotteryData.betlimit.length > 0
      ? lotteryData.betlimit
      : Array.isArray(lotteryData?.drawDetails)
        ? lotteryData.drawDetails
        : []
    const detail = drawLimitDetails.find((d: any) => d.draw_time === time)
    if (!detail) return Infinity

    const gameIds = getCashpotGameIds()
    let baseLimit = Infinity
    if (gameIdStr === gameIds.cashpot) baseLimit = parseFloat(detail.cashpot_bet_limit || 'Infinity')
    if (gameIdStr === gameIds.megaball) baseLimit = parseFloat(detail.remaining_megaball_bet_limit || 'Infinity')
    if (gameIdStr === gameIds.monstaball) baseLimit = parseFloat(detail.remaining_monstaball_bet_limit || 'Infinity')

    const numberSpecificLimit = getNumberSpecificLimit(gameIdStr, time)
    if (Number.isFinite(numberSpecificLimit)) {
      baseLimit = numberSpecificLimit
    }

    const gameName = config.games.find((game: { id: string; name: string }) => game.id === gameIdStr)?.name
    const heldAmount = getCartHeldAmount(cart, gameIdStr, gameName, time, getSelectedTicketNumber())

    return clampRemainingLimit(baseLimit - heldAmount)
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

  const updateBetAmount = (gameId: string, value: string) => {
    if (!selectedNumber) {
      showAlert('Please select draw time(s) and bet number first.')
      return
    }
    if (value === '') {
      setBetAmounts(prev => ({ ...prev, [gameId]: '' }))
      setAmountInputWarnings(prev => ({ ...prev, [gameId]: '' }))
      return
    }

    const warning = getBetAmountWarning(gameId, value)
    if (warning) {
      setAmountInputWarnings(prev => ({ ...prev, [gameId]: warning }))
      return
    }

    setBetAmounts(prev => ({ ...prev, [gameId]: value }))
    setAmountInputWarnings(prev => ({ ...prev, [gameId]: '' }))
  }

  const handleAddAllBets = () => {
    if (!selectedNumber) { showAlert('Please select or enter Bet No. 1'); return }
    const val = parseInt(selectedNumber, 10)
    if (isNaN(val) || val < 1 || val > 36 || selectedNumber === '0' || selectedNumber === '00') {
      showAlert('For Cashpot, number must be between 01 and 36.')
      return
    }

    if (selectedDrawTimes.length === 0) { showAlert('Please select at least one draw time'); return }

    const gameIds = getCashpotGameIds()
    const cashpotVal = parseFloat(betAmounts[gameIds.cashpot || ''] || '0')
    const megaVal = parseFloat(betAmounts[gameIds.megaball || ''] || '0')
    const monstaVal = parseFloat(betAmounts[gameIds.monstaball || ''] || '0')

    if ((megaVal > 0 || monstaVal > 0) && cashpotVal <= 0) {
      showAlert('You cannot place bets on Megaball or Monstaball without placing a Cashpot bet first.')
      return
    }
    if (megaVal > cashpotVal) {
      showAlert('Megaball bet amount cannot be greater than the Cashpot bet amount.')
      return
    }
    if (monstaVal > cashpotVal) {
      showAlert('Monstaball bet amount cannot be greater than the Cashpot bet amount.')
      return
    }
    if (monstaVal > megaVal) {
      showAlert('Monstaball bet amount cannot be greater than the Megaball bet amount.')
      return
    }

    // Validate limits
    for (const game of config.games) {
      const amountStr = betAmounts[game.id] || ''
      const amountVal = parseFloat(amountStr)
      if (amountStr !== '' && !isNaN(amountVal) && amountVal > 0) {
        for (const time of selectedDrawTimes) {
          const limit = getGameLimit(game.id, time)
          if (amountVal > limit) {
            showAlert(`Cannot place bet. Bet amount of $${amountVal} for ${game.name} exceeds the remaining limit of $${limit} for draw time ${time}.`)
            return
          }
        }
      }
    }

    const numVal = selectedNumber.toString().padStart(2, '0')

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
            gameId: game.id,
            number: numVal,
            gameName: game.name,
            drawTime: time,
            amount: amountVal,
          })
        })
      }
    })

    if (!hasValidBet) {
      showAlert('Please enter a bet amount for at least one of the options');
      return
    }

    setCart(prev => [...prev, ...newBets])
    setAmountInputWarnings({})
    setEditingGameAmount(null)
    setBetAmounts({})
  }

  const handleClearData = () => {
    setSelectedNumber('')
    setSelectedDrawTimes([])
    setBetAmounts({})
    setShowNumberGrid(false)
    setShowNumberGrid(false)
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
    setCart(cart.filter(item => !((item.batchId || `batch-legacy-${item.number}`) === batchId && item.drawTime === drawTime)))
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.amount, 0)

  const handleCheckout = async () => {
    if (cart.length === 0 || !lotteryId || checkoutLoading) return

    if (!accessToken) {
      showAlert('You need to log in first to place your bets.', true)
      return
    }

    setCheckoutLoading(true)
    try {
      await submitLotteryPurchase({
        baseUrl: import.meta.env.VITE_API_URL || '',
        authBaseUrl: import.meta.env.VITE_AUTH_API_URL || '',
        accessToken,
        appKey: import.meta.env.VITE_AUTH_API_KEY || 'c326d53a97bc32972cc7de9d4f03d27845efc9a81d8f1e7af347f3da42cbd52e',
        lotteryId,
        cart,
        purchasePath: `/api/customer/purchase-lottery/${lotteryId}`,
        printStatusPath: '/api/customer/printstatus',
        walletGameId: config.type || config.name,
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
        handleClearData()
        setShowCartModal(false)
      }, 3000)
    } catch (err: any) {
      console.error('Purchase error:', err)
      const errMsg = err.message || 'An error occurred while submitting purchase request.'
      if (errMsg.toLowerCase().includes('token is required') || errMsg.toLowerCase().includes('unauthorized')) {
        showAlert('You need to log in first to place your bets.', true)
      } else {
        showAlert(errMsg)
      }
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="lottery-purchase-wrapper flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center bg-background p-4 text-center">
        <p className="text-red-400 font-semibold mb-4">{error}</p>
        <Button onClick={() => navigate('lotteries')} className="bet-add-btn-green text-white font-bold">
          Back to Lotteries
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-0 py-4 md:py-10">
      {/* Success Modal */}
      {payoutSuccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
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
            { id: 'recent', label: 'Recent Draws' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-bold border-2 transition-all whitespace-nowrap uppercase ${activeTab === tab.id
                ? 'lottery-tab-active-gold'
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
            {showCross ? (
              <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
                <div className="w-24 h-24 rounded-full border-2 border-red-500/50 flex items-center justify-center mb-6 bg-red-500/10">
                  <X className="size-12 text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">
                  {isNotStarted ? 'Lottery Not Started' : 'Lottery Closed'}
                </h2>
                <p className="text-muted-foreground text-sm max-w-sm text-center">
                  {isNotStarted
                    ? 'This lottery is not open for purchase yet. Please check back later.'
                    : 'This lottery has ended and is no longer available for purchase.'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden lg:grid grid-cols-3 gap-8">

                  {/* Play Area */}
                  <div className="lg:col-span-2 space-y-6">

                    {/* Draw Selector Slots */}
                    <Card className="lottery-card-container">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4 border-b border-border/40 pb-3">
                          <span className="px-3 py-1 bg-primary/10 border border-primary/30 text-primary font-extrabold text-xs rounded-lg uppercase tracking-wider">
                            Daily Schedule
                          </span>
                          <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-foreground font-extrabold text-xs rounded-lg">
                            {selectedDrawTimes.length.toString().padStart(2, '0')} Selected Draws
                          </span>
                        </div>

                        <h3 className="font-black text-2xl text-white mb-4">Select your Next Draw Slots</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {config.drawTimes.map((time: string) => {
                            const isSelected = selectedDrawTimes.includes(time)
                            const isPassed = isDrawTimePassed(time)
                            return (
                              <button
                                key={time}
                                type="button"
                                disabled={isPassed}
                                onClick={() => toggleDrawTime(time)}
                                className={`py-3.5 px-2 text-base font-bold rounded-xl border transition-all ${isPassed
                                    ? 'border-neutral-800 bg-neutral-950/50 text-muted-foreground/50 cursor-not-allowed'
                                    : isSelected
                                      ? 'border-primary bg-primary/15 text-primary shadow-[0_0_10px_rgba(224,172,44,0.15)]'
                                      : 'border-neutral-800 bg-[#0d0d0d] text-white/90 hover:border-primary/30 hover:text-white'
                                  }`}
                              >
                                {formatDrawTimeToLocal(time).display.split(' (')[0]}
                              </button>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pick Number Panel */}
                    <Card className="lottery-card-container">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-black text-2xl text-white">Pick your Bet Number</h3>
                            <p className="text-xs text-muted-foreground">Select a single lottery number to place bets on</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bet No.</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (selectedDrawTimes.length === 0) {
                                  showAlert('Please select draw time(s) first.')
                                  return
                                }
                                setShowNumberGrid(!showNumberGrid)
                              }}
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
                              {Array.from({ length: 36 }, (_, i) => String(i + 1).padStart(2, '0')).map((numStr) => {
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
                                      : 'border-neutral-800 bg-[#0d0d0d] text-white/90 hover:border-primary/50 hover:text-white'
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
                    <Card className="lottery-card-container">
                      <CardContent className="p-6">
                        <h3 className="font-black text-2xl text-white mb-4">ENTER YOUR BET AMOUNT</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {config.games.map((game: { id: string; name: string; defaultAmount: any; defaultAmountMonsta: any; presets: string[] }, index: number) => {
                            const amount = betAmounts[game.id] || ''
                            const warning = amountInputWarnings[game.id] || getBetAmountWarning(game.id, amount)
                            let isDisabled = false;
                            if (index > 0) {
                              const prevGameId = config.games[index - 1].id;
                              const prevAmount = parseFloat(betAmounts[prevGameId] || '0');
                              isDisabled = isNaN(prevAmount) || prevAmount <= 0;
                            }

                            return (
                              <div key={game.id} className={`bg-background/40 border border-neutral-900 rounded-2xl p-4 flex flex-col justify-between min-h-[220px] transition-all ${isDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
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
                                      onMouseDown={(e) => {
                                        if (!selectedNumber) {
                                          e.preventDefault()
                                          showAlert('Please select draw time(s) and bet number first.')
                                        }
                                      }}
                                      onChange={(e) => {
                                        let val = e.target.value;
                                        if (game.presets && game.presets.length > 0) {
                                          const maxAllowed = Math.max(...game.presets.map(Number));
                                          if (val !== '' && parseFloat(val) > maxAllowed) {
                                            val = maxAllowed.toString();
                                          }
                                        }
                                        updateBetAmount(game.id, val);
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
                                        onClick={() => updateBetAmount(game.id, val)}
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
                            className="clear-data-btn w-1/3"
                          >CLEAR DATA</Button>
                          <Button
                            type="button"
                            onClick={handleAddAllBets}
                            className="bet-add-btn-green w-2/3"
                          >
                            ADD BET +
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
                          <h3 className="font-black text-2xl text-white border-b border-border pb-3 mb-4">
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
                                            onClick={() => handleRemoveDrawFromBatch(group.batchId, time)}
                                            className="absolute right-1 top-1 z-10 text-muted-foreground/40 hover:text-red-400 transition-colors"
                                            title="Remove this draw"
                                          >
                                            <X className="size-3.5" />
                                          </button>
                                          {items.map(item => (
                                            <div key={item.id} className="flex items-center justify-between text-[11px] py-1.5 px-1">
                                              <div className="flex items-center gap-2.5 w-[45%]">
                                                {item.gameName.toLowerCase().includes('cashpot') ? (
                                                  <span className="flex items-center justify-center size-[22px] bg-white text-black rounded-full font-black text-[10px] shadow-sm">
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
                                                {formatDrawTimeToLocal(time).display.split(' (')[0]}
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
                            className={`w-full font-extrabold text-[15px] uppercase tracking-widest transition-all rounded-lg ${cart.length === 0 || checkoutLoading
                              ? 'bg-muted border border-border text-muted-foreground cursor-not-allowed'
                              : 'bet-add-btn-green'
                              }`}
                          >
                            {checkoutLoading ? 'Processing...' : 'PLACE BETS & CHECKOUT'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                </div>

                {/* Mobile Responsive Single Page View */}
                <div className="lg:hidden space-y-2 pb-36">
                  {/* Draws selection */}
                  <Card className="bg-fortune-card border border-border/60 py-3 gap-2">
                    <CardContent className="px-3 py-1">
                      <div className="flex justify-between items-center mb-1 pb-1 border-b border-border/40">
                        <span className="text-xs text-primary font-black uppercase tracking-wider">Draw Schedule</span>
                        <span className="text-base text-primary font-bold border border-primary px-2 py-0.5 rounded">{selectedDrawTimes.length} Selected</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {config.drawTimes.map((time: string) => {
                          const isSelected = selectedDrawTimes.includes(time)
                          const isPassed = isDrawTimePassed(time)
                          return (
                            <button
                              key={time}
                              type="button"
                              disabled={isPassed}
                              onClick={() => toggleDrawTime(time)}
                              className={`py-2 px-1 text-base font-bold rounded-lg border text-center transition-all ${isPassed
                                  ? 'border-neutral-800 bg-neutral-950/50 text-muted-foreground/50 cursor-not-allowed'
                                  : isSelected
                                    ? 'border-primary bg-primary/15 text-primary'
                                    : 'border-neutral-800 bg-[#0d0d0d] text-white/90'
                                }`}
                            >
                              {formatDrawTimeToLocal(time).display.split(' (')[0]}
                            </button>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pick Number */}
                  <Card className="bg-fortune-card border border-border/60 py-3 gap-2">
                    <CardContent className="px-3 py-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="lottery-heading-white shrink-0 w-1/2">PICK YOUR BET<br />NUMBER</h3>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedDrawTimes.length === 0) {
                              showAlert('Please select draw time(s) first.')
                              return
                            }
                            setTempSelectedNumber(selectedNumber)
                            setShowNumberGrid(!showNumberGrid)
                          }}
                          className="flex-1 px-3 py-2.5 flex items-center justify-between transition-all min-w-0 selected-number-dropdown"
                        >
                          <span className={`truncate ${selectedNumber ? 'text-primary font-extrabold' : 'text-muted-foreground'}`}>
                            {selectedNumber ? `#${selectedNumber}` : 'Select Number'}
                          </span>
                          {showNumberGrid ? <ChevronUp className="size-4 shrink-0 ml-2" /> : <ChevronDown className="size-4 shrink-0 ml-2" />}
                        </button>
                      </div>

                      {showNumberGrid && (
                        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                          <div className="bg-fortune-card border border-border/60 rounded-2xl w-full max-w-sm p-6 flex flex-col relative animate-fadeIn">
                            <h3 className="font-black text-2xl text-white mb-4">Pick your Bet Number</h3>
                            <div className="grid grid-cols-6 gap-1.5 mb-6 max-h-[50vh] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-neutral-800">
                              {Array.from({ length: 36 }, (_, i) => String(i + 1).padStart(2, '0')).map((numStr) => {
                                const isSelected = tempSelectedNumber === numStr
                                return (
                                  <button
                                    key={numStr}
                                    type="button"
                                    onClick={() => setTempSelectedNumber(numStr)}
                                    className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm border transition-all ${isSelected
                                      ? 'border-primary bg-primary text-primary-foreground font-black shadow-[0_0_15px_rgba(224,172,44,0.3)] scale-105'
                                      : 'border-neutral-800 bg-[#0d0d0d] text-white/90 hover:border-primary/50 hover:text-white'
                                      }`}
                                  >
                                    {numStr}
                                  </button>
                                )
                              })}
                            </div>
                            <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-border/40">
                              <Button variant="outline" onClick={() => setShowNumberGrid(false)} className="border-neutral-800 bg-transparent text-muted-foreground hover:bg-neutral-900 rounded-xl">Cancel</Button>
                              <Button onClick={() => { setSelectedNumber(tempSelectedNumber); setShowNumberGrid(false); }} className="bet-add-btn-green text-fortune-navy font-bold rounded-xl gold-glow hover:opacity-90">Done</Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Enter Bet Amounts */}
                  <Card className="bg-fortune-card border border-border/60 py-3 gap-2">
                    <CardContent className="px-3 py-1 space-y-1">
                      <h3 className="font-extrabold text-sm text-foreground">ENTER YOUR BET AMOUNT</h3>
                      <div className="grid grid-cols-3 gap-2">
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
                                  type="text"
                                  inputMode="none"
                                  readOnly
                                  placeholder="0.00"
                                  value={amount}
                                  disabled={isDisabled}
                                  onClick={(e) => {
                                    if (!isDisabled) {
                                      e.preventDefault();
                                      if (!selectedNumber) {
                                        showAlert('Please select draw time(s) and bet number first.');
                                        return;
                                      }
                                      setTempBetAmount(betAmounts[game.id] || '');
                                      setEditingGameAmount(game.id);
                                    }
                                  }}
                                  className={`bg-transparent w-full outline-none text-sm font-bold cursor-pointer ${isDisabled ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground'}`}
                                />
                              </div>
                              <button
                                type="button"
                                disabled={isDisabled}
                                onClick={() => {
                                  if (!selectedNumber) {
                                    showAlert('Please select draw time(s) and bet number first.')
                                    return
                                  }
                                  setTempBetAmount(betAmounts[game.id] || '')
                                  setEditingGameAmount(game.id)
                                }}
                                className={`rounded-md py-1.5 text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${isDisabled
                                  ? 'add-sub-btn-disabled'
                                  : 'add-sub-btn-gold'}`}
                              >+ ADD</button>
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
                        className="clear-data-btn w-1/3"
                      >CLEAR DATA</Button>
                      <Button
                        type="button"
                        onClick={handleAddAllBets}
                        className="bet-add-btn-green w-2/3"
                      >
                        ADD BET +
                      </Button>
                    </div>

                    <Button
                      onClick={() => setShowCartModal(true)}
                      className="total-bets-btn-black w-full"
                    >
                      Total Bets View ({groupedCart.length})
                    </Button>
                  </div>

                  {/* Custom Amount Pad Popup */}
                  {editingGameAmount && (
                    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-fortune-card border border-border/60 rounded-3xl w-full max-w-[300px] p-5 flex flex-col relative animate-fadeIn shadow-2xl">
                        {(() => {
                          const popupWarning = getBetAmountWarning(editingGameAmount, tempBetAmount)
                          return (
                            <>
                              <h3 className="font-extrabold text-base text-foreground mb-0.5 tracking-wide">
                                {config.games.find((g: any) => g.id === editingGameAmount)?.name}
                              </h3>
                              <p className="text-muted-foreground text-[10px] mb-3">Enter the Amount</p>

                              <div className="bg-[#0d0d0d] border border-primary/30 rounded-xl px-4 py-3 text-lg font-bold text-primary mb-4 flex items-center shadow-inner relative">
                                <span className="text-primary/70 mr-2">$</span>
                                {tempBetAmount || '0.00'}
                                {popupWarning && (
                                  <p className="absolute -bottom-5 left-0 text-red-400 text-[9px] font-semibold">{popupWarning}</p>
                                )}
                              </div>

                              <div className="flex gap-2 mb-4 mt-2">
                                {config.games.find((g: any) => g.id === editingGameAmount)?.presets.map((val: string) => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setTempBetAmount(val)}
                                    className="px-3 py-1.5 bg-[#0d0d0d] border border-primary/30 text-foreground font-bold rounded-lg text-[10px] hover:border-primary transition-colors"
                                  >
                                    $ {val}
                                  </button>
                                ))}
                              </div>

                              {(() => {
                                const handleKeypadPress = (val: string) => {
                                  let newVal = tempBetAmount;
                                  if (val === 'clear') {
                                    newVal = '';
                                  } else if (val === '.') {
                                    if (!newVal.includes('.')) newVal += '.';
                                  } else {
                                    newVal += val;
                                  }
                                  
                                  const game = config.games.find((g: any) => g.id === editingGameAmount);
                                  if (game?.presets && game.presets.length > 0) {
                                    const maxAllowed = Math.max(...game.presets.map(Number));
                                    if (newVal !== '' && parseFloat(newVal) > maxAllowed) {
                                      newVal = maxAllowed.toString();
                                    }
                                  }
                                  setTempBetAmount(newVal);
                                };
                                
                                return (
                                  <div className="grid grid-cols-4 gap-1.5 mb-5">
                                    {/* Row 1 */}
                                    <button onClick={() => handleKeypadPress('1')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">1</button>
                                    <button onClick={() => handleKeypadPress('2')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">2</button>
                                    <button onClick={() => handleKeypadPress('3')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">3</button>
                                    <button onClick={() => handleKeypadPress('.')} className="bg-transparent border border-neutral-800 rounded-xl text-2xl font-bold text-foreground py-3 row-span-2 hover:bg-neutral-900 transition-colors">.</button>

                                    {/* Row 2 */}
                                    <button onClick={() => handleKeypadPress('4')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">4</button>
                                    <button onClick={() => handleKeypadPress('5')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">5</button>
                                    <button onClick={() => handleKeypadPress('6')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">6</button>

                                    {/* Row 3 */}
                                    <button onClick={() => handleKeypadPress('7')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">7</button>
                                    <button onClick={() => handleKeypadPress('8')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">8</button>
                                    <button onClick={() => handleKeypadPress('9')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">9</button>
                                    <button onClick={() => handleKeypadPress('clear')} className="bg-transparent border border-neutral-800 rounded-xl text-xs font-bold text-red-400 py-3 row-span-2 hover:bg-neutral-900 transition-colors">Clear</button>

                                    {/* Row 4 */}
                                    <button onClick={() => handleKeypadPress('0')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 col-span-3 hover:bg-neutral-900 transition-colors">0</button>
                                  </div>
                                );
                              })()}

                              <div className="flex justify-between items-center gap-3">
                                <button type="button" onClick={() => setEditingGameAmount(null)} className="w-1/2 bg-transparent text-muted-foreground text-xs hover:text-foreground font-extrabold pb-1">Cancel</button>
                                <button type="button" onClick={() => { updateBetAmount(editingGameAmount, tempBetAmount); setEditingGameAmount(null); }} className="w-1/2 bet-add-btn-green text-fortune-navy text-sm font-bold py-3.5 rounded-xl gold-glow transition-all">Done</button>
                              </div>
                            </>
                          )
                        })()}
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
                                            onClick={() => handleRemoveDrawFromBatch(group.batchId, time)}
                                            className="absolute right-1 top-1 z-10 text-muted-foreground/40 hover:text-red-400 transition-colors"
                                            title="Remove this draw"
                                          >
                                            <X className="size-3.5" />
                                          </button>
                                          {items.map(item => (
                                            <div key={item.id} className="flex items-center justify-between text-[11px] py-1.5 px-1">
                                              <div className="flex items-center gap-2.5 w-[45%]">
                                                {item.gameName.toLowerCase().includes('cashpot') ? (
                                                  <span className="flex items-center justify-center size-[22px] bg-white text-black rounded-full font-black text-[10px] shadow-sm">
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
                                                {formatDrawTimeToLocal(time).display.split(' (')[0]}
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
                                handleCheckout();
                              }}
                              className={`flex-[1.2] h-[54px] font-extrabold text-[15px] uppercase tracking-wider rounded-lg transition-all ${cart.length === 0 || checkoutLoading
                                ? 'bg-muted border border-border text-muted-foreground cursor-not-allowed'
                                : 'bet-add-btn-green'
                                }`}
                            >
                              {checkoutLoading ? 'Processing...' : 'PLACE BETS'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* PRIZE STRUCTURE */}
        {activeTab === 'prize' && (
          <Card className="lottery-card-container">
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
                      payouts.push({ label: 'Standard Match', value: game.bet_amount })
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
          <Card className="lottery-card-container">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">How to Play {config.name}</h2>
              {howToPlayData ? (
                <div 
                  className="text-muted-foreground text-base whitespace-pre-wrap leading-relaxed how-to-play-content"
                  dangerouslySetInnerHTML={{ __html: howToPlayData }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {[
                    { step: '01', title: 'Choose Numbers', desc: 'Select a single number from 01 to 36. Use grid selections.', icon: <Hash className="size-4 text-primary" /> },
                    { step: '02', title: 'Select Draw Times', desc: 'Decide which draw times you want to play. You can select one, multiple, or all draws for the day.', icon: <Clock className="size-4 text-primary" /> },
                    { step: '03', title: 'Choose Options & Bet', desc: 'Pick a bet type (e.g. Cashpot, Megaball) and enter your bet amount. Add the bet card and check out!', icon: <Ticket className="size-4 text-primary" /> },
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
        {activeTab === 'recent' && (
          <RecentDrawsTab lotteryId={lotteryId || '1'} />
        )}

        {activeTab === 'soldout' && (
          <Card className="lottery-card-container">
            <CardContent className="p-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">Number & Game Limits</h2>
              <p className="text-muted-foreground text-base mb-6">
                View the remaining bet limits for each number and game mode for the selected draw time.
              </p>

              <div className="mb-8 flex items-center gap-4">
                <span className="text-sm font-bold text-muted-foreground uppercase">Select Draw Time:</span>
                <select
                  value={selectedSoldOutTime}
                  onChange={(e) => setSelectedSoldOutTime(e.target.value)}
                  className="bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm font-semibold focus:outline-none focus:border-primary"
                >
                  <option value="">-- Choose Draw Time --</option>
                  {config.drawTimes.map((time: string) => (
                    <option key={time} value={time}>{formatDrawTimeToLocal(time).display}</option>
                  ))}
                </select>
              </div>

              {!selectedSoldOutTime ? (
                <p className="text-muted-foreground text-sm italic">
                  Please select a draw time to view number and game limits.
                </p>
              ) : soldOutList.length === 0 ? (
                <p className="text-muted-foreground text-sm italic">
                  No limit data found for this draw time.
                </p>
              ) : (
                <div className="space-y-8 animate-fadeIn">
                  {/* Game Mode Limits */}
                  {((megaballLimit !== undefined && megaballLimit !== null) || (monstaballLimit !== undefined && monstaballLimit !== null)) && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Special Bet Limits</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {megaballLimit !== undefined && megaballLimit !== null && (
                          <div className="p-4 border border-border rounded-xl bg-white/[0.02] flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-sm text-foreground">Megaball Bet Limit</h4>
                              <p className="text-[10px] text-muted-foreground">Remaining amount allowed</p>
                            </div>
                            <span className={`px-3 py-1 font-bold rounded-lg text-xs border ${megaballLimit === 'Sold Out' || Number(megaballLimit) <= 0
                                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                                : 'border-green-500/30 bg-green-500/10 text-green-400'
                              }`}>
                              {megaballLimit === 'Sold Out' || Number(megaballLimit) <= 0 ? 'SOLD OUT' : `$${megaballLimit}`}
                            </span>
                          </div>
                        )}
                        {monstaballLimit !== undefined && monstaballLimit !== null && (
                          <div className="p-4 border border-border rounded-xl bg-white/[0.02] flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-sm text-foreground">Monstaball Bet Limit</h4>
                              <p className="text-[10px] text-muted-foreground">Remaining amount allowed</p>
                            </div>
                            <span className={`px-3 py-1 font-bold rounded-lg text-xs border ${monstaballLimit === 'Sold Out' || Number(monstaballLimit) <= 0
                                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                                : 'border-green-500/30 bg-green-500/10 text-green-400'
                              }`}>
                              {monstaballLimit === 'Sold Out' || Number(monstaballLimit) <= 0 ? 'SOLD OUT' : `$${monstaballLimit}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Numbers Grid */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Number Bet Limits</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {soldOutList.map((item: any) => {
                        const isSoldOut = item.remaining_bet === 'Sold Out' || Number(item.remaining_bet) <= 0;
                        return (
                          <div
                            key={item.ticket_number}
                            className={`p-3 border rounded-xl flex flex-col items-center justify-between text-center transition-all bg-[#0a0a0a] ${isSoldOut
                                ? 'border-red-500/30 hover:border-red-500/50'
                                : 'border-border/60 hover:border-primary/40'
                              }`}
                          >
                            <span className={`text-base font-black ${isSoldOut ? 'text-red-400' : 'text-foreground'}`}>
                              #{item.ticket_number}
                            </span>
                            <span className={`text-xs font-bold mt-1.5 ${isSoldOut ? 'text-red-400/90' : 'text-primary'
                              }`}>
                              {isSoldOut ? 'SOLD OUT' : `$${item.remaining_bet}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>

      {alertModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <Card className="max-w-sm w-full bg-fortune-card border border-primary/30 rounded-2xl overflow-hidden shadow-2xl animate-fadeIn">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center mx-auto text-primary text-xl">
                ℹ
              </div>
              <p className="text-foreground text-sm font-semibold leading-relaxed">
                {alertModal.message}
              </p>
              {alertModal.isLoginRedirect ? (
                <div className="flex gap-3 w-full">
                  <Button
                    type="button"
                    onClick={() => setAlertModal({ isOpen: false, message: '', isLoginRedirect: false })}
                    variant="outline"
                    className="flex-1 py-2.5 border-neutral-800 text-muted-foreground font-bold rounded-xl hover:bg-neutral-900"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setAlertModal({ isOpen: false, message: '', isLoginRedirect: false });
                      navigate('login');
                    }}
                    className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all gold-glow"
                  >
                    Login
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={() => setAlertModal({ isOpen: false, message: '', isLoginRedirect: false })}
                  className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all gold-glow"
                >
                  OK
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
