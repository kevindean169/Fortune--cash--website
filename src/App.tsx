import { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { HomePage } from '@/pages/HomePage'
import { GamesPage } from '@/pages/GamesPage'
import { CashPopPage } from '@/pages/CashPopPage'
import { PickGamePage } from '@/pages/PickGamePage'
import { ResultsPage } from '@/pages/ResultsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { MyTicketsPage } from '@/pages/MyTicketsPage'
import { WalletPage } from '@/pages/WalletPage'
import { PromotionsPage } from '@/pages/PromotionsPage'
import { ResponsibleGamingPage } from '@/pages/ResponsibleGamingPage'
import { ContactPage } from '@/pages/ContactPage'
import ProfilePage from '@/pages/ProfilePage'
import MyLotteriesPage from '@/pages/MyLotteriesPage'
import MyWinningsPage from '@/pages/MyWinningsPage'
import MobileAppPage from '@/pages/MobileAppPage'
import SupportPage from '@/pages/SupportPage'
import type { PageId } from '@/lib/fortune-data'

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home')

  const navigate = (page: PageId) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage navigate={navigate} />
      case 'games': return <GamesPage navigate={navigate} />
      case 'cash-pop': return <CashPopPage navigate={navigate} />
      case 'pick-2': return <PickGamePage gameId="pick-2" navigate={navigate} />
      case 'pick-3': return <PickGamePage gameId="pick-3" navigate={navigate} />
      case 'pick-4': return <PickGamePage gameId="pick-4" navigate={navigate} />
      case 'results': return <ResultsPage navigate={navigate} />
      case 'dashboard': return <DashboardPage navigate={navigate} />
      case 'tickets': return <MyTicketsPage navigate={navigate} />
      case 'wallet': return <WalletPage navigate={navigate} />
      case 'promotions': return <PromotionsPage navigate={navigate} />
      case 'responsible-gaming': return <ResponsibleGamingPage navigate={navigate} />
      case 'contact': return <ContactPage navigate={navigate} />
      case 'profile': return <ProfilePage />
      case 'my-lotteries': return <MyLotteriesPage />
      case 'my-winnings': return <MyWinningsPage />
      case 'mobile-app': return <MobileAppPage />
      case 'support': return <SupportPage />
      default: return <HomePage navigate={navigate} />
    }
  }

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Navigation currentPage={currentPage} navigate={navigate} />
      <main className="flex-1">{renderPage()}</main>
      <Footer navigate={navigate} />
    </div>
  )
}

export default App
