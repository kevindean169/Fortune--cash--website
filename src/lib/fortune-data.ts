export type PageId =
  | 'home'
  | 'games'
  | 'cash-pop'
  | 'pick-2'
  | 'pick-3'
  | 'pick-4'
  | 'results'
  | 'dashboard'
  | 'tickets'
  | 'wallet'
  | 'promotions'
  | 'responsible-gaming'
  | 'contact'
  | 'profile'
  | 'my-lotteries'
  | 'my-winnings'
  | 'mobile-app'
  | 'support'

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
    id: 'cash-pop',
    name: 'Cash Pop',
    tagline: 'Pop for instant prizes',
    jackpot: '$2,500',
    nextDraw: 'Every 4 min',
    drawTime: 'Continuous',
    price: '$1',
    color: 'from-amber-500 to-orange-500',
    bgClass: 'bg-amber-500',
    icon: '💎',
    maxPick: 1,
    poolSize: 15,
    description: 'Pick one number from 1–15. Match it to win up to $2,500!',
  },
  {
    id: 'pick-2',
    name: 'Pick 2',
    tagline: 'Two numbers, big wins',
    jackpot: '$50',
    nextDraw: 'Tonight 7:29 PM',
    drawTime: '7:29 PM daily',
    price: '$0.50',
    color: 'from-sky-500 to-blue-600',
    bgClass: 'bg-sky-500',
    icon: '✌️',
    maxPick: 2,
    poolSize: 10,
    description: 'Choose 2 digits (0–9). Match in exact or any order to win.',
  },
  {
    id: 'pick-3',
    name: 'Pick 3',
    tagline: 'Classic daily lottery',
    jackpot: '$500',
    nextDraw: 'Tonight 7:29 PM',
    drawTime: '7:29 PM daily',
    price: '$0.50',
    color: 'from-emerald-500 to-teal-600',
    bgClass: 'bg-emerald-500',
    icon: '🎯',
    maxPick: 3,
    poolSize: 10,
    description: 'Select 3 digits (0–9). Win up to $500 with exact or any order match.',
  },
  {
    id: 'pick-4',
    name: 'Pick 4',
    tagline: 'Four numbers, max reward',
    jackpot: '$5,000',
    nextDraw: 'Tonight 7:29 PM',
    drawTime: '7:29 PM daily',
    price: '$0.50',
    color: 'from-rose-500 to-red-600',
    bgClass: 'bg-rose-500',
    icon: '🔥',
    maxPick: 4,
    poolSize: 10,
    description: 'Pick 4 digits (0–9). Match exactly to win the top prize of $5,000!',
  },
]

export const RECENT_RESULTS: DrawResult[] = [
  { date: 'Today, 7:29 PM', game: 'Pick 4', numbers: [3, 7, 1, 9], jackpot: '$5,000', winners: 4 },
  { date: 'Today, 7:29 PM', game: 'Pick 3', numbers: [4, 2, 8], jackpot: '$500', winners: 12 },
  { date: 'Today, 7:29 PM', game: 'Pick 2', numbers: [6, 1], jackpot: '$50', winners: 87 },
  { date: 'Today, 4:00 PM', game: 'Cash Pop', numbers: [11], jackpot: '$2,500', winners: 2 },
  { date: 'Yesterday, 7:29 PM', game: 'Pick 4', numbers: [0, 5, 8, 3], jackpot: '$5,000', winners: 1 },
  { date: 'Yesterday, 7:29 PM', game: 'Pick 3', numbers: [7, 7, 2], jackpot: '$500', winners: 8 },
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
  { initials: 'J.K.', location: 'Miami, FL', prize: '$5,000', game: 'Pick 4', date: 'Jun 02' },
  { initials: 'M.R.', location: 'Tampa, FL', prize: '$2,500', game: 'Cash Pop', date: 'Jun 01' },
  { initials: 'A.T.', location: 'Orlando, FL', prize: '$500', game: 'Pick 3', date: 'Jun 01' },
  { initials: 'D.S.', location: 'Jacksonville, FL', prize: '$5,000', game: 'Pick 4', date: 'May 31' },
]
