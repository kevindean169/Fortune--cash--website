import type { RouteObject } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AccountLayout } from '@/components/AccountLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { MyTicketsPage } from '@/pages/MyTicketsPage'
import { MyWinningsPage } from '@/pages/MyWinningsPage'
import { SecurityPage } from '@/pages/SecurityPage'
import { WalletPage } from '@/pages/WalletPage'
import { TransactionHistoryPage } from '@/pages/TransactionHistoryPage'

export const protectedRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AccountLayout />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'wallet', element: <WalletPage /> },
          { path: 'tickets', element: <MyTicketsPage /> },
          { path: 'transactions', element: <TransactionHistoryPage /> },
          { path: 'winnings', element: <MyWinningsPage /> },
          { path: 'security', element: <SecurityPage /> },
        ]
      }
    ]
  },
]
