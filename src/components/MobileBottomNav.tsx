import { NavLink, useLocation } from 'react-router-dom'
import { Home, Ticket, BarChart3, User } from 'lucide-react'

export function MobileBottomNav() {
  const location = useLocation()
  const currentPath = location.pathname

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/lotteries', label: 'Lotteries', icon: Ticket },
    { path: '/dashboard', label: 'Statistics', icon: BarChart3 },
    { path: '/profile', label: 'Profile', icon: User },
  ]

  // Hide bottom nav on login/register screens
  if (['/login', '/register'].includes(currentPath)) {
    return null
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-border/40 backdrop-blur-lg py-2 px-6 flex items-center justify-around pb-safe">
      {navItems.map(item => {
        const Icon = item.icon
        // Check active state
        const isActive =
          item.path === '/'
            ? currentPath === '/'
            : item.path === '/lotteries'
            ? ['/lotteries', '/cashpot', '/money-time', '/pick-2-single', '/pick-2-double'].includes(currentPath)
            : item.path === '/dashboard'
            ? ['/dashboard', '/winnings'].includes(currentPath)
            : ['/profile', '/security', '/tickets', '/transactions'].includes(currentPath)

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1 text-[10px] font-bold transition-all relative py-1"
          >
            <div className={`p-1 rounded-full transition-all ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <Icon className="size-5" />
            </div>
            <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
              {item.label}
            </span>
            {isActive && (
              <span className="absolute -top-2 w-8 h-[2.5px] bg-primary rounded-full" />
            )}
          </NavLink>
        )
      })}
    </div>
  )
}
