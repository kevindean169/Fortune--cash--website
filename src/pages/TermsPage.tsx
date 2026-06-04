import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, ShieldCheck, HelpCircle, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function TermsPage() {
  const routerNavigate = useNavigate()
  const navigate = (path: string) => routerNavigate(path === 'home' ? '/' : `/${path}`)

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge className="bg-primary/15 text-primary border-primary/25 mb-4">
            <FileText className="size-3 mr-1" /> Legal Agreement
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Terms & <span className="gold-text">Conditions</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Please read these Terms and Conditions carefully before using the Fortune Lottery platform.
          </p>
        </div>

        {/* Introduction */}
        <Card className="bg-fortune-card border-border mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="size-6 text-primary" />
              <h2 className="text-xl font-bold">1. Agreement Overview</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              By accessing, registering, or placing wagers on the Fortune Lottery platform, you agree to be bound by these Terms and Conditions, our Privacy Policy, and the applicable gaming rules of Jamaica. If you do not agree, please do not use the services.
            </p>
            <div className="flex items-start gap-2.5 rounded-xl bg-primary/10 border border-primary/20 p-3.5">
              <AlertCircle className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong>Important Notice:</strong> Wagers placed on this platform are governed by the regulations set forth under the Betting, Gaming and Lotteries Act of Jamaica.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Eligibility & Accounts */}
        <Card className="bg-fortune-card border-border mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="size-6 text-primary" />
              <h2 className="text-xl font-bold">2. Age and Eligibility</h2>
            </div>
            <ul className="space-y-3.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">·</span>
                <span>You must be at least <strong>18 years of age</strong> to register an account and play. It is a criminal offense for minors to participate in lottery activities.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">·</span>
                <span>Users must provide accurate, current, and complete identification during the sign-up process. Failure to verify age and identity will lead to immediate account suspension and forfeiture of any winnings.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">·</span>
                <span>Only one account is permitted per user. Multiple accounts created by the same individual will be closed immediately.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Wagers & Winnings */}
        <Card className="bg-fortune-card border-border mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="size-6 text-primary" />
              <h2 className="text-xl font-bold">3. Purchase of Tickets & Payouts</h2>
            </div>
            <ul className="space-y-3.5 text-sm text-muted-foreground font-normal">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">·</span>
                <span>All ticket sales are final. Once a transaction is confirmed and registered, it cannot be refunded or cancelled.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">·</span>
                <span>Winnings are credited directly to your digital wallet following draw validation. Cashpot and Money Time prizes are credited instantly.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">·</span>
                <span>Withdrawals of funds are subject to processing times and minimum balance limits as detailed in the Wallet guidelines. Security checks will be enforced on withdrawals above threshold amounts.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="bg-fortune-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="size-6 text-destructive" />
              <h2 className="text-xl font-bold">4. Misconduct & Fair Play</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate accounts in instances of suspected collusive behavior, use of automated scripts, exploitation of system bugs, or illegal activities. Any decision made by the management of Fortune Lottery in relation to disputed draws, system errors, or account suspension shall be final and binding.
            </p>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate('home')}
            className="text-sm font-bold text-primary hover:underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
