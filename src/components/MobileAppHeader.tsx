import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'

export function MobileAppHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  // Hide headers on main tabs / standard landing pages on mobile
  if (['/', '/lotteries', '/login', '/register'].includes(currentPath)) {
    return null
  }

  // Statistics page has its own custom inline header
  if (['/dashboard', '/winnings'].includes(currentPath)) {
    return (
      <div className="md:hidden flex items-center justify-center py-4 bg-background border-b border-border/30 px-4">
        <div className="flex items-center gap-2">
          <img src="/moneytime_logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="text-primary font-bold text-[10px] tracking-widest uppercase">📊 Statistics 📊</span>
        </div>
      </div>
    )
  }

  // Get Page Title
  let title = 'Fortune'
  if (currentPath === '/wallet' || currentPath === '/transactions') title = 'Withdraw'
  if (currentPath === '/profile') title = 'My Profile'
  if (currentPath === '/security') title = 'Security'
  if (currentPath === '/tickets') title = 'My Tickets'
  if (currentPath === '/cashpot') title = 'Jamaica Cashpot'
  if (currentPath === '/money-time') title = 'Money Time'
  if (currentPath === '/pick-2-single') title = 'Pick 2 Single'
  if (currentPath === '/pick-2-double') title = 'P2 Double Digit'

  return (
    <div className="md:hidden flex items-center justify-between py-4 bg-background border-b border-border/30 px-4">
      <button
        onClick={() => navigate(-1)}
        className="w-9 h-9 rounded-full border border-border bg-[#0d0d0d] flex items-center justify-center hover:bg-[#1a1a1a]"
      >
        <ArrowLeft className="size-4 text-white" />
      </button>
      <span className="font-extrabold text-base text-white">{title}</span>
      <button
        onClick={() => window.location.reload()}
        className="w-9 h-9 rounded-full border border-border bg-[#0d0d0d] flex items-center justify-center hover:bg-[#1a1a1a]"
      >
        <RefreshCw className="size-4 text-white" />
      </button>
    </div>
  )
}
