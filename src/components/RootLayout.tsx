import { Outlet } from 'react-router-dom'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'

export function RootLayout() {
  return (
    <div className="min-h-svh flex flex-col bg-background">
      <ScrollToTop />
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
