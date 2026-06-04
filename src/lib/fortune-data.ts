export type PageId =
  | 'home'
  | 'lotteries'
  | 'cashpot'
  | 'money-time'
  | 'pick-2-single'
  | 'pick-2-double'
  | 'results'
  | 'dashboard'
  | 'tickets'
  | 'wallet'
  | 'responsible-gaming'
  | 'contact'
  | 'profile'
  | 'my-lotteries'
  | 'my-winnings'
  | 'mobile-app'
  | 'support'
  | 'login'
  | 'register'
  | 'transactions'
  | 'winners'

export interface Game {
  id: PageId
  name: string
  tagline: string
  jackpot: string
  nextDraw: string
  drawTime: string
  price: string
  color: string
  bgClass: string
  icon: string
  maxPick: number
  poolSize: number
  description: string
}

export interface DrawResult {
  date: string
  game: string
  numbers: number[]
  jackpot: string
  winners: number
}

export interface Ticket {
  id: string
  game: string
  numbers: number[]
  drawDate: string
  purchaseDate: string
  status: 'active' | 'won' | 'lost' | 'pending'
  prize?: string
  multiplier?: number
}

export interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'purchase' | 'prize'
  amount: number
  date: string
  description: string
  status: 'completed' | 'pending' | 'failed'
}

export const GAMES: Game[] = [
  {
    id: 'cashpot',
    name: 'Jamaica Cashpot',
    tagline: 'Pick 01–36 for big wins',
    jackpot: '$850,000',
    nextDraw: 'Daily',
    drawTime: 'Multiple times daily',
    price: '$100',
    color: 'from-amber-500 to-orange-500',
    bgClass: 'bg-amber-500',
    icon: '💎',
    maxPick: 1,
    poolSize: 36,
    description: 'Pick 01–36. Win up to 26× your bet. Add Mega & Monsta balls for bigger prizes.',
  },
  {
    id: 'money-time',
    name: 'Money Time',
    tagline: 'Special fixed daily slots',
    jackpot: '$240,000',
    nextDraw: 'Daily',
    drawTime: 'Fixed daily slots',
    price: '$100',
    color: 'from-emerald-500 to-teal-600',
    bgClass: 'bg-emerald-500',
    icon: '🎯',
    maxPick: 1,
    poolSize: 36,
    description: 'Special Cashpot draws at fixed daily time slots. Same rules, extra chances.',
  },
  {
    id: 'pick-2-single',
    name: 'Pick 2 Single',
    tagline: 'One two-digit number',
    jackpot: '$120,000',
    nextDraw: 'Daily',
    drawTime: 'Daily',
    price: '$100',
    color: 'from-sky-500 to-blue-600',
    bgClass: 'bg-sky-500',
    icon: '✌️',
    maxPick: 2,
    poolSize: 10,
    description: 'Select one two-digit number from 00–99. Simple, clean, great payout ratio.',
  },
  {
    id: 'pick-2-double',
    name: 'Pick 2 Double',
    tagline: 'Bet on two numbers',
    jackpot: '$120,000',
    nextDraw: 'Daily',
    drawTime: 'Daily',
    price: '$100',
    color: 'from-rose-500 to-red-600',
    bgClass: 'bg-rose-500',
    icon: '🔥',
    maxPick: 2,
    poolSize: 10,
    description: 'Bet on two numbers. Win straight, box, or single-match combinations.',
  },
]

export const RECENT_RESULTS: DrawResult[] = [
  { date: 'Today, 7:29 PM', game: 'Cashpot', numbers: [24], jackpot: '$850,000', winners: 4 },
  { date: 'Today, 7:29 PM', game: 'Money Time', numbers: [15], jackpot: '$240,000', winners: 12 },
  { date: 'Today, 7:29 PM', game: 'Pick 2 Single', numbers: [8, 9], jackpot: '$120,000', winners: 87 },
  { date: 'Today, 4:00 PM', game: 'Pick 2 Double', numbers: [1, 2], jackpot: '$120,000', winners: 2 },
  { date: 'Yesterday, 7:29 PM', game: 'Cashpot', numbers: [3], jackpot: '$850,000', winners: 1 },
  { date: 'Yesterday, 7:29 PM', game: 'Money Time', numbers: [27], jackpot: '$240,000', winners: 8 },
]

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 'T-001',
    game: 'Pick 4',
    numbers: [3, 7, 1, 9],
    drawDate: 'Jun 02, 2026',
    purchaseDate: 'Jun 02, 2026',
    status: 'won',
    prize: '$5,000',
    multiplier: 2,
  },
  {
    id: 'T-002',
    game: 'Pick 3',
    numbers: [4, 2, 8],
    drawDate: 'Jun 02, 2026',
    purchaseDate: 'Jun 02, 2026',
    status: 'won',
    prize: '$250',
  },
  {
    id: 'T-003',
    game: 'Cash Pop',
    numbers: [7],
    drawDate: 'Jun 02, 2026',
    purchaseDate: 'Jun 02, 2026',
    status: 'active',
  },
  {
    id: 'T-004',
    game: 'Pick 2',
    numbers: [6, 1],
    drawDate: 'Jun 02, 2026',
    purchaseDate: 'Jun 02, 2026',
    status: 'lost',
  },
  {
    id: 'T-005',
    game: 'Pick 4',
    numbers: [1, 2, 3, 4],
    drawDate: 'Jun 03, 2026',
    purchaseDate: 'Jun 02, 2026',
    status: 'pending',
  },
]

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TXN-001', type: 'prize', amount: 5000, date: 'Jun 02, 2026', description: 'Pick 4 Prize Win', status: 'completed' },
  { id: 'TXN-002', type: 'prize', amount: 250, date: 'Jun 02, 2026', description: 'Pick 3 Prize Win', status: 'completed' },
  { id: 'TXN-003', type: 'purchase', amount: -1.50, date: 'Jun 02, 2026', description: '3x Tickets purchased', status: 'completed' },
  { id: 'TXN-004', type: 'deposit', amount: 50, date: 'Jun 01, 2026', description: 'Wallet top-up', status: 'completed' },
  { id: 'TXN-005', type: 'purchase', amount: -0.50, date: 'Jun 01, 2026', description: 'Pick 2 Ticket', status: 'completed' },
  { id: 'TXN-006', type: 'withdrawal', amount: -100, date: 'May 31, 2026', description: 'Bank withdrawal', status: 'completed' },
]

export const PROMOTIONS = [
  {
    id: 1,
    title: 'Welcome Bonus',
    subtitle: 'First Purchase Offer',
    description: 'Get 10 free Cash Pop plays with your first ticket purchase of $5 or more.',
    badge: 'NEW PLAYER',
    badgeClass: 'bg-fortune-gold text-fortune-navy',
    expiry: 'Limited time',
    value: '10 FREE PLAYS',
  },
  {
    id: 2,
    title: 'Mega Monday',
    subtitle: 'Weekly Special',
    description: 'Every Monday, enjoy 2x prizes on all Pick 3 and Pick 4 tickets. No code needed.',
    badge: 'WEEKLY',
    badgeClass: 'bg-fortune-blue text-white',
    expiry: 'Every Monday',
    value: '2X PRIZES',
  },
  {
    id: 3,
    title: 'Lucky Streak',
    subtitle: 'Loyalty Reward',
    description: 'Play 7 days in a row and earn a $5 free play credit automatically.',
    badge: 'LOYALTY',
    badgeClass: 'bg-emerald-600 text-white',
    expiry: 'Ongoing',
    value: '$5 CREDIT',
  },
  {
    id: 4,
    title: 'Refer & Earn',
    subtitle: 'Share the Luck',
    description: 'Invite a friend who signs up and makes a purchase. You both get $2 in free plays.',
    badge: 'REFERRAL',
    badgeClass: 'bg-rose-600 text-white',
    expiry: 'Ongoing',
    value: '$2 EACH',
  },
]

export const WINNERS = [
  { initials: 'J.K.', location: 'Kingston', prize: '$850,000', game: 'Cashpot', date: 'Jun 02' },
  { initials: 'M.R.', location: 'Montego Bay', prize: '$240,000', game: 'Money Time', date: 'Jun 01' },
  { initials: 'A.T.', location: 'Ocho Rios', prize: '$120,000', game: 'Pick 2 Single', date: 'Jun 01' },
  { initials: 'D.S.', location: 'Negril', prize: '$850,000', game: 'Cashpot', date: 'May 31' },
]
