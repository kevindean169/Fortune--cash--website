import { Separator } from '@/components/ui/separator'
import { Sparkles, ShieldCheck, Phone, HelpCircle, FileText, Lock } from 'lucide-react'
import type { PageId } from '@/lib/fortune-data'

import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center size-8 rounded-full gold-gradient">
                <Sparkles className="size-4 text-fortune-navy" />
              </div>
              <span className="text-lg font-extrabold">
                <span className="gold-text">Fortune</span>
                <span className="text-foreground"> Lottery</span>
              </span>
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
                { id: 'cashpot' as PageId, label: 'Cashpot', icon: '💎' },
                { id: 'money-time' as PageId, label: 'Money Time', icon: '🎯' },
                { id: 'pick-2-single' as PageId, label: 'Pick 2 Single', icon: '✌️' },
                { id: 'pick-2-double' as PageId, label: 'Pick 2 Double', icon: '🔥' },
              ].map(g => (
                <li key={g.id}>
                  <div
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span>{g.icon}</span> {g.label}
                  </div>
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
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <FileText className="size-3" /> Terms & Conditions
                </span>
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
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground px-2 py-1 rounded border border-border/50">
              🔞 18+
            </div>
            <div className="text-xs text-muted-foreground px-2 py-1 rounded border border-border/50">
              🎰 Play Responsibly
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
