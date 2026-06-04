import type { RouteObject } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { LotteriesPage } from '@/pages/LotteriesPage'
import { SingleLotteryPage } from '@/pages/SingleLotteryPage'
import { ResultsPage } from '@/pages/ResultsPage'
import { WinnersPage } from '@/pages/WinnersPage'
import { ResponsibleGamingPage } from '@/pages/ResponsibleGamingPage'
import { ContactPage } from '@/pages/ContactPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { TermsPage } from '@/pages/TermsPage'

export const publicRoutes: RouteObject[] = [
  { index: true, element: <HomePage /> },
  { path: 'lotteries', element: <LotteriesPage /> },
  { path: 'cashpot', element: <SingleLotteryPage gameId="cashpot" /> },
  { path: 'money-time', element: <SingleLotteryPage gameId="money-time" /> },
  { path: 'pick-2-single', element: <SingleLotteryPage gameId="pick-2-single" /> },
  { path: 'pick-2-double', element: <SingleLotteryPage gameId="pick-2-double" /> },
  { path: 'results', element: <ResultsPage /> },
  { path: 'winners', element: <WinnersPage /> },
  { path: 'responsible-gaming', element: <ResponsibleGamingPage /> },
  { path: 'contact', element: <ContactPage /> },
  { path: 'login', element: <LoginPage /> },
  { path: 'register', element: <RegisterPage /> },
  { path: 'terms', element: <TermsPage /> },
]
