export interface LotteryCartItem {
  number: string
  gameName: string
  drawTime: string
  apiDrawTime?: string
  amount: number
  batchId?: string
}

interface SubmitLotteryPurchaseParams {
  baseUrl: string
  authBaseUrl: string
  accessToken: string | null
  appKey: string
  lotteryId: string
  cart: LotteryCartItem[]
  purchasePath: string
  printStatusPath: string
  getGameId: (item: LotteryCartItem) => string
  walletGameId: string
  doubleNumber?: boolean
}

const normalizeTicketNumber = (value: string) => {
  const raw = String(value || '').trim()
  if (raw === '0' || raw === '00') return raw

  const numeric = Number.parseInt(raw, 10)
  if (!Number.isNaN(numeric)) return String(numeric)

  return raw
}

const cleanDrawTime = (drawTime: string) => {
  if (!drawTime) return ''

  // 1. Try to match HH:mm from a full ISO string like 2026-06-11T06:04:00-05:00
  const isoMatch = drawTime.match(/T(\d{2}:\d{2})/)
  if (isoMatch) return isoMatch[1]

  // 2. Try to match HH:mm from a string with space like 2026-06-11 06:04:00
  const spaceMatch = drawTime.match(/\s(\d{2}:\d{2})/)
  if (spaceMatch) return spaceMatch[1]

  // 3. Try to match HH:mm at the start or anywhere in a basic string
  const basicMatch = drawTime.match(/(\d{2}:\d{2})/)
  if (basicMatch) return basicMatch[1]

  return drawTime.replace(/\s*[AP]M\s*/gi, '').trim()
}

const extractOrderNo = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') return null

  const record = value as Record<string, unknown>
  const directKeys = ['order_no', 'orderNo', 'order_number', 'orderNumber', 'order_id', 'orderId', 'order']

  for (const key of directKeys) {
    const directValue = record[key]
    if (typeof directValue === 'string' || typeof directValue === 'number') {
      return String(directValue)
    }
  }

  for (const nestedValue of Object.values(record)) {
    const nestedOrderNo = extractOrderNo(nestedValue)
    if (nestedOrderNo) return nestedOrderNo
  }

  return null
}

const normalizeWalletGameId = (value: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'lottery'

export async function submitLotteryPurchase({
  baseUrl,
  authBaseUrl,
  accessToken,
  appKey,
  lotteryId,
  cart,
  purchasePath,
  printStatusPath,
  getGameId,
  walletGameId,
  doubleNumber = false,
}: SubmitLotteryPurchaseParams) {
  const headers: HeadersInit = {
    'X-App-Key': appKey,
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const groups: Record<string, {
    number: string
    drawTimes: Set<string>
    games: Map<string, number>
  }> = {}

  cart.forEach((item) => {
    const groupKey = item.batchId || item.number

    if (!groups[groupKey]) {
      groups[groupKey] = {
        number: item.number,
        drawTimes: new Set(),
        games: new Map(),
      }
    }

    groups[groupKey].drawTimes.add(cleanDrawTime(item.apiDrawTime || item.drawTime))
    groups[groupKey].games.set(getGameId(item), item.amount)
  })

  const formData = new FormData()

  Object.values(groups).forEach((group, index) => {
    group.drawTimes.forEach((drawTime) => {
      formData.append(`result[${index}][draw_time][]`, drawTime)
    })

    if (doubleNumber) {
      group.number.split('-').map((num) => num.trim()).forEach((num) => {
        formData.append(`result[${index}][number][]`, normalizeTicketNumber(num))
      })
    } else {
      formData.append(`result[${index}][number]`, normalizeTicketNumber(group.number))
    }

    formData.append(`result[${index}][lottery_id]`, lotteryId)

    group.games.forEach((amount, gameId) => {
      formData.append(`result[${index}][game_id][]`, gameId)
      formData.append(`result[${index}][amount][]`, String(amount))
    })
  })

  const purchaseResponse = await fetch(`${baseUrl}${purchasePath}`, {
    method: 'POST',
    headers,
    body: formData,
  })

  const purchaseData = await purchaseResponse.json().catch(() => null)

  if (!purchaseResponse.ok || !(purchaseData?.status === 'success' || purchaseData?.success)) {
    throw new Error(purchaseData?.message || 'Failed to place bet. Please try again.')
  }

  const orderNo = extractOrderNo(purchaseData)
  if (!orderNo) {
    throw new Error('Purchase completed, but order number was not returned.')
  }

  const printStatusResponse = await fetch(`${baseUrl}${printStatusPath}/${orderNo}`, {
    method: 'GET',
    headers,
  })

  const printStatusData = await printStatusResponse.json().catch(() => null)

  if (
    !printStatusResponse.ok ||
    (printStatusData?.status && printStatusData.status !== 'success') ||
    printStatusData?.success === false
  ) {
    throw new Error(printStatusData?.message || 'Print status update failed.')
  }

  const totalAmount = cart.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const debitPayload = {
    amount: Number(totalAmount.toFixed(2)),
    gameId: normalizeWalletGameId(walletGameId),
    idempotencyKey: `purchase-${Date.now()}`,
    metadata: {
      multiplier: 1.0,
      type: 'purchase',
      message: 'Purchased successfully',
      order_id: orderNo,
      lottery_id: lotteryId,
    },
  }

  const debitResponse = await fetch(`${authBaseUrl.replace(/\/$/, '')}/games/wallet/debit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(debitPayload),
  })

  const debitData = await debitResponse.json().catch(() => null)

  if (!debitResponse.ok || debitData?.success === false) {
    throw new Error(debitData?.message || 'Wallet debit failed after purchase.')
  }

  return { purchaseData, printStatusData, debitData, orderNo }
}
