import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Clock, Trash2, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useDateTimeCountdown } from '@/hooks/useDateTimeCountdown'
import { LotterySkeleton } from '@/components/LotterySkeleton'
import { formatUsd } from '@/lib/currency'

interface BetRow {
  id: string
  pickType: 3 | 4
  number: string
  gameId: number
  gameName: string
  drawTimes: string[]
  amount: number
  total: number
}

const getManualPickBaseUrl = () => {
  return (import.meta.env.VITE_MANUAL_PICK_API_URL || 'http://localhost/manual-pick').replace(/\/$/, '')
}

function formatDrawTimeToLocal(timeStr: string): { display: string; timeOnly: string; original: string } {
  if (!timeStr) return { display: '', timeOnly: '', original: '' }

  let cleanTime = timeStr.trim()
  if (/[AP]M/i.test(cleanTime)) {
    const parts = cleanTime.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i)
    if (parts) {
      let hrs = parseInt(parts[1], 10)
      const mins = parts[2]
      const ampm = parts[3].toUpperCase()
      if (ampm === 'PM' && hrs < 12) hrs += 12
      if (ampm === 'AM' && hrs === 12) hrs = 0
      cleanTime = `${String(hrs).padStart(2, '0')}:${mins}:00`
    }
  }

  if (cleanTime.split(':').length === 2) {
    cleanTime += ':00'
  }

  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  const dateIso = `${y}-${m}-${d}`

  // Admin 2 draw times are stored in Jamaica / EST timezone (UTC-5)
  const dateStr = `${dateIso}T${cleanTime}-05:00`
  const localDate = new Date(dateStr)

  if (isNaN(localDate.getTime())) {
    return { display: timeStr, timeOnly: timeStr, original: timeStr }
  }

  const localTimeDisplay = localDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()
  const localDateDisplay = localDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })

  return {
    display: `${localTimeDisplay} (${localDateDisplay})`,
    timeOnly: localTimeDisplay,
    original: timeStr,
  }
}

function getNextDrawTarget(lotteryData: any): string {
  if (!lotteryData) return ''

  const drawTimes: string[] = lotteryData.drawDetails?.map((d: any) => d.draw_time) || []
  if (drawTimes.length > 0) {
    const now = new Date()
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    const dateIso = `${y}-${m}-${d}`

    for (const timeStr of drawTimes) {
      let cleanTime = timeStr.trim()
      if (cleanTime.split(':').length === 2) {
        cleanTime += ':00'
      }
      const slotDate = new Date(`${dateIso}T${cleanTime}-05:00`)
      if (!isNaN(slotDate.getTime()) && slotDate.getTime() > now.getTime()) {
        return slotDate.toISOString()
      }
    }

    const firstTime = (drawTimes[0] || '00:00').trim()
    const cleanFirst = firstTime.split(':').length === 2 ? `${firstTime}:00` : firstTime
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const ty = tomorrow.getFullYear()
    const tm = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const td = String(tomorrow.getDate()).padStart(2, '0')
    const tomorrowSlot = new Date(`${ty}-${tm}-${td}T${cleanFirst}-05:00`)
    return tomorrowSlot.toISOString()
  }

  const currentDraw = lotteryData.currentDrawUtc || lotteryData.currentDraw
  if (currentDraw) {
    return currentDraw
  }

  return ''
}

export function PickLotteryPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlLotteryId = searchParams.get('id')
  const { user, accessToken, walletBalance, fetchWallet } = useAuth()

  // Tab selection
  const [activeTab, setActiveTab] = useState<'buy' | 'prize' | 'how-to-play' | 'sold-out' | 'recent-draws'>('buy')

  // Lottery Data states
  const [lotteryId, setLotteryId] = useState<string>(urlLotteryId || '')
  const [lotteryData, setLotteryData] = useState<any>(null)
  const [howToPlayData, setHowToPlayData] = useState<string>('')
  const [priceData, setPriceData] = useState<any>(null)
  const [recentDraws, setRecentDraws] = useState<any[]>([])
  const [soldOutNumbers, setSoldOutNumbers] = useState<string[]>([])
  const [soldOutLoading, setSoldOutLoading] = useState<boolean>(false)
  const [selectedSoldOutDrawTime, setSelectedSoldOutDrawTime] = useState<string>('')

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Selection states
  const [selectedDrawTimes, setSelectedDrawTimes] = useState<string[]>([])
  const [pickType, setPickType] = useState<3 | 4>(3) // Pick 3 or Pick 4
  const [betNumber, setBetNumber] = useState<string>('')

  // 2x2 Bet Amount inputs
  const [straightBet, setStraightBet] = useState<string>('')
  const [boxBet, setBoxBet] = useState<string>('')
  const [megaballBet, setMegaballBet] = useState<string>('')
  const [monstaballBet, setMonstaballBet] = useState<string>('')

  // Cart / Added Bets
  const [cart, setCart] = useState<BetRow[]>([])
  const [showBetsModal, setShowBetsModal] = useState<boolean>(false)
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false)
  const [payoutSuccess, setPayoutSuccess] = useState<boolean>(false)
  const [successOrderNo, setSuccessOrderNo] = useState<string | null>(null)
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; isLoginRedirect?: boolean }>({
    isOpen: false,
    message: '',
  })

  const showAlert = (message: string, isLoginRedirect = false) => {
    setAlertModal({ isOpen: true, message, isLoginRedirect })
  }

  // Dynamic countdown target
  const countdownTarget = useMemo(() => getNextDrawTarget(lotteryData), [lotteryData])
  const [d, h, m, s] = useDateTimeCountdown(countdownTarget)

  // 1. Resolve Lottery ID from Admin 2 if not in URL
  useEffect(() => {
    if (urlLotteryId) {
      setLotteryId(urlLotteryId)
      return
    }

    const manualPickUrl = getManualPickBaseUrl()
    fetch(`${manualPickUrl}/api/customer/lotteries`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
          setLotteryId(String(data.data[0].id))
        }
      })
      .catch((err) => console.error('Failed to load manual-pick lotteries:', err))
  }, [urlLotteryId])

  // 2. Fetch all lottery details from Admin 2 APIs
  const fetchLotteryDetails = useCallback(() => {
    if (!lotteryId) return
    setError(null)
    const manualPickUrl = getManualPickBaseUrl()

    Promise.allSettled([
      fetch(`${manualPickUrl}/api/customer/singlelottery/${lotteryId}`).then((r) => r.json()),
      fetch(`${manualPickUrl}/api/customer/how-to-play/${lotteryId}`).then((r) => r.json()),
      fetch(`${manualPickUrl}/api/customer/price/${lotteryId}`).then((r) => r.json()),
      fetch(`${manualPickUrl}/api/customer/recent-draws/${lotteryId}?per_page=15`).then((r) => r.json()),
    ])
      .then(([singleRes, howRes, priceRes, drawsRes]) => {
        if (singleRes.status === 'fulfilled' && singleRes.value?.status === 'success') {
          const lData = singleRes.value.data
          setLotteryData(lData)
          if (lData?.drawDetails?.length > 0 && !selectedSoldOutDrawTime) {
            setSelectedSoldOutDrawTime(lData.drawDetails[0].draw_time)
          }
        } else {
          const reason = singleRes.status === 'rejected' ? singleRes.reason?.message : singleRes.value?.message
          setError(reason || 'Failed to load lottery data from Admin 2.')
        }

        if (howRes.status === 'fulfilled' && howRes.value?.status === 'success') {
          setHowToPlayData(howRes.value.data?.how_to_play || '')
        }

        if (priceRes.status === 'fulfilled' && priceRes.value?.status === 'success') {
          setPriceData(priceRes.value.data)
        }

        if (drawsRes.status === 'fulfilled' && drawsRes.value?.status === 'success') {
          setRecentDraws(drawsRes.value.data || [])
        }
      })
      .catch((err) => {
        console.error(err)
        setError('Error connecting to game service.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [lotteryId, selectedSoldOutDrawTime])

  useEffect(() => {
    if (lotteryId) {
      setLoading(true)
      fetchLotteryDetails()
    }
  }, [lotteryId, fetchLotteryDetails])

  // 3. Draw times list and auto-select for Sold Out tab
  const drawTimesList: string[] = useMemo(() => {
    return lotteryData?.drawDetails?.map((d: any) => d.draw_time) || []
  }, [lotteryData])

  useEffect(() => {
    if (activeTab === 'sold-out' && drawTimesList.length > 0 && !selectedSoldOutDrawTime) {
      setSelectedSoldOutDrawTime(drawTimesList[0])
    }
  }, [activeTab, drawTimesList, selectedSoldOutDrawTime])

  const currentDrawDetail = useMemo(() => {
    return lotteryData?.drawDetails?.find((d: any) => d.draw_time === selectedSoldOutDrawTime)
  }, [lotteryData, selectedSoldOutDrawTime])

  // 4. Fetch Sold Out Numbers (reusable callback)
  const fetchSoldOutNumbers = useCallback((drawTime?: string) => {
    if (!lotteryId) return
    const targetTime = drawTime || selectedSoldOutDrawTime || drawTimesList[0]
    if (!targetTime) return
    const manualPickUrl = getManualPickBaseUrl()
    setSoldOutLoading(true)
    fetch(`${manualPickUrl}/api/customer/sold-out-numbers/${lotteryId}?draw_time=${encodeURIComponent(targetTime)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setSoldOutNumbers(data.data || [])
        }
      })
      .catch((err) => console.error('Failed to load sold out numbers:', err))
      .finally(() => setSoldOutLoading(false))
  }, [lotteryId, selectedSoldOutDrawTime, drawTimesList])

  // Trigger sold out fetch when draw time or tab changes
  useEffect(() => {
    if (activeTab === 'sold-out' && selectedSoldOutDrawTime) {
      fetchSoldOutNumbers(selectedSoldOutDrawTime)
    }
  }, [activeTab, selectedSoldOutDrawTime, fetchSoldOutNumbers])

  // Real-time number & bet limits state from Admin 2
  const [numberBetLimits, setNumberBetLimits] = useState<Record<string, {
    number: string
    remaining_bet: number
    p3_mega: number
    p3_monsta: number
    p4_mega: number
    p4_monsta: number
  }>>({})

  // Fetch real-time remaining limit when a valid number is entered
  useEffect(() => {
    const trimmed = betNumber.trim()
    const expectedLen = pickType === 3 ? 3 : 4
    if (!lotteryId || selectedDrawTimes.length === 0 || trimmed.length !== expectedLen || !/^\d+$/.test(trimmed)) {
      return
    }

    const manualPickUrl = getManualPickBaseUrl()
    selectedDrawTimes.forEach((time) => {
      const cacheKey = `${time}_${trimmed}`
      fetch(`${manualPickUrl}/api/customer/remaining-bet-limit/${lotteryId}?draw_time=${encodeURIComponent(time)}&number=${trimmed}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'success' && data.data) {
            setNumberBetLimits((prev) => ({
              ...prev,
              [cacheKey]: {
                number: trimmed,
                remaining_bet: parseFloat(data.data.remaining_bet) || 0,
                p3_mega: parseFloat(data.data.p3_remaining_megaball_bet_limit) || 0,
                p3_monsta: parseFloat(data.data.p3_remaining_monstaball_bet_limit) || 0,
                p4_mega: parseFloat(data.data.p4_remaining_megaball_bet_limit) || 0,
                p4_monsta: parseFloat(data.data.p4_remaining_monstaball_bet_limit) || 0,
              },
            }))
          }
        })
        .catch((err) => console.error('Failed to fetch remaining limit:', err))
    })
  }, [lotteryId, selectedDrawTimes, betNumber, pickType])

  // Helper to compute remaining limit for a game type and draw slot
  const getGameRemainingLimit = useCallback((
    gameType: 'straight' | 'box' | 'mega' | 'monsta',
    drawTime: string,
    num?: string
  ): number => {
    const detail = lotteryData?.drawDetails?.find((d: any) => d.draw_time === drawTime)
    if (!detail) return Infinity

    const trimmedNum = (num || betNumber).trim()
    const key = `${drawTime}_${trimmedNum}`
    const numberData = numberBetLimits[key]

    if (gameType === 'straight' || gameType === 'box') {
      let baseLimit = Infinity
      if (numberData !== undefined && numberData.remaining_bet !== undefined) {
        baseLimit = numberData.remaining_bet
      } else {
        baseLimit = pickType === 3
          ? parseFloat(detail.p3_straight_bet_limit || '0')
          : parseFloat(detail.p4_straight_bet_limit || '0')
      }
      const gameId = gameType === 'straight' ? 1 : 2
      const held = cart
        .filter((c) => c.drawTimes.includes(drawTime) && c.number === trimmedNum && c.gameId === gameId)
        .reduce((sum, c) => sum + c.amount, 0)
      return Math.max(0, baseLimit - held)
    }

    if (gameType === 'mega') {
      const megaLimit = pickType === 3
        ? (numberData ? numberData.p3_mega : parseFloat(detail.p3_remaining_megaball_bet_limit || '0'))
        : (numberData ? numberData.p4_mega : parseFloat(detail.p4_remaining_megaball_bet_limit || '0'))
      const held = cart
        .filter((c) => c.drawTimes.includes(drawTime) && c.gameId === 3)
        .reduce((sum, c) => sum + c.amount, 0)
      return Math.max(0, megaLimit - held)
    }

    if (gameType === 'monsta') {
      const monstaLimit = pickType === 3
        ? (numberData ? numberData.p3_monsta : parseFloat(detail.p3_remaining_monstaball_bet_limit || '0'))
        : (numberData ? numberData.p4_monsta : parseFloat(detail.p4_remaining_monstaball_bet_limit || '0'))
      const held = cart
        .filter((c) => c.drawTimes.includes(drawTime) && c.gameId === 4)
        .reduce((sum, c) => sum + c.amount, 0)
      return Math.max(0, monstaLimit - held)
    }

    return Infinity
  }, [lotteryData, betNumber, numberBetLimits, pickType, cart])

  // Get minimum remaining limit across selected draw slots
  const getMinRemainingLimit = useCallback((
    gameType: 'straight' | 'box' | 'mega' | 'monsta'
  ): { limit: number; time: string } => {
    if (selectedDrawTimes.length === 0) {
      const firstTime = drawTimesList[0] || ''
      return { limit: firstTime ? getGameRemainingLimit(gameType, firstTime) : Infinity, time: firstTime }
    }
    let minLimit = Infinity
    let minTime = selectedDrawTimes[0]
    for (const time of selectedDrawTimes) {
      const lim = getGameRemainingLimit(gameType, time)
      if (lim < minLimit) {
        minLimit = lim
        minTime = time
      }
    }
    return { limit: minLimit, time: minTime }
  }, [selectedDrawTimes, drawTimesList, getGameRemainingLimit])

  // Toggle Draw Time selection
  const toggleDrawTime = (time: string) => {
    setSelectedDrawTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    )
  }

  // Clear inputs
  const handleClearData = () => {
    setBetNumber('')
    setStraightBet('')
    setBoxBet('')
    setMegaballBet('')
    setMonstaballBet('')
  }

  // Add Bet Row with strict validation against remaining limits
  const handleAddBet = () => {
    if (selectedDrawTimes.length === 0) {
      showAlert('Please select at least one Draw Slot time.')
      return
    }

    const trimmedNum = betNumber.trim()
    const expectedLen = pickType === 3 ? 3 : 4

    if (!trimmedNum || trimmedNum.length !== expectedLen || !/^\d+$/.test(trimmedNum)) {
      showAlert(`Please enter a valid ${expectedLen}-digit number for Pick ${pickType}.`)
      return
    }

    const straight = parseFloat(straightBet) || 0
    const box = parseFloat(boxBet) || 0
    const mega = parseFloat(megaballBet) || 0
    const monsta = parseFloat(monstaballBet) || 0

    if (straight <= 0 && box <= 0 && mega <= 0 && monsta <= 0) {
      showAlert('Please enter an amount for at least one bet type (Straight, Box, Megaball, or Monstaball).')
      return
    }

    // Check sold out
    const isSoldOut = selectedDrawTimes.some((dt) => soldOutNumbers.includes(trimmedNum))
    if (isSoldOut) {
      showAlert(`Number ${trimmedNum} is currently sold out for one or more selected draw times. Please select another number.`)
      return
    }

    // Require main bet before Megaball or Monstaball
    if ((mega > 0 || monsta > 0) && straight <= 0 && box <= 0) {
      showAlert('You cannot place bets on Megaball or Monstaball without placing a Straight or Box bet first.')
      return
    }
    if (mega > (straight + box)) {
      showAlert(`Megaball bet amount ($${mega}) cannot be greater than the main bet amount ($${straight + box}).`)
      return
    }
    if (monsta > (straight + box)) {
      showAlert(`Monstaball bet amount ($${monsta}) cannot be greater than the main bet amount ($${straight + box}).`)
      return
    }

    // Validate Straight limits
    if (straight > 0) {
      for (const time of selectedDrawTimes) {
        const lim = getGameRemainingLimit('straight', time, trimmedNum)
        if (straight > lim) {
          const displayTime = formatDrawTimeToLocal(time).timeOnly || time
          showAlert(`Cannot place bet. Bet amount of $${straight} for Straight exceeds the remaining limit of $${lim.toFixed(2)} for draw time ${displayTime}.`)
          return
        }
      }
    }

    // Validate Box limits
    if (box > 0) {
      for (const time of selectedDrawTimes) {
        const lim = getGameRemainingLimit('box', time, trimmedNum)
        if (box > lim) {
          const displayTime = formatDrawTimeToLocal(time).timeOnly || time
          showAlert(`Cannot place bet. Bet amount of $${box} for Box exceeds the remaining limit of $${lim.toFixed(2)} for draw time ${displayTime}.`)
          return
        }
      }
    }

    // Validate Megaball limits
    if (mega > 0) {
      for (const time of selectedDrawTimes) {
        const lim = getGameRemainingLimit('mega', time, trimmedNum)
        if (mega > lim) {
          const displayTime = formatDrawTimeToLocal(time).timeOnly || time
          showAlert(`Cannot place bet. Bet amount of $${mega} for Megaball exceeds the remaining limit of $${lim.toFixed(2)} for draw time ${displayTime}.`)
          return
        }
      }
    }

    // Validate Monstaball limits
    if (monsta > 0) {
      for (const time of selectedDrawTimes) {
        const lim = getGameRemainingLimit('monsta', time, trimmedNum)
        if (monsta > lim) {
          const displayTime = formatDrawTimeToLocal(time).timeOnly || time
          showAlert(`Cannot place bet. Bet amount of $${monsta} for Monstaball exceeds the remaining limit of $${lim.toFixed(2)} for draw time ${displayTime}.`)
          return
        }
      }
    }

    const newRows: BetRow[] = []
    const slotsCount = selectedDrawTimes.length

    if (straight > 0) {
      newRows.push({
        id: `${Date.now()}-1`,
        pickType,
        number: trimmedNum,
        gameId: 1,
        gameName: 'Straight',
        drawTimes: [...selectedDrawTimes],
        amount: straight,
        total: straight * slotsCount,
      })
    }
    if (box > 0) {
      newRows.push({
        id: `${Date.now()}-2`,
        pickType,
        number: trimmedNum,
        gameId: 2,
        gameName: 'Box',
        drawTimes: [...selectedDrawTimes],
        amount: box,
        total: box * slotsCount,
      })
    }
    if (mega > 0) {
      newRows.push({
        id: `${Date.now()}-3`,
        pickType,
        number: trimmedNum,
        gameId: 3,
        gameName: 'Megaball',
        drawTimes: [...selectedDrawTimes],
        amount: mega,
        total: mega * slotsCount,
      })
    }
    if (monsta > 0) {
      newRows.push({
        id: `${Date.now()}-4`,
        pickType,
        number: trimmedNum,
        gameId: 4,
        gameName: 'Monstaball',
        drawTimes: [...selectedDrawTimes],
        amount: monsta,
        total: monsta * slotsCount,
      })
    }

    setCart((prev) => [...prev, ...newRows])
    handleClearData()
  }

  // Remove item from cart
  const handleRemoveBet = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  // Total cart amount
  const grandTotal = cart.reduce((sum, item) => sum + item.total, 0)

  // Submit Purchase to Admin 2
  const handlePurchase = async () => {
    if (!user || !accessToken) {
      showAlert('Please login to place bets.', true)
      return
    }

    if (cart.length === 0) {
      showAlert('Your bet cart is empty. Please add at least one bet.')
      return
    }

    if (walletBalance < grandTotal) {
      showAlert(`Insufficient wallet balance. You need ${formatUsd(grandTotal)}, but your balance is ${formatUsd(walletBalance)}.`)
      return
    }

    setCheckoutLoading(true)
    try {
      const manualPickUrl = getManualPickBaseUrl()

      const groups: Record<string, {
        number: string
        pickType: number
        drawTimes: Set<string>
        games: { gameId: number; amount: number }[]
      }> = {}

      cart.forEach((item) => {
        const key = `${item.pickType}-${item.number}`
        if (!groups[key]) {
          groups[key] = {
            number: item.number,
            pickType: item.pickType,
            drawTimes: new Set(),
            games: [],
          }
        }
        item.drawTimes.forEach((t) => groups[key].drawTimes.add(t))
        groups[key].games.push({ gameId: item.gameId, amount: item.amount })
      })

      const resultPayload = Object.values(groups).map((grp) => ({
        lottery_id: parseInt(lotteryId, 10),
        pick_type: grp.pickType,
        number: grp.number,
        draw_time: Array.from(grp.drawTimes),
        game_id: grp.games.map((g) => g.gameId),
        amount: grp.games.map((g) => g.amount),
      }))

      // Step 1: Submit Purchase
      const appKey = import.meta.env.VITE_AUTH_API_KEY || '3f8a178ff8b15c4255dfa95cc85b41b29ff5fec509f8f56ce5bb1529ea8ab794'
      const purchaseRes = await fetch(`${manualPickUrl}/api/customer/purchase-lottery/${lotteryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'X-App-Key': appKey,
        },
        body: JSON.stringify({ result: resultPayload }),
      })

      const purchaseData = await purchaseRes.json()

      if (!purchaseRes.ok || purchaseData.status !== 'success') {
        throw new Error(purchaseData.message || 'Failed to place lottery bets.')
      }

      const orderNo = purchaseData.data?.order_no
      if (!orderNo) {
        throw new Error('Order number was not returned from purchase.')
      }

      // Step 2: Confirm Order & Apply Bet Limits in Admin 2
      const printRes = await fetch(`${manualPickUrl}/api/customer/printstatus/${orderNo}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'X-App-Key': appKey,
        },
      })
      const printData = await printRes.json().catch(() => null)
      if (!printRes.ok || printData?.status !== 'success') {
        console.warn('Print status warning:', printData?.message)
      }

      // Step 3: Central Wallet Debit (unified across customer site)
      const authBaseUrl = import.meta.env.VITE_AUTH_API_URL || ''
      if (authBaseUrl) {
        const debitPayload = {
          amount: Number(grandTotal.toFixed(2)),
          gameId: 'lachica-bigpot',
          idempotencyKey: `purchase-${Date.now()}`,
          metadata: {
            multiplier: 1.0,
            type: 'purchase',
            message: 'LaChica BIGPOT Purchased successfully',
            order_id: String(orderNo),
            lottery_id: String(lotteryId),
          },
        }

        try {
          const debitRes = await fetch(`${authBaseUrl.replace(/\/$/, '')}/games/wallet/debit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
              'X-App-Key': appKey,
            },
            body: JSON.stringify(debitPayload),
          })
          const debitData = await debitRes.json().catch(() => null)
          const transactionId = debitData?.data?.transactionId
          const debitAmount = debitData?.data?.amount

          // Step 4: Record Central Transaction Log in Admin 1
          const admin1BaseUrl = import.meta.env.VITE_API_URL || ''
          const customerId = user?.id || ''
          if (admin1BaseUrl && customerId && transactionId) {
            const adminLogUrl = `${admin1BaseUrl.replace(/\/$/, '')}/api/customer/store-transaction-bet/${customerId}?amount=${debitAmount || grandTotal}&trx=${transactionId}`
            await fetch(adminLogUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-App-Key': appKey,
              },
            }).catch(() => null)
          }
        } catch (debitErr) {
          console.warn('Central wallet debit check:', debitErr)
        }
      }

      // Step 5: Refresh user wallet balance
      await fetchWallet()

      // Step 6: Show success modal, reset cart and refresh data
      setSuccessOrderNo(String(orderNo))
      setPayoutSuccess(true)
      setCart([])
      setShowBetsModal(false)
      fetchLotteryDetails()
      fetchSoldOutNumbers()
    } catch (err: any) {
      console.error('Purchase error:', err)
      showAlert(err.message || 'An error occurred during purchase.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-8 max-w-7xl mx-auto px-4">
        <LotterySkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center bg-background p-8 text-center min-h-[50vh]">
        <p className="text-red-400 font-semibold mb-4">{error}</p>
        <Button onClick={() => navigate('/lotteries')} className="gold-gradient text-white font-bold">
          Back to Lotteries
        </Button>
      </div>
    )
  }

  const lotteryImage = lotteryData?.image || '/lachica_bigpot.png'
  const lotteryName = lotteryData?.name || 'LaChica BIGPOT'
  const scheduleType = lotteryData?.schedule?.toUpperCase() || 'DAILY'

  // Extract real dynamic price/multiplier data for Pick 3 and Pick 4
  const pick3Prices = priceData?.gameDetails?.[3] || lotteryData?.gameDetails?.[3] || []
  const pick4Prices = priceData?.gameDetails?.[4] || lotteryData?.gameDetails?.[4] || []

  const currentPrices = pickType === 3 ? pick3Prices : pick4Prices
  const straightGame = currentPrices.find((g: any) => g.game_id === 1)
  const boxGame = currentPrices.find((g: any) => g.game_id === 2)
  const megaballGame = currentPrices.find((g: any) => g.game_id === 3)
  const monstaballGame = currentPrices.find((g: any) => g.game_id === 4)

  // Current Bet Options / Quick Stakes from DB
  const quickStakes = straightGame?.bet_option?.length > 0
    ? straightGame.bet_option
    : ['5', '10', '20', '50', '100']

  return (
    <div className="min-h-0 py-2 sm:py-4 md:py-8 bg-background">
      {/* Success Modal */}
      {payoutSuccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <Card className="max-w-sm w-full bg-[#0c0c0c] border border-green-500/40 text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400 text-3xl animate-bounce">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">Purchase Successful!</h3>
              <p className="text-muted-foreground text-xs mb-3">Your LaChica BIGPOT tickets have been registered.</p>
              <div className="bg-neutral-900 border border-primary/30 rounded-lg p-2.5 mb-4">
                <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Order Number</span>
                <span className="font-mono text-primary font-black text-lg">#{successOrderNo}</span>
              </div>
              <Button
                onClick={() => setPayoutSuccess(false)}
                className="w-full gold-gradient text-white font-bold rounded-lg"
              >
                Continue Playing
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert / Login Redirect Modal */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-border/70 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <AlertCircle className="size-10 text-primary mx-auto" />
            <p className="text-sm text-foreground">{alertModal.message}</p>
            <Button
              onClick={() => {
                const redir = alertModal.isLoginRedirect
                setAlertModal({ isOpen: false, message: '' })
                if (redir) navigate('/login')
              }}
              className="w-full gold-gradient text-white font-bold py-2 rounded-xl"
            >
              {alertModal.isLoginRedirect ? 'Go to Login' : 'OK'}
            </Button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        {/* Lottery Header styled identical to Cashpot & Pick 2 */}
        <Card className="border border-border/60 mb-4 overflow-hidden relative py-0 gap-0 min-h-0 h-20 sm:h-24 md:h-28 flex items-center bg-[#0c0c0c] rounded-2xl shadow-lg">
          <div className="absolute inset-0 w-full h-full flex justify-end">
            <img
              src="/lachica_bigpot.png"
              alt={lotteryName}
              onError={(e) => { e.currentTarget.src = '/lachica_bigpot.png' }}
              className="h-full object-contain p-2 opacity-90 z-0"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-transparent" />
          </div>

          <CardContent className="p-3 sm:p-4 md:p-5 flex flex-row items-center justify-between gap-2 sm:gap-4 w-full relative z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => navigate('/lotteries')}
                className="size-8 sm:size-9 bg-background/80 backdrop-blur border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shrink-0"
              >
                <ArrowLeft className="size-4" />
              </button>

              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg md:text-xl font-black text-white uppercase tracking-wide truncate leading-tight">
                  {lotteryName}
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider truncate leading-none mt-0.5">
                  Type: <span className="text-primary">LaChica BIGPOT (Pick 3 & Pick 4)</span>
                </p>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <span className="text-[10px] lg:text-xs text-muted-foreground font-black uppercase tracking-widest hidden sm:inline mr-1 lg:mr-3">
                Next Draw:
              </span>
              <div className="flex items-center gap-0.5 sm:gap-1 text-[11px] sm:text-sm lg:text-lg font-black tabular-nums bg-black/60 border border-primary/20 px-2 py-1 sm:px-2.5 sm:py-1.5 lg:px-4 lg:py-2 rounded-lg text-white shadow-[0_0_10px_rgba(224,172,44,0.15)]">
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

        {/* Action Tabs - Matches website tabs */}
        <div className="relative mb-4 group">
          <div className="flex gap-0 border-b border-border/50 overflow-x-auto scrollbar-hide">
            {[
              { id: 'buy', label: 'Buy' },
              { id: 'prize', label: 'Prize' },
              { id: 'how-to-play', label: 'How to Play' },
              { id: 'sold-out', label: 'Sold Out' },
              { id: 'recent-draws', label: 'Recent Draws' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap uppercase tracking-wider ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: BUY TICKETS */}
        {activeTab === 'buy' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Play Area (2 cols on desktop) */}
            <div className="lg:col-span-2 space-y-5">
              <Card className="bg-[#0c0c0c] border border-border/60 rounded-2xl shadow-xl">
                <CardContent className="p-4 sm:p-6 space-y-5">
                  {/* Schedule & Selected Draws Badges */}
                  <div className="flex justify-between items-center border-b border-border/40 pb-3">
                    <span className="px-3 py-1 bg-primary/10 border border-primary/30 text-primary font-extrabold text-xs rounded-lg uppercase tracking-wider">
                      {scheduleType} SCHEDULE
                    </span>
                    <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-foreground font-extrabold text-xs rounded-lg">
                      {String(selectedDrawTimes.length).padStart(2, '0')} Selected Draws
                    </span>
                  </div>

                  {/* Draw Slot Chips */}
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white mb-2.5 uppercase tracking-wide">
                      Select your Next Draw Slots
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {drawTimesList.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No draw slots scheduled today.</p>
                      ) : (
                        drawTimesList.map((time) => {
                          const isSelected = selectedDrawTimes.includes(time)
                          const localDisplay = formatDrawTimeToLocal(time).timeOnly
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => toggleDrawTime(time)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                                isSelected
                                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_rgba(224,172,44,0.3)]'
                                  : 'bg-neutral-900/60 border-neutral-800 text-foreground hover:border-primary/50'
                              }`}
                            >
                              {localDisplay || time}
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Pick 3 vs Pick 4 Segmented Toggle */}
                  <div className="grid grid-cols-2 p-1 bg-black/60 rounded-xl border border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        setPickType(3)
                        setBetNumber('')
                      }}
                      className={`py-2.5 rounded-lg text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        pickType === 3
                          ? 'gold-gradient text-white shadow-md'
                          : 'text-muted-foreground hover:text-white'
                      }`}
                    >
                      <img src="/pick3_logo.png" alt="Pick 3" className="w-8 h-8 -my-1 object-contain" />
                      <span>Pick 3</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPickType(4)
                        setBetNumber('')
                      }}
                      className={`py-2.5 rounded-lg text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        pickType === 4
                          ? 'gold-gradient text-white shadow-md'
                          : 'text-muted-foreground hover:text-white'
                      }`}
                    >
                      <img src="/pick4_logo.png" alt="Pick 4" className="w-8 h-8 -my-1 object-contain" />
                      <span>Pick 4</span>
                    </button>
                  </div>

                  {/* Bet Number Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      Pick your Bet Number ({pickType} Digits)
                    </label>
                    <div className="flex items-center bg-black/60 border border-neutral-800 rounded-xl overflow-hidden focus-within:border-primary/70 focus-within:ring-1 focus-within:ring-primary/40">
                      <span className="text-xs font-bold text-primary px-3.5 py-3 shrink-0 bg-primary/10 border-r border-border/40 uppercase">
                        Bet No.
                      </span>
                      <input
                        type="text"
                        maxLength={pickType === 3 ? 3 : 4}
                        value={betNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '')
                          setBetNumber(val)
                        }}
                        placeholder={`Enter ${pickType}-digit number (e.g. ${pickType === 3 ? '123' : '1234'})`}
                        className="w-full bg-transparent text-white px-3 py-3 text-sm focus:outline-none placeholder:text-muted-foreground/40 font-mono tracking-widest"
                      />
                    </div>
                  </div>

                  {/* Quick Stake Selection Chips */}
                  <div>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Quick Stake Selection
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {quickStakes.map((opt: string) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setStraightBet(opt)
                            if (!boxBet) setBoxBet(opt)
                          }}
                          className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-xs text-foreground font-bold rounded-lg hover:border-primary/50 transition-colors"
                        >
                          ${opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2x2 Bet Amount Grid */}
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      Enter your Bet Amount ($)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Straight */}
                      <div className="bg-black/60 border border-neutral-800 rounded-xl p-2.5 focus-within:border-primary/70 focus-within:ring-1 focus-within:ring-primary/40">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Straight Bet
                          </span>
                          {(() => {
                            const { limit } = getMinRemainingLimit('straight')
                            if (!Number.isFinite(limit)) {
                              return straightGame?.bet_amount ? (
                                <span className="text-[10px] text-primary font-bold">
                                  Base: ${straightGame.bet_amount}
                                </span>
                              ) : null
                            }
                            const isZero = limit <= 0
                            return (
                              <span className={`text-[10px] font-bold ${isZero ? 'text-red-400' : 'text-primary'}`}>
                                {isZero ? 'SOLD OUT' : `Limit: $${limit.toFixed(2)}`}
                              </span>
                            )
                          })()}
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={straightBet}
                          onChange={(e) => setStraightBet(e.target.value)}
                          placeholder="Amount ($)"
                          className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-muted-foreground/40 font-bold"
                        />
                      </div>

                      {/* Box */}
                      <div className="bg-black/60 border border-neutral-800 rounded-xl p-2.5 focus-within:border-primary/70 focus-within:ring-1 focus-within:ring-primary/40">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Box Bet
                          </span>
                          {(() => {
                            const { limit } = getMinRemainingLimit('box')
                            if (!Number.isFinite(limit)) {
                              return boxGame?.bet_amounts ? (
                                <span className="text-[10px] text-primary font-bold">
                                  Box Combos
                                </span>
                              ) : null
                            }
                            const isZero = limit <= 0
                            return (
                              <span className={`text-[10px] font-bold ${isZero ? 'text-red-400' : 'text-primary'}`}>
                                {isZero ? 'SOLD OUT' : `Limit: $${limit.toFixed(2)}`}
                              </span>
                            )
                          })()}
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={boxBet}
                          onChange={(e) => setBoxBet(e.target.value)}
                          placeholder="Amount ($)"
                          className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-muted-foreground/40 font-bold"
                        />
                      </div>

                      {/* Megaball */}
                      <div className="bg-black/60 border border-neutral-800 rounded-xl p-2.5 focus-within:border-primary/70 focus-within:ring-1 focus-within:ring-primary/40">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                            Megaball Bet
                          </span>
                          {(() => {
                            const { limit } = getMinRemainingLimit('mega')
                            if (!Number.isFinite(limit)) {
                              return megaballGame?.bet_amount ? (
                                <span className="text-[10px] text-primary/80 font-bold">
                                  Base: ${megaballGame.bet_amount}
                                </span>
                              ) : null
                            }
                            const isZero = limit <= 0
                            return (
                              <span className={`text-[10px] font-bold ${isZero ? 'text-red-400' : 'text-primary/90'}`}>
                                {isZero ? 'SOLD OUT' : `Limit: $${limit.toFixed(2)}`}
                              </span>
                            )
                          })()}
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={megaballBet}
                          onChange={(e) => setMegaballBet(e.target.value)}
                          placeholder="Amount ($)"
                          className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-muted-foreground/40 font-bold"
                        />
                      </div>

                      {/* Monstaball */}
                      <div className="bg-black/60 border border-neutral-800 rounded-xl p-2.5 focus-within:border-primary/70 focus-within:ring-1 focus-within:ring-primary/40">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                            Monstaball Bet
                          </span>
                          {(() => {
                            const { limit } = getMinRemainingLimit('monsta')
                            if (!Number.isFinite(limit)) {
                              return monstaballGame?.bet_amount ? (
                                <span className="text-[10px] text-primary/80 font-bold">
                                  Base: ${monstaballGame.bet_amount}
                                </span>
                              ) : null
                            }
                            const isZero = limit <= 0
                            return (
                              <span className={`text-[10px] font-bold ${isZero ? 'text-red-400' : 'text-primary/90'}`}>
                                {isZero ? 'SOLD OUT' : `Limit: $${limit.toFixed(2)}`}
                              </span>
                            )
                          })()}
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={monstaballBet}
                          onChange={(e) => setMonstaballBet(e.target.value)}
                          placeholder="Amount ($)"
                          className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-muted-foreground/40 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Clear Data & Add Bet + */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearData}
                      className="w-1/3 bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl py-3 font-bold text-xs uppercase tracking-wider"
                    >
                      Clear Data
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddBet}
                      className="flex-1 gold-gradient text-white rounded-xl py-3 font-black text-sm uppercase tracking-wider shadow-[0_0_15px_rgba(224,172,44,0.25)] hover:opacity-90"
                    >
                      Add Bet +
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Desktop Bet Slip Sidebar (1 col) */}
            <div className="hidden lg:block space-y-4">
              <Card className="bg-[#0c0c0c] border border-border/60 rounded-2xl shadow-xl sticky top-20">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Your Bet Slip</h3>
                      <p className="text-[11px] text-muted-foreground">{cart.length} bet(s) queued</p>
                    </div>
                    {cart.length > 0 && (
                      <button
                        onClick={() => setCart([])}
                        className="text-xs text-red-400 hover:text-red-300 font-bold"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Queued List */}
                  <div className="max-h-[350px] overflow-y-auto space-y-2 divide-y divide-white/5 pr-1">
                    {cart.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground text-xs">
                        No bets in slip yet. Pick numbers & amounts to add.
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-primary text-sm">{item.number}</span>
                              <span className="bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                                P{item.pickType} &bull; {item.gameName}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {item.drawTimes.length} draw(s): {item.drawTimes.map((t) => formatDrawTimeToLocal(t).timeOnly).join(', ')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{formatUsd(item.total)}</span>
                            <button
                              onClick={() => handleRemoveBet(item.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Totals & Checkout */}
                  <div className="pt-3 border-t border-border/40 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-bold">Total Stake:</span>
                      <span className="text-lg font-black text-primary">{formatUsd(grandTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Wallet Balance:</span>
                      <span className="font-semibold text-white">{formatUsd(walletBalance)}</span>
                    </div>

                    <Button
                      onClick={handlePurchase}
                      disabled={checkoutLoading || cart.length === 0}
                      className="w-full gold-gradient text-white py-3 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg hover:opacity-90 disabled:opacity-50"
                    >
                      {checkoutLoading ? 'Processing...' : `Place Bets (${formatUsd(grandTotal)})`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: PRIZE STRUCTURE - DYNAMIC FROM APP API */}
        {activeTab === 'prize' && (
          <Card className="bg-[#0c0c0c] border border-border/60 rounded-2xl shadow-xl">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="text-base font-extrabold text-primary uppercase tracking-wide">
                  LaChica BIGPOT Payout & Multipliers
                </h3>
                <span className="text-xs text-muted-foreground">Configured in Admin 2</span>
              </div>

              {/* Pick 3 Multipliers */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary" /> Pick 3 Payouts
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {pick3Prices.map((item: any) => (
                    <div key={item.game_id} className="p-4 bg-neutral-900/60 rounded-xl border border-border/50">
                      <p className="font-bold text-white mb-1">{item.game_name}</p>
                      {item.game_id === 2 && item.bet_amounts ? (
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {Object.entries(item.bet_amounts).map(([k, v]) => (
                            <p key={k} className="flex justify-between">
                              <span className="capitalize">{k.replace(/pick3_box_|_/g, ' ')}:</span>
                              <span className="font-mono text-primary font-bold">{v as string}×</span>
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground flex justify-between">
                          <span>Base Stake:</span>
                          <span className="font-mono text-primary font-bold">${item.bet_amount}</span>
                        </p>
                      )}
                      {item.bet_option?.length > 0 && (
                        <p className="text-[10px] text-muted-foreground/70 mt-2">
                          Options: {item.bet_option.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pick 4 Multipliers */}
              <div className="space-y-3 pt-3 border-t border-border/30">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary" /> Pick 4 Payouts
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {pick4Prices.map((item: any) => (
                    <div key={item.game_id} className="p-4 bg-neutral-900/60 rounded-xl border border-border/50">
                      <p className="font-bold text-white mb-1">{item.game_name}</p>
                      {item.game_id === 2 && item.bet_amounts ? (
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {Object.entries(item.bet_amounts).map(([k, v]) => (
                            <p key={k} className="flex justify-between">
                              <span className="capitalize">{k.replace(/pick4_box_|_/g, ' ')}:</span>
                              <span className="font-mono text-primary font-bold">{v as string}×</span>
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground flex justify-between">
                          <span>Base Stake:</span>
                          <span className="font-mono text-primary font-bold">${item.bet_amount}</span>
                        </p>
                      )}
                      {item.bet_option?.length > 0 && (
                        <p className="text-[10px] text-muted-foreground/70 mt-2">
                          Options: {item.bet_option.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 3: HOW TO PLAY */}
        {activeTab === 'how-to-play' && (
          <Card className="bg-[#0c0c0c] border border-border/60 rounded-2xl shadow-xl">
            <CardContent className="p-6 space-y-3 text-sm text-muted-foreground leading-relaxed">
              <h3 className="text-base font-extrabold text-primary uppercase tracking-wide">
                How to Play LaChica BIGPOT
              </h3>
              {howToPlayData ? (
                <div dangerouslySetInnerHTML={{ __html: howToPlayData }} className="prose prose-invert max-w-none text-xs" />
              ) : (
                <ul className="list-disc list-inside space-y-2 text-xs">
                  <li>Select one or more available draw slot times.</li>
                  <li>Choose either <strong>Pick 3</strong> (3-digit number) or <strong>Pick 4</strong> (4-digit number).</li>
                  <li>Enter your lucky number in the Bet No. field.</li>
                  <li>Specify the wager amount for Straight, Box, Megaball, or Monstaball.</li>
                  <li>Tap <strong>Add Bet +</strong> to queue the ticket in your bet slip.</li>
                  <li>Review all your bets and tap <strong>Place Bets</strong> to confirm.</li>
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 4: SOLD OUT / NUMBER & GAME LIMITS - MATCHES ADMIN 1 WEBPAGE */}
        {activeTab === 'sold-out' && (
          <Card className="bg-[#0c0c0c] border border-border/60 rounded-2xl shadow-xl">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                  Number & Game Limits
                </h2>
                <p className="text-muted-foreground text-sm">
                  View the remaining bet limits for each number and game mode for the selected draw time.
                </p>
              </div>

              {/* Draw Time Selector Dropdown - Matches CashpotPage / Admin 1 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Select Draw Time:
                </span>
                <select
                  value={selectedSoldOutDrawTime}
                  onChange={(e) => setSelectedSoldOutDrawTime(e.target.value)}
                  className="bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm font-semibold focus:outline-none focus:border-primary"
                >
                  <option value="">-- Choose Draw Time --</option>
                  {drawTimesList.map((time) => (
                    <option key={time} value={time}>
                      {formatDrawTimeToLocal(time).display}
                    </option>
                  ))}
                </select>
              </div>

              {/* Special Bet Limits Cards (Megaball & Monstaball) */}
              {selectedSoldOutDrawTime && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Special Bet Limits</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 border border-border/60 rounded-xl bg-white/[0.02] flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Megaball Bet Limit</h4>
                        <p className="text-[10px] text-muted-foreground">Remaining stake allowed</p>
                      </div>
                      <span className="px-3 py-1 font-bold rounded-lg text-xs border border-green-500/30 bg-green-500/10 text-green-400">
                        ${currentDrawDetail?.p3_remaining_megaball_bet_limit || currentDrawDetail?.p4_remaining_megaball_bet_limit || '400.00'}
                      </span>
                    </div>

                    <div className="p-4 border border-border/60 rounded-xl bg-white/[0.02] flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Monstaball Bet Limit</h4>
                        <p className="text-[10px] text-muted-foreground">Remaining stake allowed</p>
                      </div>
                      <span className="px-3 py-1 font-bold rounded-lg text-xs border border-green-500/30 bg-green-500/10 text-green-400">
                        ${currentDrawDetail?.p3_remaining_monstaball_bet_limit || currentDrawDetail?.p4_remaining_monstaball_bet_limit || '300.00'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sold Out Numbers Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Sold Out Numbers</h3>
                {!selectedSoldOutDrawTime ? (
                  <p className="text-muted-foreground text-sm italic">
                    Please select a draw time to view number limits.
                  </p>
                ) : soldOutLoading ? (
                  <div className="py-8 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
                    <RefreshCw className="size-4 animate-spin text-primary" /> Loading sold out data...
                  </div>
                ) : soldOutNumbers.length === 0 ? (
                  <div className="p-6 border border-border/40 rounded-xl bg-[#0a0a0a] text-center space-y-2">
                    <Clock className="size-8 text-primary mx-auto opacity-70" />
                    <p className="text-sm font-semibold text-foreground">All numbers are currently available</p>
                    <p className="text-xs text-muted-foreground">
                      No numbers are sold out for {formatDrawTimeToLocal(selectedSoldOutDrawTime).timeOnly || selectedSoldOutDrawTime}.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {soldOutNumbers.map((num) => (
                      <div
                        key={num}
                        className="p-3 border border-red-500/30 bg-red-500/5 rounded-xl flex flex-col items-center justify-between text-center"
                      >
                        <span className="text-base font-black text-red-400 font-mono">#{num}</span>
                        <span className="text-[10px] font-bold text-red-400/90 mt-1 uppercase">SOLD OUT</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 5: RECENT DRAWS - DYNAMIC FROM APP API */}
        {activeTab === 'recent-draws' && (
          <Card className="bg-[#0c0c0c] border border-border/60 rounded-2xl shadow-xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="text-base font-extrabold text-primary uppercase tracking-wide">
                  Recent Draw Results
                </h3>
                <span className="text-xs text-muted-foreground">{recentDraws.length} past draws recorded</span>
              </div>

              {recentDraws.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  No draw history recorded yet for this lottery.
                </div>
              ) : (
                <div className="space-y-2.5 divide-y divide-white/5">
                  {recentDraws.map((draw: any, i: number) => (
                    <div key={i} className="pt-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">Draw #{draw.draw_no || '-'}</span>
                          <span className="text-muted-foreground">{draw.draw_time}</span>
                        </div>
                      </div>

                      {/* Balls */}
                      <div className="flex items-center gap-3">
                        {/* Pick 3 */}
                        {draw.pick3 && (
                          <div className="flex items-center gap-1 bg-black/60 border border-border/40 px-2 py-1 rounded-lg">
                            <span className="text-[10px] text-muted-foreground font-bold mr-1">P3:</span>
                            {String(draw.pick3).split('').map((digit, dIdx) => (
                              <span key={dIdx} className="size-6 rounded-full bg-neutral-800 text-white font-mono font-black flex items-center justify-center text-xs">
                                {digit}
                              </span>
                            ))}
                            {draw.p3_megaball && draw.p3_megaball !== 'white' && (
                              <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                {draw.p3_megaball}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Pick 4 */}
                        {draw.pick4 && (
                          <div className="flex items-center gap-1 bg-black/60 border border-border/40 px-2 py-1 rounded-lg">
                            <span className="text-[10px] text-muted-foreground font-bold mr-1">P4:</span>
                            {String(draw.pick4).split('').map((digit, dIdx) => (
                              <span key={dIdx} className="size-6 rounded-full bg-neutral-800 text-white font-mono font-black flex items-center justify-center text-xs">
                                {digit}
                              </span>
                            ))}
                            {draw.p4_megaball && draw.p4_megaball !== 'white' && (
                              <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                {draw.p4_megaball}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Bottom Bar: Total Bets View Button for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-border/60 p-3">
        <div className="max-w-md mx-auto">
          <Button
            type="button"
            onClick={() => setShowBetsModal(true)}
            disabled={cart.length === 0}
            className="w-full gold-gradient text-white py-3.5 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(224,172,44,0.35)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>Total Bets View ({cart.length})</span>
            {grandTotal > 0 && <span className="opacity-90">&bull; {formatUsd(grandTotal)}</span>}
          </Button>
        </div>
      </div>

      {/* Bets Modal / Cart Summary (Mobile & Tablet) */}
      {showBetsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#0c0c0c] border border-border/70 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden text-white shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white uppercase tracking-wider">Your Bet Slip</h3>
                <p className="text-xs text-muted-foreground">{cart.length} bet(s) queued</p>
              </div>
              <button
                onClick={() => setShowBetsModal(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Bet list */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-white/5">
              {cart.map((item) => (
                <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-primary text-sm">{item.number}</span>
                      <span className="bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                        Pick {item.pickType} &bull; {item.gameName}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Slots: {item.drawTimes.map((t) => formatDrawTimeToLocal(t).timeOnly).join(', ')} ({item.drawTimes.length} draws)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-sm">{formatUsd(item.total)}</span>
                    <button
                      onClick={() => handleRemoveBet(item.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer / Checkout */}
            <div className="p-4 bg-neutral-950 border-t border-border/40 space-y-3">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-muted-foreground">Grand Total:</span>
                <span className="text-lg font-black text-primary">{formatUsd(grandTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Wallet Balance:</span>
                <span className="font-semibold text-white">{formatUsd(walletBalance)}</span>
              </div>

              <Button
                onClick={handlePurchase}
                disabled={checkoutLoading || cart.length === 0}
                className="w-full gold-gradient text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg disabled:opacity-50"
              >
                {checkoutLoading ? 'Processing Purchase...' : `Confirm & Pay ${formatUsd(grandTotal)}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
