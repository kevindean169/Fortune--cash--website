import { Separator } from '@/components/ui/separator'
import { ShieldCheck, Phone, HelpCircle, FileText, Lock } from 'lucide-react'
import type { PageId } from '@/lib/fortune-data'

import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="hidden md:block border-t border-border/50 bg-card mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <img src="/favicon.png" alt="Fortune Logo" className="w-20 h-20 object-contain rounded-xl shadow-[0_0_15px_rgba(224,172,44,0.25)]" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Jamaica's trusted online lottery platform. Licensed, secure, and committed to responsible gaming.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-1.5 rounded-md border border-border/50 px-2 py-1 text-xs text-muted-foreground">
                <Lock className="size-3 text-primary" /> SSL Secured
              </div>
              <div className="flex items-center gap-1.5 rounded-md border border-border/50 px-2 py-1 text-xs text-muted-foreground">
                <ShieldCheck className="size-3 text-emerald-500" /> Licensed
              </div>
            </div>
          </div>

          {/* Lotteries */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase">Lotteries</h3>
            <ul className="space-y-2.5">
              {[
                { id: 'cashpot' as PageId, label: 'Cashpot', logo: '/cashpot_logo.png?v=5' },
                { id: 'money-time' as PageId, label: 'Money Time', logo: '/moneytime_logo.png?v=5' },
                { id: 'pick-2-single' as PageId, label: 'Pick 2 Single', logo: '/pick2_logo.png?v=5' },
                { id: 'pick-2-double' as PageId, label: 'Pick 2 Double', logo: '/pick2_logo.png?v=5' },
              ].map(g => (
                <li key={g.id}>
                  <Link 
                    to={`/lottery-info?type=${g.id}`}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <img src={g.logo} alt={g.label} className="w-8 h-8 object-contain" />
                    <span>{g.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase">Account</h3>
            <ul className="space-y-2.5">
              {[
                { id: 'dashboard' as PageId, label: 'Dashboard' },
                { id: 'tickets' as PageId, label: 'My Tickets' },
                { id: 'wallet' as PageId, label: 'Wallet' },
                { id: 'transactions' as PageId, label: 'Transactions' },
                { id: 'results' as PageId, label: 'Results' },
              ].map(item => (
                <li key={item.id}>
                  <Link
                    to={`/${item.id}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase">Support</h3>
            <ul className="space-y-2.5">
              {[
                { id: 'about' as PageId, label: 'About Us', icon: <FileText className="size-3" /> },
                { id: 'contact' as PageId, label: 'Contact Us', icon: <Phone className="size-3" /> },
                { id: 'contact' as PageId, label: 'Help Center', icon: <HelpCircle className="size-3" /> },
                { id: 'responsible-gaming' as PageId, label: 'Responsible Gaming', icon: <ShieldCheck className="size-3" /> },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    to={`/${item.id}`}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.icon} {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/terms"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <FileText className="size-3" /> Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            © 2026 Fortune Lottery. All rights reserved. Must be 18+ to play. Play Responsibly.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 rounded border border-border/50 font-bold select-none">
              <span className="text-red-500 font-extrabold text-[10px] bg-red-500/10 border border-red-500/20 px-1 rounded-sm">18+</span> Age Limit
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 rounded border border-border/50 font-bold select-none">
              <ShieldCheck className="size-3.5 text-emerald-500" /> Play Responsibly
            </div>
            <Link
              to="/responsible-gaming"
              className="text-xs text-muted-foreground px-2 py-1 rounded border border-border/50 hover:border-primary/50 hover:text-primary transition-colors"
            >
              Problem Gambling? Get Help
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
