import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ShieldCheck, Phone, Globe, Heart, AlertTriangle,
  Clock, DollarSign, HelpCircle, ChevronRight, CheckCircle,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

const SELF_ASSESSMENT = [
  'Do you spend more than you can afford on lottery tickets?',
  'Do you feel you need to win back money you have lost?',
  'Has your gambling caused financial problems for you or your family?',
  'Do you gamble to escape problems or relieve anxiety?',
  'Have you lied to hide gambling from family or friends?',
]

const RESOURCES = [
  { name: 'National Problem Gambling Helpline', contact: '1-800-522-4700', available: '24/7', icon: <Phone className="size-4" /> },
  { name: 'Florida Council on Compulsive Gambling', contact: '1-888-ADMIT-IT', available: '24/7', icon: <Phone className="size-4" /> },
  { name: 'Gamblers Anonymous', contact: 'www.gamblersanonymous.org', available: 'Online', icon: <Globe className="size-4" /> },
  { name: 'National Council on Problem Gambling', contact: 'www.ncpgambling.org', available: 'Online', icon: <Globe className="size-4" /> },
]

export function ResponsibleGamingPage() {
  const routerNavigate = useNavigate()
  const navigate = (path: string) => routerNavigate(path === 'home' ? '/' : `/${path}`)
    return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 mb-4">
            <ShieldCheck className="size-3 mr-1" /> Player Protection
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Responsible <span className="gold-text">Gaming</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Fortune Lottery is committed to providing a safe and responsible gaming environment.
            Gambling should be fun — here's how we keep it that way.
          </p>
        </div>

        {/* Our Commitment */}
        <Card className="bg-fortune-card border-emerald-500/20 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <Heart className="size-6 text-emerald-400" />
              <h2 className="text-xl font-bold">Our Commitment to You</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { icon: <DollarSign className="size-5 text-primary" />, title: 'Spend Limits', desc: 'Set daily, weekly, or monthly deposit and spend limits that suit your budget.' },
                { icon: <Clock className="size-5 text-primary" />, title: 'Time Controls', desc: 'Set session time limits and take breaks to keep gaming in perspective.' },
                { icon: <ShieldCheck className="size-5 text-emerald-400" />, title: 'Self-Exclusion', desc: 'Temporarily or permanently exclude yourself from playing if you need a break.' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl bg-muted/20 p-4">
                  <div className="mb-3">{item.icon}</div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Player Tools */}
        <Card className="bg-fortune-card border-border mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-5">Player Protection Tools</h2>
            <div className="space-y-4">
              {[
                {
                  title: 'Deposit Limits',
                  desc: 'Control how much you can deposit per day, week, or month.',
                  action: 'Set Limits',
                  actionClass: 'gold-gradient text-fortune-navy',
                },
                {
                  title: 'Session Time Reminders',
                  desc: 'Receive reminders when you have been playing for a set amount of time.',
                  action: 'Configure',
                  actionClass: 'gold-gradient text-fortune-navy',
                },
                {
                  title: 'Cooling-Off Period',
                  desc: 'Take a break from 24 hours to 30 days. Your account remains open but you cannot play.',
                  action: 'Take a Break',
                  actionClass: 'bg-amber-500 text-white hover:bg-amber-600',
                },
                {
                  title: 'Self-Exclusion',
                  desc: 'Permanently exclude yourself. This action cannot be reversed for 5 years.',
                  action: 'Self-Exclude',
                  actionClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                },
              ].map((tool, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-border/40 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{tool.title}</p>
                    <p className="text-sm text-muted-foreground">{tool.desc}</p>
                  </div>
                  <Button
                    size="sm"
                    className={`flex-shrink-0 font-semibold text-xs ${tool.actionClass}`}
                    onClick={() => navigate('contact')}
                  >
                    {tool.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Self-Assessment */}
        <Card className="bg-fortune-card border-border mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <HelpCircle className="size-5 text-amber-400" />
              <h2 className="text-xl font-bold">Problem Gambling Self-Assessment</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Answering "yes" to two or more of these questions may indicate a gambling problem.
            </p>
            <div className="space-y-3">
              {SELF_ASSESSMENT.map((q, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-muted/20 p-3">
                  <AlertTriangle className="size-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{q}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
              <p className="text-sm text-amber-400 font-medium">
                If you answered yes to any of these questions, please reach out to a support resource below.
                Help is available 24/7.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Resources */}
        <Card className="bg-fortune-card border-border mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <Phone className="size-5 text-primary" />
              <h2 className="text-xl font-bold">Help Resources</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {RESOURCES.map((r, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/10 p-4">
                  <div className="size-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    {r.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-sm text-primary font-bold">{r.contact}</p>
                    <p className="text-xs text-muted-foreground">{r.available}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Responsible Tips */}
        <Card className="bg-fortune-card border-border">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-5">Tips for Responsible Play</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'Only spend what you can afford to lose',
                'Set a budget before you start playing',
                'Never chase your losses',
                'Treat gambling as entertainment, not income',
                'Take regular breaks during play sessions',
                'Never gamble when stressed, upset, or drunk',
                'Keep track of time spent gambling',
                'Balance gambling with other activities',
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="size-4 text-emerald-400 flex-shrink-0" />
                  {tip}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-4">Need to speak to someone immediately?</p>
          <Button
            className="gold-gradient text-fortune-navy font-bold gold-glow"
            onClick={() => navigate('contact')}
          >
            Contact Support <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
