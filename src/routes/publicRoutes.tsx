import type { RouteObject } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { LotteriesPage } from '@/pages/LotteriesPage'
import { CashpotPage } from '@/pages/CashpotPage'
import { MoneyTimePage } from '@/pages/MoneyTimePage'
import { Pick2SinglePage } from '@/pages/Pick2SinglePage'
import { Pick2DoublePage } from '@/pages/Pick2DoublePage'
import { ResultsPage } from '@/pages/ResultsPage'
import { WinnersPage } from '@/pages/WinnersPage'
import { ResponsibleGamingPage } from '@/pages/ResponsibleGamingPage'
import { ContactPage } from '@/pages/ContactPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { TermsPage } from '@/pages/TermsPage'
import { AboutPage } from '@/pages/AboutPage'
import { LotteryInfoPage } from '@/pages/LotteryInfoPage'
import { LogoutPage } from '@/pages/LogoutPage'

export const publicRoutes: RouteObject[] = [
  { index: true, element: <HomePage /> },
  { path: 'lotteries', element: <LotteriesPage /> },
  { path: 'lottery-info', element: <LotteryInfoPage /> },
  { path: 'cashpot', element: <CashpotPage /> },
  { path: 'money-time', element: <MoneyTimePage /> },
  { path: 'pick-2-single', element: <Pick2SinglePage /> },
  { path: 'pick-2-double', element: <Pick2DoublePage /> },
  { path: 'results', element: <ResultsPage /> },
  { path: 'winners', element: <WinnersPage /> },
  { path: 'responsible-gaming', element: <ResponsibleGamingPage /> },
  { path: 'about', element: <AboutPage /> },
  { path: 'contact', element: <ContactPage /> },
  { path: 'login', element: <LoginPage /> },
  { path: 'logout', element: <LogoutPage /> },
  { path: 'register', element: <RegisterPage /> },
  { path: 'terms', element: <TermsPage /> },
]
