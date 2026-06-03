import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Phone, Mail, Clock, MessageSquare, HelpCircle,
  ChevronDown, CheckCircle, Send, Globe,
} from 'lucide-react'
import type { PageId } from '@/lib/fortune-data'

interface ContactPageProps {
  navigate: (page: PageId) => void
}

const FAQ_ITEMS = [
  {
    q: 'How do I claim my winnings?',
    a: 'Prizes under $600 are automatically credited to your wallet within minutes of the draw. Prizes over $600 require identity verification, which can be completed in your account settings.',
  },
  {
    q: 'What is the minimum age to play?',
    a: 'You must be 18 years of age or older to play Fortune Lottery. We use age verification during account registration to ensure compliance.',
  },
  {
    q: 'How do I deposit funds?',
    a: 'You can deposit via debit card or bank transfer from your Wallet page. Deposits are typically instant for debit cards and 1-3 business days for bank transfers.',
  },
  {
    q: 'What happens if I miss a draw?',
    a: 'Your ticket remains valid for the specific draw date printed on your ticket. You cannot transfer tickets to a different draw.',
  },
  {
    q: 'Can I cancel a ticket purchase?',
    a: 'Ticket purchases cannot be cancelled once confirmed. Please review your ticket before confirming your purchase.',
  },
  {
    q: 'How do I set spending limits?',
    a: 'Visit our Responsible Gaming page in your account settings to set daily, weekly, or monthly deposit and spending limits.',
  },
]

export function ContactPage({ navigate }: ContactPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge className="bg-primary/15 text-primary border-primary/25 mb-4">
            <MessageSquare className="size-3 mr-1" /> We're Here to Help
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Contact & <span className="gold-text">Support</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Our support team is available around the clock to help with any questions or issues.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            {
              icon: <Phone className="size-6 text-primary" />,
              title: 'Phone Support',
              info: '1-800-FORTUNE',
              sub: 'Mon–Sun, 8AM–10PM ET',
              badge: 'Fastest',
              badgeClass: 'bg-primary/15 text-primary border-primary/25',
            },
            {
              icon: <Mail className="size-6 text-sky-400" />,
              title: 'Email Support',
              info: 'support@fortunelottery.com',
              sub: 'Response within 24 hours',
              badge: 'Detailed',
              badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
            },
            {
              icon: <MessageSquare className="size-6 text-emerald-400" />,
              title: 'Live Chat',
              info: 'Chat with an agent',
              sub: 'Available 24/7',
              badge: 'Live',
              badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
            },
          ].map((method, i) => (
            <Card key={i} className="bg-fortune-card border-border text-center card-hover">
              <CardContent className="p-6">
                <div className="size-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-4">
                  {method.icon}
                </div>
                <Badge className={`text-xs mb-3 border ${method.badgeClass}`}>{method.badge}</Badge>
                <h3 className="font-bold mb-1">{method.title}</h3>
                <p className="text-sm text-primary font-semibold mb-1">{method.info}</p>
                <p className="text-xs text-muted-foreground">{method.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <Card className="bg-fortune-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Send className="size-5 text-primary" />
                <h2 className="text-xl font-bold">Send a Message</h2>
              </div>

              {submitted ? (
                <div className="text-center py-10">
                  <CheckCircle className="size-12 text-emerald-400 mx-auto mb-4" />
                  <p className="text-lg font-bold text-emerald-400">Message Sent!</p>
                  <p className="text-sm text-muted-foreground mt-2">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                      <Input
                        placeholder="John Smith"
                        value={formState.name}
                        onChange={e => setFormState(p => ({ ...p, name: e.target.value }))}
                        className="bg-muted/20 border-border"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                      <Input
                        placeholder="you@email.com"
                        type="email"
                        value={formState.email}
                        onChange={e => setFormState(p => ({ ...p, email: e.target.value }))}
                        className="bg-muted/20 border-border"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
                    <Select onValueChange={v => setFormState(p => ({ ...p, subject: v }))}>
                      <SelectTrigger className="bg-muted/20 border-border">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account">Account Issues</SelectItem>
                        <SelectItem value="payment">Payment & Withdrawals</SelectItem>
                        <SelectItem value="tickets">Tickets & Draws</SelectItem>
                        <SelectItem value="prizes">Prize Claims</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="responsible">Responsible Gaming</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Message</label>
                    <Textarea
                      placeholder="Describe your issue or question in detail..."
                      value={formState.message}
                      onChange={e => setFormState(p => ({ ...p, message: e.target.value }))}
                      className="bg-muted/20 border-border min-h-[120px]"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full gold-gradient text-fortune-navy font-bold">
                    Send Message <Send className="size-4 ml-1" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Office Hours & Info */}
          <div className="space-y-4">
            <Card className="bg-fortune-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="size-5 text-primary" />
                  <h3 className="font-bold">Support Hours</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    { day: 'Monday – Friday', hours: '7:00 AM – 11:00 PM ET' },
                    { day: 'Saturday', hours: '8:00 AM – 10:00 PM ET' },
                    { day: 'Sunday', hours: '9:00 AM – 9:00 PM ET' },
                  ].map((h, i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-border/30 last:border-0">
                      <span className="text-muted-foreground">{h.day}</span>
                      <span className="font-medium">{h.hours}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3 opacity-50" />
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <Globe className="size-4" />
                  <span>Live Chat available 24/7</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-fortune-card border-border">
              <CardContent className="p-5">
                <h3 className="font-bold mb-3">Quick Links</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Responsible Gaming Resources', page: 'responsible-gaming' as const },
                    { label: 'Check My Tickets', page: 'tickets' as const },
                    { label: 'Wallet & Withdrawals', page: 'wallet' as const },
                    { label: 'Current Promotions', page: 'promotions' as const },
                  ].map(link => (
                    <button
                      key={link.page}
                      onClick={() => navigate(link.page)}
                      className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-primary transition-colors py-1.5"
                    >
                      {link.label} <ChevronDown className="size-3.5 -rotate-90" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="size-5 text-primary" />
            <h2 className="text-2xl font-extrabold">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2">
            {FAQ_ITEMS.map((faq, i) => (
              <Card
                key={i}
                className="bg-fortune-card border-border overflow-hidden cursor-pointer"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                    <p className="font-medium text-sm pr-4">{faq.q}</p>
                    <ChevronDown
                      className={`size-4 text-muted-foreground flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </div>
                  {openFaq === i && (
                    <div className="px-4 pb-4">
                      <Separator className="mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
