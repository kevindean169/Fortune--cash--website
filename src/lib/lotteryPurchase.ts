export interface LotteryCartItem {
  number: string
  gameName: string
  drawTime: string
  amount: number
}

interface SubmitLotteryPurchaseParams {
  baseUrl: string
  accessToken: string | null
  appKey: string
  lotteryId: string
  cart: LotteryCartItem[]
  purchasePath: string
  printStatusPath: string
  getGameId: (item: LotteryCartItem) => string
  doubleNumber?: boolean
}

const cleanDrawTime = (drawTime: string) => {
  const dateTimeMatch = drawTime.match(/(\d{2}:\d{2})(?::\d{2})?\s*(?:[AP]M)?\s*$/i)
  if (dateTimeMatch) return dateTimeMatch[1]

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

export async function submitLotteryPurchase({
  baseUrl,
  accessToken,
  appKey,
  lotteryId,
  cart,
  purchasePath,
  printStatusPath,
  getGameId,
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
    if (!groups[item.number]) {
      groups[item.number] = {
        number: item.number,
        drawTimes: new Set(),
        games: new Map(),
      }
    }

    groups[item.number].drawTimes.add(cleanDrawTime(item.drawTime))
    groups[item.number].games.set(getGameId(item), item.amount)
  })

  const formData = new FormData()

  Object.values(groups).forEach((group, index) => {
    group.drawTimes.forEach((drawTime) => {
      formData.append(`result[${index}][draw_time][]`, drawTime)
    })

    if (doubleNumber) {
      group.number.split('-').map((num) => num.trim()).forEach((num) => {
        formData.append(`result[${index}][number][]`, num)
      })
    } else {
      formData.append(`result[${index}][number]`, group.number)
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

  return { purchaseData, printStatusData, orderNo }
}
