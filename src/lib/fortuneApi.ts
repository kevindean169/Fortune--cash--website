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

export interface ApiDrawResult {
  id: string
  type: string
  lottery_name: string
  draw_no: string
  draw_time: string
  game_label: string
  number: string
  numbers: string[]
  megaball?: string
  monstaball?: string
}

export interface ApiWinningGame {
  game_name: string
  bet: string
  result: string
  bet_amount: number
  win_amount: number
}

export interface ApiWinningOrder {
  lottery_id?: number
  order_no: string
  card_id?: string
  status: string
  paid_by?: string
  agent_name?: string
  lottery_name: string
  customer_name: string
  customer_contact?: string
  created_at: string
  paid_at?: string
  draw_no: string
  total_bet: number
  total_won: number
  draw_date: string
  draw_time: string
  bet_no: string
  games: ApiWinningGame[]
}

export interface ApiCustomerDashboard {
  total_winning_count: number
  total_winnings: number
  total_payout: number
  total_unpayout: number
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



function parseAndFormatDrawDatetime(rawDate: string, rawTime: string) {
  let dateVal = rawDate || '-'
  let timeVal = rawTime || '-'

  if (!rawDate) return { date: dateVal, time: timeVal }

  let isoDate = ''
  const d = new Date(rawDate)
  if (!isNaN(d.getTime())) {
    const pad = (n: number) => String(n).padStart(2, '0')
    isoDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  } else {
    isoDate = rawDate.substring(0, 10)
  }

  let isoTime = '00:00:00'
  if (rawTime) {
    let timeStr = rawTime.trim()
    let isPM = timeStr.toUpperCase().includes('PM')
    let isAM = timeStr.toUpperCase().includes('AM')
    
    timeStr = timeStr.replace(/[ap]m/i, '').trim()
    const parts = timeStr.split(':')
    
    let hours = parseInt(parts[0] || '0', 10)
    let mins = parseInt(parts[1] || '0', 10)
    let secs = parseInt(parts[2] || '0', 10)

    if (isPM && hours < 12) hours += 12
    if (isAM && hours === 12) hours = 0

    const pad = (n: number) => String(n).padStart(2, '0')
    isoTime = `${pad(hours)}:${pad(mins)}:${pad(secs)}`
  }

  const combinedStr = `${isoDate}T${isoTime}-05:00`
  const parsedDate = new Date(combinedStr)

  if (!isNaN(parsedDate.getTime())) {
    dateVal = parsedDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    timeVal = parsedDate.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return { date: dateVal, time: timeVal }
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
  const meta = getRecord(body, 'meta')
  const pagination = getRecord(body, 'pagination')
  
  // Try to find the pagination data in various common locations
  const source = getRecord(data, 'data') || meta || pagination || data || (isRecord(body) ? body : undefined)

  return {
    currentPage: pickNumber(source, ['current_page', 'currentPage', 'page'], 1) || pickNumber(body, ['current_page', 'currentPage', 'page'], 1),
    lastPage: pickNumber(source, ['last_page', 'lastPage', 'pages', 'totalPages', 'total_pages'], 1) || pickNumber(body, ['last_page', 'lastPage', 'pages', 'totalPages', 'total_pages'], 1),
    total: pickOptionalNumber(source, ['total']) || pickOptionalNumber(body, ['total']),
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
    const parsedDraw = parseAndFormatDrawDatetime(rawDrawDate, rawDrawTime)
    drawDateVal = parsedDraw.date
    drawTimeVal = parsedDraw.time
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

function splitNumbers(value: string): string[] {
  if (!value) return []
  return value
    .split(/[,\s-]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function compactDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function chunkString(value: string, size: number): string[] {
  if (!value || size <= 0) return []
  const chunks: string[] = []

  for (let index = 0; index < value.length; index += size) {
    chunks.push(value.slice(index, index + size))
  }

  return chunks.filter(Boolean)
}

function normalizeResultNumbers(type: string, directNumber: string, winningNumbers: string[]): string[] {
  const normalizedType = type.toLowerCase()
  const rawJoined = directNumber || winningNumbers.join('')

  if (normalizedType.includes('pick') && normalizedType.includes('single')) {
    if (directNumber) return [directNumber.trim()]

    const digits = compactDigits(rawJoined)
    if (digits) return [digits]
    if (winningNumbers.length > 0) return [winningNumbers.join('')]
  }

  if (normalizedType.includes('pick') && normalizedType.includes('double')) {
    if (directNumber) {
      const directParts = directNumber
        .split(/[,\s/]+/)
        .map((item) => item.trim())
        .filter(Boolean)

      if (directParts.length >= 2) return directParts.slice(0, 2)
    }

    const digits = compactDigits(rawJoined)
    if (digits.length >= 4) return chunkString(digits, 2).slice(0, 2)
    if (winningNumbers.length >= 2) return winningNumbers.slice(0, 2)
  }

  if (winningNumbers.length > 0) return winningNumbers
  return splitNumbers(directNumber)
}

function mapResult(raw: unknown): ApiDrawResult {
  const type = pickString(raw, ['type_key', 'type', 'lottery_type', 'game_type'], '')
  const lotteryName = pickString(raw, ['lottery_name', 'name', 'game_name', 'lottery'], type || 'Result')
  const directNumber = pickString(raw, ['number', 'cashpot_no', 'winning_number', 'result', 'bet_no'], '')
  const winningNumbers = getArray(raw, ['winning_numbers', 'numbers', 'result_numbers'])
    .map((item) => (typeof item === 'string' || typeof item === 'number' ? String(item) : ''))
    .filter(Boolean)
  const normalizedNumbers = normalizeResultNumbers(type, directNumber, winningNumbers)
  const number = directNumber || normalizedNumbers.join(',')
  const rawDrawTime = pickString(raw, ['utc_draw_time', 'draw_at', 'created_at', 'date'], '')
  const fallbackDrawTime = pickString(raw, ['draw_datetime', 'draw_time_human', 'draw_date'], '')
  const drawAt = rawDrawTime ? normalizeDate(rawDrawTime) : fallbackDrawTime

  return {
    id: pickString(raw, ['id', 'draw_no', 'draw_number'], `${lotteryName}-${drawAt}-${number}`),
    type,
    lottery_name: lotteryName,
    draw_no: pickString(raw, ['draw_no', 'draw_number', 'drawNo'], ''),
    draw_time: drawAt || '-',
    game_label: pickString(raw, ['game_label'], normalizedNumbers.length > 1 ? 'Double' : 'Single'),
    number,
    numbers: normalizedNumbers,
    megaball: pickString(raw, ['megaball', 'mega_ball'], ''),
    monstaball: pickString(raw, ['monstaball', 'monsta_ball'], ''),
  }
}

function mapWinningGame(raw: unknown): ApiWinningGame {
  return {
    game_name: pickString(raw, ['game_name', 'game', 'name', 'lottery_name'], 'Ticket'),
    bet: pickString(raw, ['bet', 'ticket_number', 'number', 'lucky_no', 'value'], '-'),
    result: pickString(raw, ['result', 'winning_number', 'number'], '-'),
    bet_amount: pickNumber(raw, ['bet_amount', 'amount', 'price', 'stake']),
    win_amount: pickNumber(raw, ['win_amount', 'winning_amount', 'won_amount', 'payout']),
  }
}

function mapWinning(raw: unknown): ApiWinningOrder {
  const customer = getRecord(raw, 'customer') || getRecord(raw, 'user')
  const games = getArray(raw, ['games', 'bets', 'tickets', 'details', 'winning_details']).map(mapWinningGame)
  const rawDrawDate = pickString(raw, ['draw_date', 'date'], '')
  const rawDrawTime = pickString(raw, ['draw_time', 'draw_slot_time', 'slot_time'], '')
  const drawStamp = rawDrawTime || rawDrawDate
  const parsedDraw = parseAndFormatDrawDatetime(rawDrawDate || drawStamp, rawDrawTime || drawStamp)

  const rawTotalWon = pickNumber(raw, ['total_won', 'win_amount', 'winning_amount', 'won_amount', 'payout'])
  const calculatedTotalWon = games.reduce((sum, g) => sum + g.win_amount, 0)
  const finalTotalWon = rawTotalWon > 0 ? rawTotalWon : calculatedTotalWon

  const rawTotalBet = pickNumber(raw, ['total_bet', 'bet_amount', 'total_amount', 'amount'])
  const calculatedTotalBet = games.reduce((sum, g) => sum + g.bet_amount, 0)
  const finalTotalBet = rawTotalBet > 0 ? rawTotalBet : calculatedTotalBet

  return {
    lottery_id: pickNumber(raw, ['lottery_id'], 0),
    order_no: pickString(raw, ['order_no', 'order_id', 'id', 'ticket_id'], '-'),
    card_id: pickString(raw, ['card_id', 'card_no'], ''),
    status: pickString(raw, ['status', 'payment_status'], 'paid'),
    paid_by: pickString(raw, ['paid_by', 'paid_via', 'payout_by'], ''),
    agent_name: pickString(raw, ['agent_name', 'agent'], ''),
    lottery_name: pickString(raw, ['lottery_name', 'lottery', 'name'], 'Lottery'),
    customer_name: pickString(raw, ['customer_name', 'name'], pickString(customer, ['name', 'username'], '-')),
    customer_contact: pickString(raw, ['customer_contact', 'phone', 'mobile'], pickString(customer, ['phone', 'mobile'], '')),
    created_at: normalizeDate(pickString(raw, ['created_at', 'createdAt', 'date'], '')),
    paid_at: normalizeDate(pickString(raw, ['paid_at', 'paidAt', 'updated_at'], '')),
    draw_no: pickString(raw, ['draw_no', 'draw_number', 'drawNo'], ''),
    total_bet: finalTotalBet,
    total_won: finalTotalWon,
    draw_date: parsedDraw.date,
    draw_time: parsedDraw.time,
    bet_no: pickString(raw, ['bet_no', 'ticket_number', 'number', 'lucky_no'], games[0]?.bet || '-'),
    games: games.length > 0 ? games : [{
      game_name: pickString(raw, ['game_name', 'lottery_name', 'lottery'], 'Ticket'),
      bet: pickString(raw, ['bet_no', 'ticket_number', 'number', 'lucky_no'], '-'),
      result: pickString(raw, ['result', 'winning_number', 'number'], '-'),
      bet_amount: pickNumber(raw, ['bet_amount', 'amount', 'price', 'stake']),
      win_amount: pickNumber(raw, ['win_amount', 'winning_amount', 'won_amount', 'payout']),
    }],
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

export async function fetchResults(type: string, page = 1, perPage = 10): Promise<ApiListResult<ApiDrawResult>> {
  const body = await request(`/api/results?type=${encodeURIComponent(type)}&per_page=${perPage}&page=${page}`)
  const items = getArray(body, ['results', 'items', 'records', 'data']).map(mapResult)

  return {
    items,
    ...listMeta(body),
  }
}

export async function fetchCustomerWinnings(token: string, page = 1, perPage = 10): Promise<ApiListResult<ApiWinningOrder>> {
  const body = await request(`/api/customer/winnings?per_page=${perPage}&page=${page}`, token)
  const items = getArray(body, ['winnings', 'items', 'records', 'data']).map(mapWinning)

  return {
    items,
    ...listMeta(body),
  }
}

export async function fetchCustomerDashboard(token: string): Promise<ApiCustomerDashboard> {
  const data = unwrapContent(await request('/api/customer/my-dashboard', token))

  return {
    total_winning_count: pickNumber(data, ['total_winning_count', 'winning_count', 'total_wins']),
    total_winnings: pickNumber(data, ['total_winnings', 'total_won', 'winning_amount']),
    total_payout: pickNumber(data, ['total_payout', 'payout']),
    total_unpayout: pickNumber(data, ['total_unpayout', 'unpayout', 'pending_payout']),
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
