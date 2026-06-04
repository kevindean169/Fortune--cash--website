import { Outlet } from 'react-router-dom'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'
import { MobileBottomNav } from '@/components/MobileBottomNav'


export function RootLayout() {
  return (
    <div className="min-h-svh flex flex-col bg-background pb-16 md:pb-0">
      <ScrollToTop />
      <Navigation />
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Hide desktop footer on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>
      
      {/* Mobile custom bottom navigation */}
      <MobileBottomNav />
    </div>
  )
}
