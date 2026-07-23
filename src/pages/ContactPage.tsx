import { useEffect, useMemo, useState } from 'react'
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
import { useNavigate } from 'react-router-dom'
import { fetchContactUs, fetchFaq, type ContactContent, type FaqItem } from '@/lib/fortuneApi'

const FALLBACK_FAQS: FaqItem[] = [
  {
    question: 'How do I claim my winnings?',
    answer: 'Prizes under $600 are automatically credited to your wallet within minutes of the draw. Prizes over $600 require identity verification, which can be completed in your account settings.',
  },
  {
    question: 'What is the minimum age to play?',
    answer: 'You must be 18 years of age or older to play Fortune Lottery. We use age verification during account registration to ensure compliance.',
  },
  {
    question: 'How do I deposit funds?',
    answer: 'You can deposit via debit card or bank transfer from your Wallet page.',
  },
]

function cleanValue(value?: string) {
  if (!value || value.trim() === '.') return ''
  return value
}

export function ContactPage() {
  const routerNavigate = useNavigate()
  const navigate = (path: string) => routerNavigate(path === 'home' ? '/' : `/${path}`)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [contact, setContact] = useState<ContactContent | null>(null)
  const [faqs, setFaqs] = useState<FaqItem[]>(FALLBACK_FAQS)

  useEffect(() => {
    let cancelled = false

    fetchContactUs()
      .then((data) => {
        if (!cancelled) setContact(data)
      })
      .catch(() => undefined)

    fetchFaq()
      .then((data) => {
        if (!cancelled && data.questions.length > 0) setFaqs(data.questions)
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [])

  const contactMethods = useMemo(() => [
    {
      icon: <Phone className="size-6 text-primary" />,
      title: 'Phone Support',
      info: cleanValue(contact?.phone) || '1-800-FORTUNE',
      sub: 'Mon-Sun, 8AM-10PM ET',
      badge: 'Fastest',
      badgeClass: 'bg-primary/15 text-primary border-primary/25',
    },
    {
      icon: <Mail className="size-6 text-sky-400" />,
      title: 'Email Support',
      info: cleanValue(contact?.email) || 'support@fortunelottery.com',
      sub: 'Response within 24 hours',
      badge: 'Detailed',
      badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
    },
    {
      icon: <MessageSquare className="size-6 text-emerald-400" />,
      title: 'Community',
      info: cleanValue(contact?.mobile_community) || 'Live support',
      badge: 'Live',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
      action: contact?.join_mobile_community_link ? {
        label: 'Join Now',
        link: contact.join_mobile_community_link
      } : undefined,
    },
  ], [contact])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <Badge className="bg-primary/15 text-primary border-primary/25 mb-4">
            <MessageSquare className="size-3 mr-1" /> We're Here to Help
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Contact & <span className="gold-text">Support</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {cleanValue(contact?.content) || 'Our support team is available around the clock to help with any questions or issues.'}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {contactMethods.map((method, index) => (
            <Card key={index} className="bg-fortune-card border-border text-center card-hover flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="size-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-4">
                  {method.icon}
                </div>
                <Badge className={`text-xs mb-3 border ${method.badgeClass} mx-auto`}>{method.badge}</Badge>
                <h3 className="font-bold mb-1">{method.title}</h3>
                <p className="text-sm text-primary font-semibold mb-1">{method.info}</p>
                {method.sub && <p className="text-xs text-muted-foreground mb-4">{method.sub}</p>}

                {method.action && (
                  <div className="mt-auto pt-2">
                    <Button 
                      size="sm"
                      className="w-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-[#25D366]/30 transition-all font-bold gap-2" 
                      onClick={() => window.open(method.action!.link, '_blank')}
                    >
                      <MessageSquare className="size-4" /> {method.action.label}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
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
                        onChange={(event) => setFormState((previous) => ({ ...previous, name: event.target.value }))}
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
                        onChange={(event) => setFormState((previous) => ({ ...previous, email: event.target.value }))}
                        className="bg-muted/20 border-border"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
                    <Select onValueChange={(value) => setFormState((previous) => ({ ...previous, subject: value }))}>
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
                      onChange={(event) => setFormState((previous) => ({ ...previous, message: event.target.value }))}
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

          <div className="space-y-4">
            <Card className="bg-fortune-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="size-5 text-primary" />
                  <h3 className="font-bold">Support Hours</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    { day: 'Monday - Friday', hours: '7:00 AM - 11:00 PM ET' },
                    { day: 'Saturday', hours: '8:00 AM - 10:00 PM ET' },
                    { day: 'Sunday', hours: '9:00 AM - 9:00 PM ET' },
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between py-1.5 border-b border-border/30 last:border-0">
                      <span className="text-muted-foreground">{item.day}</span>
                      <span className="font-medium">{item.hours}</span>
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
                    { label: 'Responsible Gaming Resources', page: 'responsible-gaming' },
                    { label: 'Check My Tickets', page: 'tickets' },
                    { label: 'Wallet & Withdrawals', page: 'wallet' },
                  ].map((link) => (
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

        <div>
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="size-5 text-primary" />
            <h2 className="text-2xl font-extrabold">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <Card
                key={`${faq.question}-${index}`}
                className="bg-fortune-card border-border overflow-hidden cursor-pointer"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                    <p className="font-medium text-sm pr-4">{faq.question}</p>
                    <ChevronDown
                      className={`size-4 text-muted-foreground flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                    />
                  </div>
                  {openFaq === index && (
                    <div className="px-4 pb-4">
                      <Separator className="mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
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
