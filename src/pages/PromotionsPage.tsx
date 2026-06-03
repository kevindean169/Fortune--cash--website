import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Gift, Zap, Clock, Star } from 'lucide-react'
import { PROMOTIONS } from '@/lib/fortune-data'
import type { PageId } from '@/lib/fortune-data'

interface PromotionsPageProps {
  navigate: (page: PageId) => void
}

export function PromotionsPage({ navigate }: PromotionsPageProps) {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge className="bg-primary/15 text-primary border-primary/25 mb-4">
            <Gift className="size-3 mr-1" /> Exclusive Offers
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Promotions & <span className="gold-text">Bonuses</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            More ways to win. Exclusive deals for Fortune Lottery players.
          </p>
        </div>

        {/* Hero Promo */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-fortune-blue/30 via-fortune-card to-fortune-gold/15" />
          <div className="absolute inset-0 border border-fortune-gold/25 rounded-2xl" />
          <div className="relative p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <Badge className="bg-primary/20 text-primary border-primary/30 mb-3">
                <Star className="size-3 mr-1" /> LIMITED TIME
              </Badge>
              <h2 className="text-3xl font-extrabold mb-2">
                Welcome Bonus — <span className="gold-text">10 Free Plays</span>
              </h2>
              <p className="text-muted-foreground max-w-md">
                New to Fortune Lottery? Make your first deposit of $5 or more and receive 10 free Cash Pop plays instantly.
                No code required.
              </p>
            </div>
            <div className="text-center flex-shrink-0">
              <div className="text-6xl font-extrabold gold-text mb-2">10</div>
              <p className="text-muted-foreground text-sm">Free Cash Pop Plays</p>
              <Button
                className="mt-4 gold-gradient text-fortune-navy font-bold gold-glow px-6"
                onClick={() => navigate('wallet')}
              >
                Claim Now <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Promotions Grid */}
        <div className="grid sm:grid-cols-2 gap-5 mb-12">
          {PROMOTIONS.map(promo => (
            <Card key={promo.id} className="bg-fortune-card border-border card-hover overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge className={`text-xs font-bold mb-2 border-0 ${promo.badgeClass}`}>
                      {promo.badge}
                    </Badge>
                    <h3 className="text-xl font-extrabold">{promo.title}</h3>
                    <p className="text-sm text-muted-foreground">{promo.subtitle}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-lg font-extrabold text-primary">{promo.value}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {promo.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3" /> {promo.expiry}
                  </div>
                  <Button
                    size="sm"
                    className="gold-gradient text-fortune-navy font-semibold text-xs"
                    onClick={() => navigate('games')}
                  >
                    Claim <ArrowRight className="size-3 ml-0.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How Promotions Work */}
        <Card className="bg-fortune-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="size-5 text-primary" />
              <h2 className="text-xl font-bold">How Promotions Work</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  step: '1',
                  title: 'Automatically Applied',
                  desc: 'Most promotions are applied automatically to your account. No promo codes needed.',
                },
                {
                  step: '2',
                  title: 'Check Eligibility',
                  desc: 'Promotions may have minimum deposit or play requirements. Check the terms before claiming.',
                },
                {
                  step: '3',
                  title: 'Enjoy Your Bonus',
                  desc: 'Free plays and bonuses are credited within minutes. Winnings from free plays are withdrawable.',
                },
              ].map(item => (
                <div key={item.step}>
                  <div className="size-8 rounded-full gold-gradient flex items-center justify-center mb-3">
                    <span className="text-fortune-navy font-extrabold text-sm">{item.step}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Terms Note */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          All promotions are subject to terms and conditions. Must be 18+ and a registered player.
          Promotions may be modified or withdrawn at any time. Play responsibly.
        </p>
      </div>
    </div>
  )
}
