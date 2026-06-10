const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://staging.fortunescash.com').replace(/\/$/, '')

export interface ApiListResult<T> {
  items: T[]
  currentPage: number
  lastPage: number
  total?: number
}

export interface ApiGameBet {
  ticket_number: string
  game_name: string
  draw_time: string
  bet_amount: number
  status?: string
  payout?: number
}

export interface ApiTicketOrder {
  lottery_id?: number
  order_no: string
  card_id?: string
  transaction_id?: string
  status: string
  lottery_name: string
  lottery_type: string
  customer_name: string
  customer_contact?: string
  created_at: string
  draw_date: string
  draw_time: string
  draw_no: string
  games: ApiGameBet[]
}

export interface ApiTransaction {
  id: string
  type: string
  amount: number
  method: string
  date: string
  status: string
  positive: boolean
}

export interface AboutContent {
  title: string
  content: string
  image?: string
}

export interface ContactContent {
  title: string
  content: string
  address: string
  phone: string
  email: string
  mobile_community?: string
}

export interface FaqItem {
  question: string
  answer: string
}

type ApiRecord = Record<string, unknown>

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getRecord(value: unknown, key: string): ApiRecord | undefined {
  if (!isRecord(value)) return undefined
  const child = value[key]
  return isRecord(child) ? child : undefined
}

function getArray(value: unknown, keys: string[]): unknown[] {
  if (Array.isArray(value)) return value
  if (!isRecord(value)) return []

  for (const key of keys) {
    const child = value[key]
    if (Array.isArray(child)) return child
  }

  const nestedData = value.data
  if (nestedData && nestedData !== value) {
    const nestedItems = getArray(nestedData, keys)
    if (nestedItems.length > 0) return nestedItems
  }

  return []
}

function pickString(source: unknown, keys: string[], fallback = ''): string {
  if (!isRecord(source)) return fallback

  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim() !== '') return value
    if (typeof value === 'number') return String(value)
  }

  return fallback
}

function pickNumber(source: unknown, keys: string[], fallback = 0): number {
  if (!isRecord(source)) return fallback

  for (const key of keys) {
    const value = source[key]
    const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.replace(/[$,]/g, '')) : NaN
    if (Number.isFinite(parsed)) return parsed
  }

  return fallback
}

function pickOptionalNumber(source: unknown, keys: string[]): number | undefined {
  if (!isRecord(source)) return undefined

  for (const key of keys) {
    const value = source[key]
    const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.replace(/[$,]/g, '')) : NaN
    if (Number.isFinite(parsed)) return parsed
  }

  return undefined
}

function parseJamaicaDate(value: string): Date {
  if (!value) return new Date(NaN)
  let cleaned = value.trim()
  
  // If it already has Z, GMT, or an explicit timezone offset, parse it as-is
  if (cleaned.endsWith('Z') || /[\+\-]\d{2}:?\d{2}$/.test(cleaned) || cleaned.includes('GMT')) {
    return new Date(cleaned)
  }
  
  // Try to parse using native Date parser
  const tempDate = new Date(cleaned)
  if (!isNaN(tempDate.getTime())) {
    // Extract local time components and assume they are America/Jamaica (UTC-5)
    const year = tempDate.getFullYear()
    const month = tempDate.getMonth()
    const date = tempDate.getDate()
    const hours = tempDate.getHours()
    const minutes = tempDate.getMinutes()
    const seconds = tempDate.getSeconds()
    
    const pad = (n: number) => String(n).padStart(2, '0')
    const isoStr = `${year}-${pad(month + 1)}-${pad(date)}T${pad(hours)}:${pad(minutes)}:${pad(seconds)}-05:00`
    return new Date(isoStr)
  }
  
  if (cleaned.includes(' ')) {
    cleaned = cleaned.replace(' ', 'T')
  }
  // Append Jamaica offset (UTC-5)
  return new Date(cleaned + '-05:00')
}

function normalizeDate(value: string): string {
  if (!value) return '-'
  const parsed = parseJamaicaDate(value)
  if (Number.isNaN(parsed.getTime())) return value

  return parsed.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function normalizeTicketStatus(status: string): string {
  const normalized = status.toLowerCase().trim()

  if (normalized === '1' || normalized === 'void') return 'void'
  if (normalized === '0' || normalized === 'unvoid' || normalized === 'purchase' || normalized === 'purchased') return 'purchase'

  return normalized || 'purchase'
}

function authHeaders(token?: string): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(endpoint: string, token?: string): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Accept: 'application/json',
      ...authHeaders(token),
    },
  })

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const message = pickString(body, ['message', 'error'], 'Unable to load data.')
    throw new Error(message)
  }

  return body
}

function listMeta(body: unknown): Omit<ApiListResult<never>, 'items'> {
  const data = getRecord(body, 'data')
  const source = getRecord(data, 'data') || data || (isRecord(body) ? body : undefined)

  return {
    currentPage: pickNumber(source, ['current_page', 'currentPage', 'page'], 1),
    lastPage: pickNumber(source, ['last_page', 'lastPage', 'pages'], 1),
    total: pickOptionalNumber(source, ['total']),
  }
}

function unwrapContent(body: unknown): ApiRecord {
  return getRecord(body, 'data') || (isRecord(body) ? body : {})
}

function mapGame(raw: unknown): ApiGameBet {
  return {
    ticket_number: pickString(raw, ['ticket_number', 'number', 'bet', 'lucky_no', 'value'], '-'),
    game_name: pickString(raw, ['game_name', 'game', 'name', 'type'], 'Ticket'),
    draw_time: pickString(raw, ['draw_time', 'drawTime'], '-'),
    bet_amount: pickNumber(raw, ['bet_amount', 'amount', 'price', 'stake']),
    status: normalizeTicketStatus(pickString(raw, ['status', 'result'], '')),
    payout: pickNumber(raw, ['payout', 'winning_amount', 'won_amount', 'win_amount']),
  }
}

function mapTicket(raw: unknown): ApiTicketOrder {
  const lottery = getRecord(raw, 'lottery')
  const customer = getRecord(raw, 'customer') || getRecord(raw, 'user')
  const games = getArray(raw, ['games', 'bets', 'tickets', 'details', 'ticket_details']).map(mapGame)
  const orderNo = pickString(raw, ['order_no', 'order_id', 'id', 'ticket_id'], '-')
  const fallbackGames = games.length > 0 ? games : [{
    ticket_number: pickString(raw, ['ticket_number', 'number', 'bet', 'lucky_no'], '-'),
    game_name: pickString(raw, ['game_name', 'lottery_name', 'lottery'], pickString(lottery, ['name', 'title'], 'Ticket')),
    draw_time: pickString(raw, ['draw_time', 'drawTime'], '-'),
    bet_amount: pickNumber(raw, ['bet_amount', 'amount', 'price', 'total']),
    status: normalizeTicketStatus(pickString(raw, ['status', 'result'], '')),
    payout: pickNumber(raw, ['payout', 'winning_amount', 'won_amount', 'win_amount']),
  }]

  const rawDrawDate = pickString(raw, ['draw_date', 'drawDate'], '')
  const rawDrawTime = pickString(raw, ['draw_time', 'drawTime'], '')
  
  let drawDateVal = '-'
  let drawTimeVal = '-'
  
  if (rawDrawDate) {
    let datePart = ''
    const d = new Date(rawDrawDate)
    if (!isNaN(d.getTime())) {
      const pad = (n: number) => String(n).padStart(2, '0')
      datePart = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    } else {
      datePart = rawDrawDate.substring(0, 10)
    }
    const timePart = rawDrawTime.includes(' ') ? rawDrawTime.split(' ')[1] : rawDrawTime
    
    // Normalize timePart to HH:MM:SS
    let formattedTime = '00:00:00'
    if (timePart) {
      const parts = timePart.split(':')
      if (parts.length === 1) {
        formattedTime = `${parts[0].padStart(2, '0')}:00:00`
      } else if (parts.length === 2) {
        formattedTime = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`
      } else if (parts.length === 3) {
        formattedTime = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`
      }
    }
    
    const combinedStr = `${datePart}T${formattedTime}`
    const parsedDrawDate = parseJamaicaDate(combinedStr)
    if (!isNaN(parsedDrawDate.getTime())) {
      drawDateVal = parsedDrawDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      drawTimeVal = parsedDrawDate.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    } else {
      drawDateVal = rawDrawDate
      drawTimeVal = rawDrawTime || '-'
    }
  }

  return {
    lottery_id: pickNumber(raw, ['lottery_id'], 0),
    order_no: orderNo,
    card_id: pickString(raw, ['card_id', 'card_no'], ''),
    transaction_id: pickString(raw, ['transaction_id', 'txn_id', 'receipt_id'], orderNo),
    status: normalizeTicketStatus(pickString(raw, ['status'], '0')),
    lottery_name: pickString(raw, ['lottery_name', 'lottery'], pickString(lottery, ['name', 'title'], 'Lottery')),
    lottery_type: pickString(raw, ['lottery_type', 'type'], pickString(lottery, ['type'], '')),
    customer_name: pickString(raw, ['customer_name', 'name'], pickString(customer, ['name', 'username'], '-')),
    customer_contact: pickString(raw, ['customer_contact', 'phone', 'mobile'], pickString(customer, ['phone', 'mobile'], '')),
    created_at: normalizeDate(pickString(raw, ['created_at', 'createdAt', 'purchased_on', 'date'], '')),
    draw_date: drawDateVal,
    draw_time: drawTimeVal,
    draw_no: pickString(raw, ['draw_no', 'draw_number', 'drawNo'], ''),
    games: fallbackGames,
  }
}

function mapTransaction(raw: unknown): ApiTransaction {
  const type = pickString(raw, ['type', 'transaction_type', 'category', 'reason'], 'Transaction')
  const amount = pickNumber(raw, ['amount', 'total', 'value'])
  const normalizedType = type.toLowerCase()
  const debitType = ['withdrawal', 'withdraw', 'purchase', 'ticket', 'debit'].some((word) => normalizedType.includes(word))
  const creditType = ['deposit', 'payout', 'winning', 'credit'].some((word) => normalizedType.includes(word))
  const positive = creditType || (!debitType && amount >= 0)

  return {
    id: pickString(raw, ['transaction_id', 'txn_id', 'order_id', 'order_no', 'id'], '-'),
    type,
    amount,
    method: pickString(raw, ['method', 'payment_method', 'mode'], 'Wallet Balance'),
    date: normalizeDate(pickString(raw, ['created_at', 'createdAt', 'date', 'time'], '')),
    status: pickString(raw, ['status'], 'Completed'),
    positive,
  }
}

export async function fetchTickets(token: string, page = 1, perPage = 10): Promise<ApiListResult<ApiTicketOrder>> {
  const body = await request(`/api/customer/tickets?per_page=${perPage}&page=${page}`, token)
  const items = getArray(body, ['tickets', 'items', 'records', 'data']).map(mapTicket)

  return {
    items,
    ...listMeta(body),
  }
}

export async function fetchTransactions(token: string, page = 1, perPage = 10): Promise<ApiListResult<ApiTransaction>> {
  const body = await request(`/api/customer/transactions?per_page=${perPage}&page=${page}`, token)
  const items = getArray(body, ['transactions', 'items', 'records', 'data']).map(mapTransaction)

  return {
    items,
    ...listMeta(body),
  }
}

export async function fetchAboutUs(): Promise<AboutContent> {
  const data = unwrapContent(await request('/api/aboutUs'))

  return {
    title: pickString(data, ['title'], 'About Us'),
    content: pickString(data, ['content'], ''),
    image: pickString(data, ['image'], ''),
  }
}

export async function fetchContactUs(): Promise<ContactContent> {
  const data = unwrapContent(await request('/api/contactUs'))

  return {
    title: pickString(data, ['title'], 'Contact Us'),
    content: pickString(data, ['content'], ''),
    address: pickString(data, ['address'], ''),
    phone: pickString(data, ['phone'], ''),
    email: pickString(data, ['email'], ''),
    mobile_community: pickString(data, ['mobile_community'], ''),
  }
}

export async function fetchFaq(): Promise<{ image?: string; questions: FaqItem[] }> {
  const data = unwrapContent(await request('/api/faq'))
  const questions = getArray(data, ['questions', 'faqs', 'items']).map((item) => ({
    question: pickString(item, ['question', 'q', 'title'], ''),
    answer: pickString(item, ['answer', 'a', 'content'], ''),
  })).filter((item) => item.question || item.answer)

  return {
    image: pickString(data, ['image'], ''),
    questions,
  }
}
