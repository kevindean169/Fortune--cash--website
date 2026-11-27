import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Clock, Trash2, X, AlertCircle, RefreshCw, Hash, Ticket, ChevronRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useDateTimeCountdown } from '@/hooks/useDateTimeCountdown'
import { LotterySkeleton } from '@/components/LotterySkeleton'
import { formatUsd } from '@/lib/currency'
import { getAdmin1BaseUrl, getAdmin2BaseUrl } from '@/lib/apiConfig'
import './LotteryPurchase.css'

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
  return getAdmin2BaseUrl()
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

  const now = new Date()
  let dateIso: string
  try {
    dateIso = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Jamaica' }).format(now)
  } catch {
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    dateIso = `${y}-${m}-${d}`
  }

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

function isDrawTimePassed(timeStr: string): boolean {
  if (!timeStr) return false

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

  const now = new Date()
  let dateIso: string
  try {
    dateIso = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Jamaica' }).format(now)
  } catch {
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    dateIso = `${y}-${m}-${d}`
  }

  // Admin 2 draw times are stored in Jamaica / EST timezone (UTC-5)
  const dateStr = `${dateIso}T${cleanTime}-05:00`
  const localDate = new Date(dateStr)

  if (isNaN(localDate.getTime())) {
    return false
  }

  return now.getTime() > localDate.getTime()
}

function formatRecentDrawTime(draw: any): string {
  if (!draw) return '-'
  const raw = draw.utc_draw_time || draw.draw_time
  if (!raw) return '-'

  let dateObj: Date
  if (draw.utc_draw_time) {
    dateObj = new Date(draw.utc_draw_time)
  } else {
    const cleanStr = String(draw.draw_time).trim().replace(' ', 'T')
    dateObj = new Date(cleanStr.includes('+') || cleanStr.includes('-05:00') ? cleanStr : `${cleanStr}-05:00`)
  }

  if (isNaN(dateObj.getTime())) {
    return String(draw.draw_time || raw)
  }

  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()

  return `${y}-${m}-${day} ${timeStr}`
}

function isMegaActive(val?: string): boolean {
  if (!val) return false
  const s = String(val).toLowerCase()
  return s === 'yellow' || s === 'gold' || s === 'mega' || s === 'y'
}

function isMonstaActive(val?: string): boolean {
  if (!val) return false
  const s = String(val).toLowerCase()
  return s === 'red' || s === 'monsta' || s === 'r'
}

function getNextDrawTarget(lotteryData: any): string {
  if (!lotteryData) return ''

  const startStr = lotteryData.startDateTime || (lotteryData.startDate && lotteryData.startTime ? `${lotteryData.startDate}T${lotteryData.startTime}:00` : null)
  if (startStr && new Date().getTime() < new Date(startStr).getTime()) {
    return startStr
  }

  const drawTimes: string[] = lotteryData.drawDetails?.map((d: any) => d.draw_time) || []
  if (drawTimes.length > 0) {
    const now = new Date()
    let dateIso: string
    try {
      dateIso = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Jamaica' }).format(now)
    } catch {
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      dateIso = `${y}-${m}-${d}`
    }

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
    const tomorrow = new Date(now.getTime() + 86400000)
    let tomorrowIso: string
    try {
      tomorrowIso = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Jamaica' }).format(tomorrow)
    } catch {
      const ty = tomorrow.getFullYear()
      const tm = String(tomorrow.getMonth() + 1).padStart(2, '0')
      const td = String(tomorrow.getDate()).padStart(2, '0')
      tomorrowIso = `${ty}-${tm}-${td}`
    }
    const tomorrowSlot = new Date(`${tomorrowIso}T${cleanFirst}-05:00`)
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

  // Closed / Not Started checks (matches CashpotPage / Admin 1)
  const isNotStarted = useMemo(() => {
    if (!lotteryData) return false
    if (lotteryData.status === 0 || lotteryData.status === '0') return true
    const startStr = lotteryData.startDateTime || (lotteryData.startDate && lotteryData.startTime ? `${lotteryData.startDate}T${lotteryData.startTime}:00` : null)
    if (!startStr) return false
    return new Date().getTime() < new Date(startStr).getTime()
  }, [lotteryData])

  const isExpired = useMemo(() => {
    if (!lotteryData) return false
    if (lotteryData.status === 1 || lotteryData.status === '1' || lotteryData.status === 'Deactive' || lotteryData.status === 'Inactive') return true
    const stopStr = lotteryData.stopDateTime || (lotteryData.stopDate && lotteryData.stopTime ? `${lotteryData.stopDate}T${lotteryData.stopTime}:00` : null)
    if (!stopStr) return false
    return new Date().getTime() > new Date(stopStr).getTime()
  }, [lotteryData])

  const showCross = isNotStarted || isExpired

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
          ? parseFloat(detail.p3_straight_bet_limit || detail.p3_bet_limit || '0')
          : parseFloat(detail.p4_straight_bet_limit || detail.p4_bet_limit || '0')
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

  // Monitor draw times and remove passed ones
  useEffect(() => {
    const interval = setInterval(() => {
      const passedSelected = selectedDrawTimes.filter((time) => isDrawTimePassed(time))
      const passedInCart = Array.from(
        new Set(cart.flatMap((item) => item.drawTimes).filter((time) => isDrawTimePassed(time)))
      )

      const allPassed = Array.from(new Set([...passedSelected, ...passedInCart]))

      if (allPassed.length > 0) {
        const displays = allPassed.map((t) => formatDrawTimeToLocal(t).timeOnly).join(', ')
        showAlert(
          `The following draw time(s) have passed: ${displays}. They have been removed from your selection and cart.`
        )

        setSelectedDrawTimes((prev) => prev.filter((t) => !allPassed.includes(t)))
        setCart((prev) => prev.filter((item) => !item.drawTimes.some((t) => allPassed.includes(t))))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedDrawTimes, cart])

  // Toggle Draw Time selection
  const toggleDrawTime = (time: string) => {
    if (isDrawTimePassed(time)) {
      showAlert(`Draw time ${formatDrawTimeToLocal(time).timeOnly} has already passed.`)
      return
    }
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

    const passedDraws = selectedDrawTimes.filter((t) => isDrawTimePassed(t))
    if (passedDraws.length > 0) {
      const displays = passedDraws.map((t) => formatDrawTimeToLocal(t).timeOnly).join(', ')
      showAlert(`Draw time(s) ${displays} have already passed. Please select upcoming draw slots.`)
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
    const isSoldOut = selectedDrawTimes.length > 0 && soldOutNumbers.includes(trimmedNum)
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

    if (showCross) {
      showAlert(isNotStarted ? 'This lottery is not open for purchase yet.' : 'This lottery has ended and is closed.')
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

    const passedInCart = Array.from(
      new Set(cart.flatMap((item) => item.drawTimes).filter((time) => isDrawTimePassed(time)))
    )
    if (passedInCart.length > 0) {
      const displays = passedInCart.map((t) => formatDrawTimeToLocal(t).timeOnly).join(', ')
      showAlert(`Some bets in your slip have passed draw time(s): ${displays}. Please remove them before checkout.`)
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
            message: 'Pick 3 & Pick 4 Purchased successfully',
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
          const admin1BaseUrl = getAdmin1BaseUrl()
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
      let finalOrderNo = String(orderNo)
      if (finalOrderNo && !finalOrderNo.startsWith('PP-') && !finalOrderNo.startsWith('CP-')) {
        finalOrderNo = `PP-${finalOrderNo}`
      }
      setSuccessOrderNo(finalOrderNo)
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

  const lotteryImage = '/pick3_pick4_logo.png'
  const lotteryName = 'Pick 3 & Pick 4'
  const scheduleType = lotteryData?.schedule?.toUpperCase() || 'DAILY'

  // Extract real dynamic price/multiplier data for Pick 3 and Pick 4
  const pick3Prices = priceData?.gameDetails?.[3] || lotteryData?.gameDetails?.[3] || []
  const pick4Prices = priceData?.gameDetails?.[4] || lotteryData?.gameDetails?.[4] || []

  const isMonstaballEnabled = priceData?.customer_monstaball !== false
  const currentPrices = pickType === 3 ? pick3Prices : pick4Prices
  const straightGame = currentPrices.find((g: any) => g.game_id === 1)
  const boxGame = currentPrices.find((g: any) => g.game_id === 2)
  const megaballGame = currentPrices.find((g: any) => g.game_id === 3)
  const monstaballGame = isMonstaballEnabled ? currentPrices.find((g: any) => g.game_id === 4) : undefined

  const [editingGameKey, setEditingGameKey] = useState<string | null>(null)
  const [tempBetAmount, setTempBetAmount] = useState<string>('')

  const activeGames = useMemo(() => {
    const list = [
      {
        key: 'straight',
        gameId: 1,
        name: 'Straight',
        amount: straightBet,
        setAmount: setStraightBet,
        presets: straightGame?.bet_option && straightGame.bet_option.length > 0
          ? straightGame.bet_option
          : ['5', '10', '20', '50'],
        limitInfo: getMinRemainingLimit('straight'),
        isDisabled: false,
      },
      {
        key: 'box',
        gameId: 2,
        name: 'Box',
        amount: boxBet,
        setAmount: setBoxBet,
        presets: boxGame?.bet_option && boxGame.bet_option.length > 0
          ? boxGame.bet_option
          : ['5', '10', '20', '50'],
        limitInfo: getMinRemainingLimit('box'),
        isDisabled: false,
      },
    ]

    const hasMainBet = (parseFloat(straightBet) || 0) > 0 || (parseFloat(boxBet) || 0) > 0

    if (megaballGame) {
      list.push({
        key: 'megaball',
        gameId: 3,
        name: 'Megaball',
        amount: megaballBet,
        setAmount: setMegaballBet,
        presets: megaballGame?.bet_option && megaballGame.bet_option.length > 0
          ? megaballGame.bet_option
          : ['5', '10', '20', '50'],
        limitInfo: getMinRemainingLimit('mega'),
        isDisabled: !hasMainBet,
      })
    }

    if (monstaballGame) {
      list.push({
        key: 'monstaball',
        gameId: 4,
        name: 'Monstaball',
        amount: monstaballBet,
        setAmount: setMonstaballBet,
        presets: monstaballGame?.bet_option && monstaballGame.bet_option.length > 0
          ? monstaballGame.bet_option
          : ['5', '10', '20', '50'],
        limitInfo: getMinRemainingLimit('monsta'),
        isDisabled: !hasMainBet,
      })
    }

    return list
  }, [currentPrices, straightBet, boxBet, megaballBet, monstaballBet, straightGame, boxGame, megaballGame, monstaballGame, getMinRemainingLimit])

  const openAmountPad = (gameKey: string) => {
    if (selectedDrawTimes.length === 0) {
      showAlert('Please select draw time(s) first.')
      return
    }
    const validDraws = selectedDrawTimes.filter((t) => !isDrawTimePassed(t))
    if (validDraws.length === 0) {
      showAlert('Please select upcoming draw time(s) first.')
      return
    }
    if (!betNumber.trim()) {
      showAlert(`Please enter your ${pickType}-digit bet number first.`)
      return
    }
    const targetGame = activeGames.find((g) => g.key === gameKey)
    if (targetGame?.isDisabled) {
      showAlert('Please enter a Straight or Box bet amount first.')
      return
    }
    setTempBetAmount(targetGame?.amount || '')
    setEditingGameKey(gameKey)
  }

  const handleKeypadPress = (val: string) => {
    let newVal = tempBetAmount
    if (val === 'clear') {
      newVal = ''
    } else if (val === '.') {
      if (!newVal.includes('.')) newVal += '.'
    } else {
      newVal += val
    }
    setTempBetAmount(newVal)
  }

  const applyTempBetAmount = () => {
    const targetGame = activeGames.find((g) => g.key === editingGameKey)
    if (targetGame) {
      targetGame.setAmount(tempBetAmount)
    }
    setEditingGameKey(null)
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

  return (
    <div className="lottery-purchase-wrapper min-h-screen text-foreground">
      {/* Success Modal */}
      {payoutSuccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <Card className="max-w-sm w-full bg-[#0c0c0c] border border-green-500/40 text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400 text-3xl animate-bounce">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">Purchase Successful!</h3>
              <p className="text-muted-foreground text-xs mb-3">Your Pick 3 & Pick 4 tickets have been registered.</p>
              <div className="bg-neutral-900 border border-primary/30 rounded-lg p-2.5 mb-4">
                <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Order Number</span>
                <span className="font-mono text-primary font-black text-lg">#{successOrderNo}</span>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => setPayoutSuccess(false)}
                  className="w-full gold-gradient text-white font-bold rounded-lg cursor-pointer"
                >
                  Continue Playing
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setPayoutSuccess(false)
                    navigate('/tickets')
                  }}
                  className="w-full text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  View My Tickets →
                </Button>
              </div>
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

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-6 space-y-1.5 sm:space-y-4">
        {/* Lottery Header styled identical to Cashpot & Pick 2 */}
        <Card className="lottery-card-container overflow-hidden relative py-0 gap-0 min-h-0 h-14 sm:h-20 md:h-28 flex items-center shadow-lg">
          <div className="absolute inset-0 w-full h-full flex justify-end">
            <img
              src={lotteryImage}
              alt={lotteryName}
              onError={(e) => { e.currentTarget.src = '/pick3_pick4_logo.png' }}
              className="h-full object-contain p-1 sm:p-2 opacity-90 z-0"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-transparent" />
          </div>

          <CardContent className="p-2 sm:p-4 md:p-5 flex flex-row items-center justify-between gap-2 sm:gap-4 w-full relative z-10">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <button
                onClick={() => navigate('/lotteries')}
                className="size-7 sm:size-9 bg-background/80 backdrop-blur border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shrink-0"
              >
                <ArrowLeft className="size-3.5 sm:size-4" />
              </button>

              <div className="min-w-0">
                <h1 className="text-xs sm:text-lg md:text-xl font-black text-white uppercase tracking-wide truncate leading-tight">
                  {lotteryName}
                </h1>
                <p className="text-[9px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider truncate leading-none mt-0.5">
                  Type: <span className="text-primary">Pick 3 & Pick 4</span>
                </p>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <span className="text-[10px] lg:text-xs text-muted-foreground font-black uppercase tracking-widest hidden sm:inline mr-1 lg:mr-3">
                {isNotStarted ? 'Draw Starts In:' : isExpired ? 'Lottery Closed:' : 'Next Draw:'}
              </span>
              <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-sm lg:text-lg font-black tabular-nums bg-black/60 border border-primary/20 px-1.5 py-0.5 sm:px-2.5 sm:py-1.5 lg:px-4 lg:py-2 rounded-lg text-white shadow-[0_0_10px_rgba(224,172,44,0.15)]">
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
        <div className="relative mb-1 sm:mb-2 group">
          <div className="flex gap-0 border-b border-border/50 overflow-x-auto scrollbar-hide">
            {[
              { id: 'buy', label: 'Buy Tickets' },
              { id: 'prize', label: 'Prize Structure' },
              { id: 'how-to-play', label: 'How to Play' },
              { id: 'sold-out', label: 'Sold Out Numbers' },
              { id: 'recent-draws', label: 'Recent Draws' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold border-2 transition-all whitespace-nowrap uppercase ${
                  activeTab === tab.id
                    ? 'lottery-tab-active-gold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Scroll Hint Arrow for Mobile */}
          <button 
            type="button"
            onClick={(e) => {
              const container = e.currentTarget.previousElementSibling;
              if (container) container.scrollBy({ left: 150, behavior: 'smooth' });
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center pr-2 md:hidden z-10"
          >
            <div className="bg-black/80 backdrop-blur-md rounded-full p-1.5 shadow-lg border border-white/20 text-white">
              <ChevronRight className="w-4 h-4 animate-pulse" />
            </div>
          </button>
        </div>

        {/* Tab 1: BUY TICKETS */}
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
                {/* Desktop View (Unchanged for Web View) */}
            <div className="hidden lg:grid grid-cols-3 gap-6">
              {/* Play Area (2 cols on desktop) */}
              <div className="lg:col-span-2 space-y-5">
                <Card className="lottery-card-container">
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
                            const isPassed = isDrawTimePassed(time)
                            const localDisplay = formatDrawTimeToLocal(time).timeOnly
                            return (
                              <button
                                key={time}
                                type="button"
                                disabled={isPassed}
                                onClick={() => toggleDrawTime(time)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                                  isPassed
                                    ? 'border-neutral-800 bg-neutral-950/50 text-muted-foreground/50 cursor-not-allowed'
                                    : isSelected
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

                    {/* Bet Amount Grid per game with individual presets */}
                    <div className="space-y-3">
                      <label className="block text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                        Enter your Bet Amount ($)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeGames.map((game) => {
                          const isSoldOut = Number.isFinite(game.limitInfo.limit) && game.limitInfo.limit <= 0
                          const isDisabled = game.isDisabled || isSoldOut

                          return (
                            <div
                              key={game.key}
                              className={`bg-black/60 border border-neutral-800 rounded-xl p-3 focus-within:border-primary/70 transition-all ${
                                isDisabled ? 'opacity-50 pointer-events-none' : ''
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                  {game.name} Bet
                                </span>
                                {isSoldOut && (
                                  <span className="text-[10px] font-bold text-red-400">SOLD OUT</span>
                                )}
                              </div>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-extrabold text-sm">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={game.amount}
                                  onChange={(e) => game.setAmount(e.target.value)}
                                  placeholder="0.00"
                                  disabled={isDisabled}
                                  className="w-full bg-[#0d0d0d] border border-border/80 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary"
                                />
                              </div>

                              {/* Presets specific to THIS game */}
                              <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {game.presets.map((val: string) => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => game.setAmount(val)}
                                    className={`px-2.5 py-1 border text-xs font-bold rounded-lg transition-all ${
                                      game.amount === val
                                        ? 'border-primary text-primary bg-primary/15'
                                        : 'border-neutral-800 bg-[#0d0d0d] text-muted-foreground hover:border-neutral-700'
                                    }`}
                                  >
                                    ${val}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Action Buttons: Clear Data & Add Bet + */}
                    <div className="flex items-center gap-4 pt-4 border-t border-border/40 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClearData}
                        className="clear-data-btn w-1/3"
                      >
                        CLEAR DATA
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddBet}
                        className="bet-add-btn-green w-2/3"
                      >
                        ADD BET +
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Desktop Bet Slip Sidebar (1 col) */}
              <div className="hidden lg:block space-y-4">
                <Card className="bg-fortune-card border border-border/60 rounded-2xl shadow-xl sticky top-20">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                      <div>
                        <h3 className="font-black text-2xl text-white">Your Bet Slip</h3>
                        <p className="text-xs text-muted-foreground">{cart.length} bet(s) queued</p>
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
                        className={`w-full font-extrabold text-[15px] uppercase tracking-widest transition-all rounded-lg ${
                          cart.length === 0 || checkoutLoading
                            ? 'bg-muted border border-border text-muted-foreground cursor-not-allowed'
                            : 'bet-add-btn-green'
                        }`}
                      >
                        {checkoutLoading ? 'Processing...' : `PLACE BETS (${formatUsd(grandTotal)})`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mobile Responsive Single Page View (Matches Admin 1 Mobile View, No Scroll) */}
            <div className="lg:hidden space-y-1 pb-24">
              {/* Draws selection */}
              <Card className="bg-fortune-card border border-border/60 py-0">
                <CardContent className="px-3 py-1">
                  <div className="flex justify-between items-center mb-1 pb-1 border-b border-border/40">
                    <span className="text-[11px] text-primary font-black uppercase tracking-wider">{scheduleType} Schedule</span>
                    <span className="text-xs text-primary font-bold border border-primary px-1.5 py-0.5 rounded">{selectedDrawTimes.length} Selected</span>
                  </div>
                  <div className="max-h-[72px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
                    <div className="grid grid-cols-4 gap-1.5">
                      {drawTimesList.map((time) => {
                        const isSelected = selectedDrawTimes.includes(time)
                        const isPassed = isDrawTimePassed(time)
                        return (
                          <button
                            key={time}
                            type="button"
                            disabled={isPassed}
                            onClick={() => toggleDrawTime(time)}
                            className={`py-1 px-1 text-[11px] sm:text-xs font-bold rounded-lg border text-center transition-all ${
                              isPassed
                                ? 'border-neutral-800 bg-neutral-950/50 text-muted-foreground/50 cursor-not-allowed'
                                : isSelected
                                  ? 'border-primary bg-primary/15 text-primary'
                                  : 'border-neutral-800 bg-[#0d0d0d] text-white/90'
                            }`}
                          >
                            {formatDrawTimeToLocal(time).timeOnly || time}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pick Game & Bet Number */}
              <Card className="bg-fortune-card border border-border/60 py-0">
                <CardContent className="px-3 py-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    {/* Pick 3 vs Pick 4 */}
                    <div className="flex p-0.5 bg-black/60 rounded-lg border border-neutral-800">
                      <button
                        type="button"
                        onClick={() => { setPickType(3); setBetNumber('') }}
                        className={`px-3 py-0.5 rounded-md text-[11px] font-black uppercase transition-all ${
                          pickType === 3 ? 'bg-primary text-black font-extrabold shadow-sm' : 'text-muted-foreground hover:text-white'
                        }`}
                      >
                        Pick 3
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPickType(4); setBetNumber('') }}
                        className={`px-3 py-0.5 rounded-md text-[11px] font-black uppercase transition-all ${
                          pickType === 4 ? 'bg-primary text-black font-extrabold shadow-sm' : 'text-muted-foreground hover:text-white'
                        }`}
                      >
                        Pick 4
                      </button>
                    </div>

                    {/* Quick Pick Random Number */}
                    <button
                      type="button"
                      onClick={() => {
                        const max = pickType === 3 ? 999 : 9999
                        const num = String(Math.floor(Math.random() * (max + 1))).padStart(pickType, '0')
                        setBetNumber(num)
                      }}
                      className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-foreground text-[10px] font-bold rounded hover:border-primary/50"
                    >
                      Quick Pick
                    </button>
                  </div>

                  {/* Compact Number Input */}
                  <div className="flex items-center bg-black/60 border border-neutral-800 rounded-lg overflow-hidden focus-within:border-primary">
                    <span className="text-[11px] font-bold text-primary px-2.5 py-1 shrink-0 bg-primary/10 border-r border-border/40 uppercase">
                      Bet No.
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={pickType === 3 ? 3 : 4}
                      value={betNumber}
                      onChange={(e) => setBetNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder={`Enter ${pickType}-digit number`}
                      className="w-full bg-transparent text-white px-2.5 py-1 text-xs focus:outline-none font-mono tracking-widest placeholder:text-muted-foreground/40"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Enter Bet Amounts */}
              <Card className="bg-fortune-card border border-border/60 py-0 mt-1">
                <CardContent className="px-3 py-1 space-y-1">
                  <h3 className="font-black text-[11px] text-foreground tracking-wider uppercase">ENTER YOUR BET AMOUNT</h3>
                  <div className={`grid gap-1.5 ${activeGames.length === 4 ? 'grid-cols-4' : activeGames.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {activeGames.map((game) => {
                      const isSoldOut = game.limitInfo.limit <= 0
                      const isDisabled = game.isDisabled || isSoldOut

                      return (
                        <div key={game.key} className="flex flex-col space-y-1">
                          <span className={`text-[9px] font-bold text-center truncate ${isDisabled ? 'text-muted-foreground/50' : 'text-foreground'}`}>
                            {game.name}
                          </span>
                          <div
                            onClick={() => {
                              if (!isDisabled) {
                                openAmountPad(game.key)
                              }
                            }}
                            className={`flex items-center bg-[#0d0d0d] border rounded-md py-1 px-1.5 transition-all ${
                              isDisabled ? 'border-primary/20 opacity-40 cursor-not-allowed' : 'border-primary/50 cursor-pointer'
                            }`}
                          >
                            <span className="text-muted-foreground text-xs font-bold mr-1">$</span>
                            <input
                              type="text"
                              inputMode="none"
                              readOnly
                              placeholder="0.00"
                              value={game.amount}
                              disabled={isDisabled}
                              className={`bg-transparent w-full outline-none text-xs font-bold cursor-pointer ${
                                isDisabled ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground'
                              }`}
                            />
                          </div>
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              if (!isDisabled) {
                                openAmountPad(game.key)
                              }
                            }}
                            className={`rounded-md py-1 text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                              isDisabled ? 'add-sub-btn-disabled' : 'add-sub-btn-gold'
                            }`}
                          >
                            {isSoldOut ? 'SOLD' : '+ ADD'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Fixed Bottom Action Buttons */}
              <div className="fixed bottom-[65px] sm:bottom-[80px] left-3 right-3 sm:left-6 sm:right-6 z-40 bg-[#0c0c0c]/95 backdrop-blur-xl border border-border/40 rounded-xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)] p-2 sm:p-3 flex flex-col gap-1.5 sm:gap-2 animate-slideUp">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearData}
                    className="clear-data-btn w-1/3"
                  >
                    CLEAR DATA
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddBet}
                    className="bet-add-btn-green w-2/3"
                  >
                    ADD BET +
                  </Button>
                </div>

                <Button
                  onClick={() => setShowBetsModal(true)}
                  className="total-bets-btn-black w-full"
                >
                  Total Bets View ({cart.length}) {grandTotal > 0 ? `• ${formatUsd(grandTotal)}` : ''}
                </Button>
              </div>

              {/* Custom Amount Pad Popup */}
              {editingGameKey && (
                <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-fortune-card border border-border/60 rounded-3xl w-full max-w-[300px] p-5 flex flex-col relative animate-fadeIn shadow-2xl">
                    {(() => {
                      const currentGame = activeGames.find((g) => g.key === editingGameKey)
                      const enteredVal = parseFloat(tempBetAmount) || 0
                      const limitVal = currentGame?.limitInfo?.limit ?? Infinity
                      const isOverLimit = enteredVal > limitVal

                      return (
                        <>
                          <h3 className="font-extrabold text-base text-foreground mb-0.5 tracking-wide">
                            {currentGame?.name}
                          </h3>
                          <p className="text-muted-foreground text-[10px] mb-3">Enter the Amount</p>

                          <div className="bg-[#0d0d0d] border border-primary/30 rounded-xl px-4 py-3 text-lg font-bold text-primary mb-4 flex items-center shadow-inner relative">
                            <span className="text-primary/70 mr-2">$</span>
                            {tempBetAmount || '0.00'}
                            {isOverLimit && (
                              <p className="absolute -bottom-5 left-0 text-red-400 text-[9px] font-semibold">
                                Exceeds limit ({formatUsd(limitVal)})
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4 mt-2">
                            {currentGame?.presets.map((val: string) => (
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

                          <div className="grid grid-cols-4 gap-1.5 mb-5">
                            {/* Row 1 */}
                            <button type="button" onClick={() => handleKeypadPress('1')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">1</button>
                            <button type="button" onClick={() => handleKeypadPress('2')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">2</button>
                            <button type="button" onClick={() => handleKeypadPress('3')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">3</button>
                            <button type="button" onClick={() => handleKeypadPress('.')} className="bg-transparent border border-neutral-800 rounded-xl text-2xl font-bold text-foreground py-3 row-span-2 hover:bg-neutral-900 transition-colors">.</button>

                            {/* Row 2 */}
                            <button type="button" onClick={() => handleKeypadPress('4')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">4</button>
                            <button type="button" onClick={() => handleKeypadPress('5')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">5</button>
                            <button type="button" onClick={() => handleKeypadPress('6')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">6</button>

                            {/* Row 3 */}
                            <button type="button" onClick={() => handleKeypadPress('7')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">7</button>
                            <button type="button" onClick={() => handleKeypadPress('8')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">8</button>
                            <button type="button" onClick={() => handleKeypadPress('9')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 hover:bg-neutral-900 transition-colors">9</button>
                            <button type="button" onClick={() => handleKeypadPress('clear')} className="bg-transparent border border-neutral-800 rounded-xl text-xs font-bold text-red-400 py-3 row-span-2 hover:bg-neutral-900 transition-colors">Clear</button>

                            {/* Row 4 */}
                            <button type="button" onClick={() => handleKeypadPress('0')} className="bg-transparent border border-neutral-800 rounded-xl text-lg font-bold text-foreground py-3 col-span-3 hover:bg-neutral-900 transition-colors">0</button>
                          </div>

                          <div className="flex justify-between items-center gap-3">
                            <button type="button" onClick={() => setEditingGameKey(null)} className="w-1/2 bg-transparent text-muted-foreground text-xs hover:text-foreground font-extrabold pb-1">Cancel</button>
                            <button type="button" onClick={applyTempBetAmount} className="w-1/2 bet-add-btn-green text-fortune-navy text-sm font-bold py-3.5 rounded-xl gold-glow transition-all">Done</button>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              )}
            </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: PRIZE STRUCTURE */}
        {activeTab === 'prize' && (
          <Card className="lottery-card-container">
            <CardContent className="p-4 sm:p-8">
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-4 sm:mb-6">Prize Payout Structure</h2>

              <div className="space-y-6">
                {/* Pick 3 Multipliers */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                    <span className="size-2.5 rounded-full bg-primary" />
                    <h3 className="font-extrabold text-lg text-foreground uppercase tracking-wide">Pick 3 Payouts</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pick3Prices.map((item: any, idx: number) => {
                      const numStr = String(idx + 1).padStart(2, '0')
                      return (
                        <div key={item.game_id} className="bg-background/40 border border-neutral-900 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center justify-between border-b border-neutral-900/60 pb-3">
                            <div className="flex items-center gap-4">
                              <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-extrabold text-sm text-primary shrink-0">
                                {numStr}
                              </div>
                              <h4 className="font-extrabold text-base text-foreground">{item.game_name}</h4>
                            </div>
                            <span className="text-[10px] text-muted-foreground/60 uppercase font-black tracking-widest">Payout Details</span>
                          </div>
                          <div className="space-y-2">
                            {item.game_id === 2 && item.bet_amounts ? (
                              Object.entries(item.bet_amounts).map(([k, v]) => (
                                <div key={k} className="flex justify-between items-center text-sm py-1 border-b border-border/5 last:border-b-0">
                                  <span className="text-xs text-muted-foreground font-semibold capitalize">
                                    {k.replace(/pick3_box_|_/g, ' ')}
                                  </span>
                                  <span className="font-extrabold text-primary">
                                    Bet Amount x {v as string}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="flex justify-between items-center text-sm py-1">
                                <span className="text-xs text-muted-foreground font-semibold">Standard Stake Multiplier</span>
                                <span className="font-extrabold text-primary">
                                  Bet Amount x {item.bet_amount || '1'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Pick 4 Multipliers */}
                <div className="space-y-4 pt-4 border-t border-border/30">
                  <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                    <span className="size-2.5 rounded-full bg-primary" />
                    <h3 className="font-extrabold text-lg text-foreground uppercase tracking-wide">Pick 4 Payouts</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pick4Prices.map((item: any, idx: number) => {
                      const numStr = String(idx + 1).padStart(2, '0')
                      return (
                        <div key={item.game_id} className="bg-background/40 border border-neutral-900 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center justify-between border-b border-neutral-900/60 pb-3">
                            <div className="flex items-center gap-4">
                              <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-extrabold text-sm text-primary shrink-0">
                                {numStr}
                              </div>
                              <h4 className="font-extrabold text-base text-foreground">{item.game_name}</h4>
                            </div>
                            <span className="text-[10px] text-muted-foreground/60 uppercase font-black tracking-widest">Payout Details</span>
                          </div>
                          <div className="space-y-2">
                            {item.game_id === 2 && item.bet_amounts ? (
                              Object.entries(item.bet_amounts).map(([k, v]) => (
                                <div key={k} className="flex justify-between items-center text-sm py-1 border-b border-border/5 last:border-b-0">
                                  <span className="text-xs text-muted-foreground font-semibold capitalize">
                                    {k.replace(/pick4_box_|_/g, ' ')}
                                  </span>
                                  <span className="font-extrabold text-primary">
                                    Bet Amount x {v as string}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="flex justify-between items-center text-sm py-1">
                                <span className="text-xs text-muted-foreground font-semibold">Standard Stake Multiplier</span>
                                <span className="font-extrabold text-primary">
                                  Bet Amount x {item.bet_amount || '1'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 3: HOW TO PLAY */}
        {activeTab === 'how-to-play' && (
          <Card className="lottery-card-container">
            <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                How to Play {lotteryName}
              </h2>
              {howToPlayData ? (
                <div
                  className="text-muted-foreground text-sm sm:text-base whitespace-pre-wrap leading-relaxed how-to-play-content"
                  dangerouslySetInnerHTML={{ __html: howToPlayData.replace(/LaChica BIGPOT/gi, 'Pick 3 & Pick 4').replace(/LaChica/gi, 'Pick 3 & Pick 4') }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {[
                    { step: '01', title: 'Choose Numbers', desc: 'Select 3 digits for Pick 3 or 4 digits for Pick 4.', icon: <Hash className="size-4 text-primary" /> },
                    { step: '02', title: 'Select Draw Times', desc: 'Decide which draw times you want to play for the day.', icon: <Clock className="size-4 text-primary" /> },
                    { step: '03', title: 'Choose Bet Type & Amount', desc: 'Pick Straight, Box, Megaball, or Monstaball and enter bet amount.', icon: <Ticket className="size-4 text-primary" /> },
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

        {/* Tab 4: SOLD OUT NUMBERS */}
        {activeTab === 'sold-out' && (
          <Card className="lottery-card-container">
            <CardContent className="p-4 sm:p-8">
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2 sm:mb-4">
                Number & Game Limits
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
                View the remaining bet limits for each number and game mode for the selected draw time.
              </p>

              {/* Draw Time Selector Dropdown - Matches CashpotPage / Admin 1 */}
              <div className="mb-8 flex items-center gap-4">
                <span className="text-sm font-bold text-muted-foreground uppercase">
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

              {!selectedSoldOutDrawTime ? (
                <p className="text-muted-foreground text-sm italic">
                  Please select a draw time to view number and game limits.
                </p>
              ) : (
                <div className="space-y-8 animate-fadeIn">
                  {/* Special Bet Limits Cards (Megaball & Monstaball) */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Special Bet Limits</h3>
                    <div className={`grid grid-cols-1 ${monstaballGame ? 'sm:grid-cols-2' : ''} gap-4`}>
                      <div className="p-4 border border-border rounded-xl bg-white/[0.02] flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-sm text-foreground">Megaball Bet Limit</h4>
                          <p className="text-[10px] text-muted-foreground">Remaining stake allowed</p>
                        </div>
                        <span className="px-3 py-1 font-bold rounded-lg text-xs border border-green-500/30 bg-green-500/10 text-green-400">
                          ${currentDrawDetail?.p3_remaining_megaball_bet_limit || currentDrawDetail?.p4_remaining_megaball_bet_limit || '400.00'}
                        </span>
                      </div>

                      {monstaballGame && (
                        <div className="p-4 border border-border rounded-xl bg-white/[0.02] flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-sm text-foreground">Monstaball Bet Limit</h4>
                            <p className="text-[10px] text-muted-foreground">Remaining stake allowed</p>
                          </div>
                          <span className="px-3 py-1 font-bold rounded-lg text-xs border border-green-500/30 bg-green-500/10 text-green-400">
                            ${currentDrawDetail?.p3_remaining_monstaball_bet_limit || currentDrawDetail?.p4_remaining_monstaball_bet_limit || '300.00'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sold Out Numbers Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Number Bet Limits</h3>
                    {soldOutLoading ? (
                      <div className="py-8 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
                        <RefreshCw className="size-4 animate-spin text-primary" /> Loading limit data...
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
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 5: RECENT DRAWS */}
        {activeTab === 'recent-draws' && (
          <Card className="lottery-card-container">
            <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div>
                  <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    Recent Draw Results
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base mt-1">Official draw results and winning numbers.</p>
                </div>
                <span className="text-xs text-muted-foreground bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg font-semibold">
                  {recentDraws.length} past draws recorded
                </span>
              </div>

              {recentDraws.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  No draw history recorded yet for this lottery.
                </div>
              ) : (
                <div className="space-y-2.5 divide-y divide-white/5">
                  {recentDraws.map((draw: any, i: number) => {
                    const p3Mega = draw.p3_megaball || 'white'
                    const p3Monsta = draw.p3_monstaball || 'white'
                    const p4Mega = draw.p4_megaball || draw.p3_megaball || 'white'
                    const p4Monsta = draw.p4_monstaball || draw.p3_monstaball || 'white'

                    return (
                      <div
                        key={i}
                        className="pt-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-sm">Draw #{draw.draw_no || '-'}</span>
                            <span className="text-muted-foreground flex items-center gap-1 font-medium">
                              <Clock className="size-3 text-primary/70" />
                              {formatRecentDrawTime(draw)}
                            </span>
                          </div>
                        </div>

                        {/* Balls */}
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Pick 3 */}
                          {draw.pick3 && (
                            <div className="flex items-center gap-1.5 bg-black/60 border border-border/40 px-2.5 py-1.5 rounded-lg">
                              <span className="text-[10px] text-muted-foreground font-bold mr-0.5">P3:</span>
                              {String(draw.pick3).split('').map((digit: string, dIdx: number) => (
                                <span
                                  key={dIdx}
                                  className="number-ball number-ball-result size-6 text-[11px] font-black"
                                >
                                  {digit}
                                </span>
                              ))}

                              {/* Mega & Monsta for Pick 3 */}
                              <div className="flex items-center gap-2 ml-1.5 pl-2 border-l border-white/10">
                                <div className="flex items-center gap-1" title={`P3 Mega: ${p3Mega}`}>
                                  <div
                                    className={`number-ball size-5.5 ${
                                      isMegaActive(p3Mega)
                                        ? 'number-ball-monsta'
                                        : 'number-ball-result'
                                    }`}
                                  />
                                  <span className={`text-[9px] font-bold uppercase ${isMegaActive(p3Mega) ? 'text-amber-400' : 'text-zinc-500'}`}>
                                    Mega
                                  </span>
                                </div>

                                <div className="flex items-center gap-1" title={`P3 Monsta: ${p3Monsta}`}>
                                  <div
                                    className={`number-ball size-5.5 ${
                                      isMonstaActive(p3Monsta)
                                        ? 'number-ball-mega'
                                        : 'number-ball-result'
                                    }`}
                                  />
                                  <span className={`text-[9px] font-bold uppercase ${isMonstaActive(p3Monsta) ? 'text-red-400' : 'text-zinc-500'}`}>
                                    Monsta
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Pick 4 */}
                          {draw.pick4 && (
                            <div className="flex items-center gap-1.5 bg-black/60 border border-border/40 px-2.5 py-1.5 rounded-lg">
                              <span className="text-[10px] text-muted-foreground font-bold mr-0.5">P4:</span>
                              {String(draw.pick4).split('').map((digit: string, dIdx: number) => (
                                <span
                                  key={dIdx}
                                  className="number-ball number-ball-result size-6 text-[11px] font-black"
                                >
                                  {digit}
                                </span>
                              ))}

                              {/* Mega & Monsta for Pick 4 */}
                              <div className="flex items-center gap-2 ml-1.5 pl-2 border-l border-white/10">
                                <div className="flex items-center gap-1" title={`P4 Mega: ${p4Mega}`}>
                                  <div
                                    className={`number-ball size-5.5 ${
                                      isMegaActive(p4Mega)
                                        ? 'number-ball-monsta'
                                        : 'number-ball-result'
                                    }`}
                                  />
                                  <span className={`text-[9px] font-bold uppercase ${isMegaActive(p4Mega) ? 'text-amber-400' : 'text-zinc-500'}`}>
                                    Mega
                                  </span>
                                </div>

                                <div className="flex items-center gap-1" title={`P4 Monsta: ${p4Monsta}`}>
                                  <div
                                    className={`number-ball size-5.5 ${
                                      isMonstaActive(p4Monsta)
                                        ? 'number-ball-mega'
                                        : 'number-ball-result'
                                    }`}
                                  />
                                  <span className={`text-[9px] font-bold uppercase ${isMonstaActive(p4Monsta) ? 'text-red-400' : 'text-zinc-500'}`}>
                                    Monsta
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Bottom Bar: Total Bets View Button for Mobile (on other tabs when cart has items) */}
      {activeTab !== 'buy' && cart.length > 0 && !showCross && (
        <div className="lg:hidden fixed bottom-[65px] left-3 right-3 z-40 bg-[#0c0c0c]/95 backdrop-blur-xl border border-border/40 rounded-xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)] p-2">
          <Button
            type="button"
            onClick={() => setShowBetsModal(true)}
            className="total-bets-btn-black w-full"
          >
            Total Bets View ({cart.length}) &bull; {formatUsd(grandTotal)}
          </Button>
        </div>
      )}

      {/* Bets Modal / Cart Summary (Mobile & Tablet) - Matches CashpotPage / Admin 1 */}
      {showBetsModal && (
        <div className="fixed inset-0 z-[110] bg-[#0a0a0a] sm:bg-black/80 sm:backdrop-blur-sm flex sm:items-center sm:justify-center animate-slideUp">
          <div className="bg-fortune-card sm:border sm:border-border/60 sm:rounded-2xl w-full sm:max-w-md h-full sm:h-auto sm:max-h-[85vh] flex flex-col relative text-white">
            {/* Header */}
            <div className="p-4 border-b border-border/40 flex justify-between items-center bg-[#0d0d0d] sm:rounded-t-2xl">
              <h3 className="font-black text-lg text-foreground tracking-wide flex items-center gap-2">
                <Ticket className="size-5 text-primary" /> Total Bets ({cart.length})
              </h3>
              <button
                onClick={() => setShowBetsModal(false)}
                className="bg-neutral-900 p-1.5 rounded-full text-muted-foreground hover:text-white transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Bet list */}
            <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800 bg-[#0a0a0a] space-y-2.5 divide-y divide-white/5">
              {cart.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center justify-center">
                  <Ticket className="size-12 text-primary/60 mb-4" />
                  <p className="text-muted-foreground text-sm font-semibold">No bets added to cart yet.</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">Configure options and click "Add Bet".</p>
                </div>
              ) : (
                cart.map((item) => (
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
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            <div className="p-4 border-t border-border/40 bg-[#0d0d0d] sm:rounded-b-2xl pb-8 sm:pb-4 space-y-3">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-muted-foreground">Grand Total:</span>
                <span className="font-black text-2xl text-green-400">{formatUsd(grandTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Wallet Balance:</span>
                <span className="font-semibold text-white">{formatUsd(walletBalance)}</span>
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setShowBetsModal(false)}
                  className="flex-1 h-[50px] border-primary/40 bg-primary/5 text-primary text-sm font-extrabold rounded-xl hover:bg-primary/20 hover:text-primary transition-colors"
                >
                  + Add More
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={checkoutLoading || cart.length === 0}
                  className={`flex-[1.2] h-[50px] font-extrabold text-[15px] uppercase tracking-wider rounded-lg transition-all ${
                    cart.length === 0 || checkoutLoading
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
  )
}
