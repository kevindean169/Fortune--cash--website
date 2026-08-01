import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Hash, Trophy, Clock, Zap,
  Star, Target, Info, HelpCircle, TrendingUp, Shield, ChevronDown, ChevronUp
} from 'lucide-react'
import { useState, useEffect } from 'react'

/* ─── Per-game static knowledge base ─────────────────────────── */
interface BetOption {
  name: string
  description: string
  payout: string
  color: string
}

interface LotteryInfoData {
  key: string
  name: string
  type: string
  tagline: string
  accentColor: string
  glowColor: string
  logoSrc: string
  numberRange: { from: number; to: number; label: string }
  howManyNumbers: number
  drawFrequency: string
  drawTimes: string
  minBet: string
  maxBet: string
  betOptions: BetOption[]
  howToPlay: { step: string; title: string; desc: string }[]
  winningRules: { rule: string; desc: string; icon: React.ReactNode }[]
  tips: string[]
  faq: { q: string; a: string }[]
}

const INFO_MAP: Record<string, LotteryInfoData> = {
  cashpot: {
    key: 'cashpot',
    name: 'Jamaica Cashpot',
    type: 'Cashpot',
    tagline: 'Pick one number 01–36 and multiply your bet up to 50×',
    accentColor: '#e0ac2c',
    glowColor: 'rgba(224,172,44,0.25)',
    logoSrc: '/cashpot_logo.png?v=6',
    numberRange: { from: 1, to: 36, label: '01 – 36' },
    howManyNumbers: 1,
    drawFrequency: 'Multiple times daily',
    drawTimes: '08:30 AM · 10:30 AM · 01:00 PM · 05:00 PM · 08:25 PM',
    minBet: '$5',
    maxBet: 'Varies by draw (subject to bet limit)',
    betOptions: [
      {
        name: 'Cashpot',
        description: 'Standard bet on your chosen number. Win if it matches the draw.',
        payout: '26× your stake',
        color: '#e0ac2c',
      },
      {
        name: 'Megaball',
        description: 'Extra side bet added on top of Cashpot. Cannot exceed Cashpot amount.',
        payout: '36× your Megaball stake',
        color: '#e0ac2c',
      },
      {
        name: 'Monstaball',
        description: 'Ultimate add-on bet. Cannot exceed your Megaball stake.',
        payout: '50× your Monstaball stake',
        color: '#d4a017',
      },
    ],
    howToPlay: [
      { step: '01', title: 'Choose Your Number', desc: 'Pick any number from 01 to 36. You can type it directly or use the number grid.' },
      { step: '02', title: 'Select Draw Times', desc: 'Choose one or more draw slots. Your bet applies to every selected draw.' },
      { step: '03', title: 'Set Bet Amounts', desc: 'Enter your Cashpot stake. Optionally add Megaball and/or Monstaball amounts (each ≤ prior tier).' },
      { step: '04', title: 'Add to Cart & Pay', desc: 'Review your bet slip, then hit Checkout. Winnings are credited to your wallet instantly.' },
    ],
    winningRules: [
      {
        rule: 'Cashpot Win',
        desc: 'Your chosen number matches the winning draw number exactly.',
        icon: <Trophy className="size-5 text-[#e0ac2c]" />,
      },
      {
        rule: 'Megaball Win',
        desc: 'You placed a Megaball side-bet and the Megaball is drawn (colored ball accompanies the draw).',
        icon: <Star className="size-5 text-[#e0ac2c]" />,
      },
      {
        rule: 'Monstaball Win',
        desc: 'You placed a Monstaball bet and the Monstaball is drawn alongside the regular draw.',
        icon: <Zap className="size-5 text-[#d4a017]" />,
      },
    ],
    tips: [
      'You must place a Cashpot bet before adding Megaball or Monstaball.',
      'Your Megaball bet cannot exceed your Cashpot amount.',
      'Your Monstaball bet cannot exceed either your Cashpot or Megaball amount.',
      'Each draw slot is independent — select multiple for more chances.',
      'Remaining bet limits per number may apply; the system shows warnings in real-time.',
    ],
    faq: [
      { q: 'Can I bet on the same number for all draws?', a: 'Yes! Simply select multiple draw time slots and one number — all slots will carry the same bet.' },
      { q: 'What happens if a draw time passes while I have bets in my cart?', a: 'Passed draw times are automatically removed from your cart and you are alerted. Your remaining bets are unaffected.' },
      { q: 'Is there a minimum Megaball bet?', a: 'Megaball minimum is $5 (same as Cashpot), but cannot exceed your Cashpot stake for that draw.' },
      { q: 'Are winnings paid instantly?', a: 'Yes, winnings are credited to your Fortune wallet balance the moment results are confirmed.' },
    ],
  },

  'money-time': {
    key: 'money-time',
    name: 'Money Time',
    type: 'Cashpot Money Time',
    tagline: 'Fixed daily Cashpot draws — same rules, extra opportunities',
    accentColor: '#e0ac2c',
    glowColor: 'rgba(224,172,44,0.25)',
    logoSrc: '/moneytime_logo.png?v=6',
    numberRange: { from: 0, to: 36, label: '0, 00, 01 – 36' },
    howManyNumbers: 1,
    drawFrequency: 'Daily at fixed special time slots',
    drawTimes: "Check the schedule tab for today's active Money Time draws",
    minBet: '$5',
    maxBet: 'Varies by draw (subject to bet limit)',
    betOptions: [
      {
        name: 'Cashpot',
        description: 'Standard Cashpot-style bet on your chosen number.',
        payout: '26× your stake',
        color: '#e0ac2c',
      },
      {
        name: 'Megaball',
        description: 'Side bet on the Megaball result. Cannot exceed Cashpot amount.',
        payout: '36× your Megaball stake',
        color: '#e0ac2c',
      },
      {
        name: 'Monstaball',
        description: 'Premium add-on. Cannot exceed your Megaball stake.',
        payout: '50× your Monstaball stake',
        color: '#d4a017',
      },
    ],
    howToPlay: [
      { step: '01', title: 'Pick Your Number', desc: 'Choose any number between 01 and 36, plus 0 and 00.' },
      { step: '02', title: 'Select a Money Time Slot', desc: 'Money Time draws run at special fixed daily slots. Select the upcoming slot(s).' },
      { step: '03', title: 'Place Your Bets', desc: 'Set your Cashpot amount, then optionally add Megaball and Monstaball.' },
      { step: '04', title: 'Confirm & Win', desc: 'Checkout securely. If your number is drawn, winnings land in your wallet immediately.' },
    ],
    winningRules: [
      {
        rule: 'Number Match',
        desc: 'Your selected number exactly matches the Money Time draw result.',
        icon: <Trophy className="size-5 text-[#e0ac2c]" />,
      },
      {
        rule: 'Megaball Bonus',
        desc: 'Megaball is drawn and you had an active Megaball side-bet for that slot.',
        icon: <Star className="size-5 text-[#e0ac2c]" />,
      },
      {
        rule: 'Monstaball Bonus',
        desc: 'Monstaball is drawn and you had an active Monstaball bet for that slot.',
        icon: <Zap className="size-5 text-[#d4a017]" />,
      },
    ],
    tips: [
      'Money Time follows identical rules to regular Cashpot but with separate, fixed draw times.',
      'Bet limits are per-draw and reset for each new slot.',
      'Great for players who prefer timed, event-style draws rather than rapid-fire Cashpot rounds.',
      'Megaball and Monstaball add-ons are available just like in standard Cashpot.',
    ],
    faq: [
      { q: 'Is Money Time a separate game from Cashpot?', a: 'It uses the same number range and payout structure as Cashpot, but runs at dedicated daily time slots branded as Money Time.' },
      { q: 'Can I play both Cashpot and Money Time simultaneously?', a: 'Yes! They are independent draws. You can have active bets in both at the same time.' },
      { q: 'How do I know when the next Money Time draw is?', a: 'The countdown on the game card shows time to the next draw. You can also see available draw slots on the game page.' },
    ],
  },

  'pick-2-single': {
    key: 'pick-2-single',
    name: 'Pick 2 Single',
    type: 'Pick 2 Single',
    tagline: 'Pick one two-digit number from 00–99 and win big',
    accentColor: '#e0ac2c',
    glowColor: 'rgba(224,172,44,0.25)',
    logoSrc: '/pick2_single.png?v=6',
    numberRange: { from: 0, to: 99, label: '00 – 99' },
    howManyNumbers: 1,
    drawFrequency: 'Daily and Weekly',
    drawTimes: 'Multiple draws — check the game schedule',
    minBet: '$5',
    maxBet: 'Varies per draw (bet limit applies)',
    betOptions: [
      {
        name: 'Pick 2 Single',
        description: 'Choose one two-digit number from 00 to 99. If your number matches the drawn result, you win.',
        payout: 'Based on bet amount & draw result',
        color: '#e0ac2c',
      },
    ],
    howToPlay: [
      { step: '01', title: 'Enter Your Two-Digit Number', desc: 'Type any number from 00 to 99. This is your single Pick 2 bet.' },
      { step: '02', title: 'Choose Draw Times', desc: 'Select one or more upcoming draw slots. Your bet applies to each chosen draw.' },
      { step: '03', title: 'Set Bet Amount', desc: 'Enter your stake amount for the bet.' },
      { step: '04', title: 'Review & Submit', desc: 'Check your bet slip and confirm. Winnings are credited to your wallet instantly if you win.' },
    ],
    winningRules: [
      {
        rule: 'Number Match',
        desc: 'Your chosen two-digit number (00–99) matches the winning draw result exactly.',
        icon: <Target className="size-5 text-[#e0ac2c]" />,
      },
    ],
    tips: [
      'Numbers range from 00 to 99 — always enter as two digits (e.g., 05, not 5).',
      'You can bet on the same number across multiple draw slots in one checkout.',
      'Bet limits apply per number per draw — the game shows live remaining limits.',
      'Each draw is independent — a missed draw does not affect other selected slots.',
    ],
    faq: [
      { q: 'What is the difference between Pick 2 Single and Pick 2 Double?', a: 'Pick 2 Single requires you to select one two-digit number per ticket. Pick 2 Double lets you place bets on two separate numbers on the same ticket.' },
      { q: 'Does "00" count as a valid number?', a: 'Yes — 00 through 09 are fully valid two-digit entries in Pick 2.' },
      { q: 'Are winnings paid instantly?', a: 'Yes, winnings are credited to your Fortune wallet balance the moment results are confirmed.' },
    ],
  },

  'pick-2-double': {
    key: 'pick-2-double',
    name: 'Pick 2 Double',
    type: 'Pick 2 Double',
    tagline: 'Bet on two numbers — more ways to win in a single ticket',
    accentColor: '#e0ac2c',
    glowColor: 'rgba(224,172,44,0.25)',
    logoSrc: '/pick2_double.png?v=6',
    numberRange: { from: 1, to: 36, label: '01 – 36 (two numbers)' },
    howManyNumbers: 2,
    drawFrequency: 'Daily and Weekly',
    drawTimes: 'Multiple draws — check the game schedule',
    minBet: '$5',
    maxBet: 'Varies per draw (bet limit applies)',
    betOptions: [
      {
        name: 'Bet Number 1',
        description: 'Your first chosen number (01-36). Wins independently if it matches the draw result.',
        payout: 'Based on bet amount & draw result',
        color: '#e0ac2c',
      },
      {
        name: 'Bet Number 2',
        description: 'Your second chosen number (01-36). Also wins independently if it matches the draw result.',
        payout: 'Based on bet amount & draw result',
        color: '#d4a017',
      },
    ],
    howToPlay: [
      { step: '01', title: 'Enter Bet Number 1', desc: 'Pick your first number from 01 to 36.' },
      { step: '02', title: 'Enter Bet Number 2', desc: 'Pick a second number for more coverage on the same ticket.' },
      { step: '03', title: 'Select Draw Times & Stake', desc: 'Choose draw slots and enter your bet amount for each number.' },
      { step: '04', title: 'Checkout', desc: 'Submit your double-entry ticket. Either number winning pays the corresponding payout.' },
    ],
    winningRules: [
      {
        rule: 'Bet No. 1 Matches',
        desc: 'Your first chosen number exactly matches the drawn result — you win the payout for Bet No. 1.',
        icon: <Trophy className="size-5 text-[#e0ac2c]" />,
      },
      {
        rule: 'Bet No. 2 Matches',
        desc: 'Your second chosen number exactly matches the drawn result — you win the payout for Bet No. 2.',
        icon: <Trophy className="size-5 text-[#d4a017]" />,
      },
      {
        rule: 'Both Numbers Win',
        desc: 'If both your numbers match the result in the same draw, you collect both payouts.',
        icon: <Star className="size-5 text-[#e0ac2c]" />,
      },
    ],
    tips: [
      'Choose two numbers with different digit patterns to cover more possible outcomes.',
      'Each number wins or loses independently — one missing does not affect the other.',
      'Both numbers can win in the same draw — collecting a double payout.',
      'Bet limits apply per number per draw slot.',
    ],
    faq: [
      { q: 'Do both numbers need to win for me to collect?', a: 'No — each number is an independent bet. If Bet No. 1 matches, you win that payout regardless of Bet No. 2.' },
      { q: 'Can I bet the same amount on both numbers?', a: 'Yes. You can set the same or different stake amounts for each number independently.' },
      { q: 'What if both numbers win in the same draw?', a: 'Both wins are paid out! You collect the payout for each matching number.' },
    ],
  },
}

/* Helper: derive which info data to show from URL param or type string */
function resolveInfoKey(typeParam: string | null): string {
  if (!typeParam) return 'cashpot'
  const t = typeParam.toLowerCase()
  if (t.includes('double')) return 'pick-2-double'
  if (t.includes('single')) return 'pick-2-single'
  if (t.includes('money') || t.includes('time')) return 'money-time'
  if (t.includes('cashpot')) return 'cashpot'
  if (INFO_MAP[t]) return t
  return 'cashpot'
}

/* ── Section heading with accent divider ─────────────────────── */
function SectionHeading({ icon, title, accent }: { icon: React.ReactNode; title: string; accent: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="size-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}
      >
        {icon}
      </div>
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <h2 className="text-sm font-black text-foreground uppercase tracking-widest whitespace-nowrap">{title}</h2>
        <div className="flex-1 h-px min-w-0" style={{ background: `linear-gradient(to right, ${accent}50, transparent)` }} />
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────── */
export function LotteryInfoPage() {
  const [searchParams] = useSearchParams()
  const routerNavigate = useNavigate()
  const navigate = (path: string) => routerNavigate(path === 'home' ? '/' : `/${path}`)

  const typeParam = searchParams.get('type')
  const infoKey = resolveInfoKey(typeParam)
  const info = INFO_MAP[infoKey] ?? INFO_MAP['cashpot']

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Scroll to top when navigating to this page or changing type
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [typeParam])

  const stats = [
    { icon: <Hash className="size-4" style={{ color: info.accentColor }} />, label: 'Numbers per Bet', value: info.howManyNumbers === 1 ? '1' : String(info.howManyNumbers) },
    { icon: <Target className="size-4" style={{ color: info.accentColor }} />, label: 'Number Range', value: info.numberRange.label },
    { icon: <Clock className="size-4" style={{ color: info.accentColor }} />, label: 'Draw Frequency', value: info.drawFrequency },
  ]

  return (
    <div className="bg-background">

      {/* ══ HERO BANNER ══════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden border-b border-border/40"
        style={{ background: `linear-gradient(135deg, #080808 0%, #0e0e0e 60%, ${info.accentColor}10 100%)` }}
      >
        {/* Ambient glows */}
        <div
          className="absolute -top-20 -right-20 size-96 rounded-full blur-[100px] pointer-events-none opacity-25"
          style={{ background: info.accentColor }}
        />
        <div
          className="absolute -bottom-10 left-10 size-64 rounded-full blur-[80px] pointer-events-none opacity-10"
          style={{ background: info.accentColor }}
        />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pt-10 sm:pb-12">
          {/* Back nav */}
          <button
            onClick={() => navigate('lotteries')}
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <span
              className="size-7 rounded-lg border border-border/60 flex items-center justify-center group-hover:border-primary/50 transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <ArrowLeft className="size-3.5" />
            </span>
            Back to Lotteries
          </button>

          {/* Hero content row */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-10">
            {/* Logo with gradient ring */}
            <div
              className="relative shrink-0 p-[2px] rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${info.accentColor}, ${info.accentColor}20)` }}
            >
              <div
                className="size-28 sm:size-36 rounded-2xl flex items-center justify-center"
                style={{ background: `radial-gradient(circle at 35% 35%, ${info.accentColor}20, #111)` }}
              >
                <img
                  src={info.logoSrc}
                  alt={info.name}
                  className="w-24 h-24 sm:w-36 sm:h-36 -m-2 object-contain relative z-10"
                />
              </div>
            </div>

            {/* Title block */}
            <div className="text-center sm:text-left pb-1 flex-1">
              <span
                className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border"
                style={{ color: info.accentColor, borderColor: `${info.accentColor}50`, background: `${info.accentColor}12` }}
              >
                {info.type}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-none mb-3">
                {info.name}
              </h1>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">{info.tagline}</p>
            </div>

            {/* Play Now Button */}
            <div className="shrink-0 mb-1 mt-1 sm:mt-0">
              <button
                onClick={() => navigate(`lotteries-by-type?type=${encodeURIComponent(infoKey)}`)}
                className="px-8 py-3.5 gold-gradient text-white font-extrabold rounded-xl hover:opacity-90 transition-all text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(224,172,44,0.15)] hover:shadow-[0_0_25px_rgba(224,172,44,0.3)] border border-primary/20"
              >
                Play Now
              </button>
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-8">
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-sm"
                style={{ background: `${info.accentColor}08`, borderColor: `${info.accentColor}28` }}
              >
                {s.icon}
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">{s.label}:</span>
                <span className="text-xs font-black text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ PAGE CONTENT ═════════════════════════════════════════════ */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-14">

        {/* ── Bet Types ── */}
        <section>
          <SectionHeading
            icon={<TrendingUp className="size-4" style={{ color: info.accentColor }} />}
            title="Bet Types"
            accent={info.accentColor}
          />
          <div className={`grid gap-4 ${
            info.betOptions.length === 1
              ? 'grid-cols-1 max-w-sm'
              : info.betOptions.length === 2
              ? 'sm:grid-cols-2'
              : 'sm:grid-cols-3'
          }`}>
            {info.betOptions.map((opt, idx) => (
              <div
                key={opt.name}
                className="relative rounded-2xl p-5 border overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  background: `linear-gradient(145deg, #0e0e0e, ${opt.color}07)`,
                  borderColor: `${opt.color}28`,
                  boxShadow: `0 0 0 0 ${opt.color}`,
                }}
              >
                {/* Corner glow */}
                <div
                  className="absolute top-0 right-0 w-20 h-20 rounded-full blur-[35px] opacity-20 pointer-events-none"
                  style={{ background: opt.color }}
                />
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="size-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0"
                    style={{ background: `${opt.color}20`, color: opt.color, border: `1px solid ${opt.color}45` }}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <span className="font-black text-sm text-foreground uppercase tracking-wide">{opt.name}</span>
                </div>
                <div
                  className="w-10 h-0.5 rounded-full mb-3"
                  style={{ background: `linear-gradient(to right, ${opt.color}, transparent)` }}
                />
                <p className="text-xs text-muted-foreground leading-relaxed">{opt.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How to Play — vertical timeline ── */}
        <section>
          <SectionHeading
            icon={<Info className="size-4" style={{ color: info.accentColor }} />}
            title="How to Play"
            accent={info.accentColor}
          />
          <div className="relative pl-2">
            {/* Connector line */}
            <div
              className="absolute left-[22px] top-9 w-px pointer-events-none"
              style={{
                height: `calc(100% - 72px)`,
                background: `linear-gradient(to bottom, ${info.accentColor}70, transparent)`,
              }}
            />
            <div className="space-y-4">
              {info.howToPlay.map((step, i) => (
                <div key={step.step} className="flex items-start gap-4">
                  {/* Step bubble */}
                  <div
                    className="relative size-[38px] rounded-full flex items-center justify-center font-black text-xs shrink-0 z-10 ring-4 ring-[#0e0e0e]"
                    style={{
                      background: `linear-gradient(135deg, ${info.accentColor}, ${info.accentColor}90)`,
                      color: '#000',
                    }}
                  >
                    {step.step}
                  </div>
                  {/* Card */}
                  <div
                    className="flex-1 rounded-xl p-4 border"
                    style={{
                      background: '#0c0c0c',
                      borderColor: i === 0 ? `${info.accentColor}35` : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <h3 className="font-bold text-sm text-foreground mb-1">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Single-column stack for content to avoid empty space ── */}
        <div className="space-y-14">

          {/* Winning Rules */}
          <section>
            <SectionHeading
              icon={<Trophy className="size-4" style={{ color: info.accentColor }} />}
              title="How Winning Works"
              accent={info.accentColor}
            />
            <div className="grid sm:grid-cols-2 gap-3">
              {info.winningRules.map((rule) => (
                <div
                  key={rule.rule}
                  className="flex items-start gap-4 p-4 rounded-xl border"
                  style={{ background: '#0c0c0c', borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  <div
                    className="size-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${info.accentColor}12`, border: `1px solid ${info.accentColor}30` }}
                  >
                    {rule.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground mb-0.5">{rule.rule}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Bet Limits */}
            <section>
              <SectionHeading
                icon={<Shield className="size-4" style={{ color: info.accentColor }} />}
                title="Bet Limits"
                accent={info.accentColor}
              />
              <div
                className="rounded-xl overflow-hidden border h-[calc(100%-3.5rem)]"
                style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#0c0c0c' }}
              >
                {[
                  {
                    icon: <TrendingUp className="size-3.5" style={{ color: info.accentColor }} />,
                    title: 'Dynamic Maximum',
                    desc: 'Each draw has a total bet limit per number. Live remaining limits are shown on the game page.',
                  },
                  {
                    icon: <Clock className="size-3.5" style={{ color: info.accentColor }} />,
                    title: 'Limits Reset Per Draw',
                    desc: 'A limit reached for one draw slot does not affect another draw slot for the same number.',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-4 ${i === 0 ? 'border-b' : ''}`}
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="size-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${info.accentColor}15`, border: `1px solid ${info.accentColor}30` }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground mb-0.5">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Pro Tips */}
            <section>
              <SectionHeading
                icon={<Star className="size-4" style={{ color: info.accentColor }} />}
                title="Pro Tips"
                accent={info.accentColor}
              />
              <div className="space-y-2">
                {info.tips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-3.5 py-3 rounded-xl border"
                    style={{ background: '#0c0c0c', borderColor: 'rgba(255,255,255,0.07)' }}
                  >
                    <span
                      className="size-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5"
                      style={{ background: `${info.accentColor}20`, color: info.accentColor }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* ── FAQ — accordion ── */}
        <section className="pb-6">
          <SectionHeading
            icon={<HelpCircle className="size-4" style={{ color: info.accentColor }} />}
            title="Frequently Asked Questions"
            accent={info.accentColor}
          />
          <div
            className="rounded-2xl border divide-y divide-white/5 overflow-hidden"
            style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#0b0b0b' }}
          >
            {info.faq.map((item, i) => (
              <div
                key={i}
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                className="border-b last:border-b-0"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.015] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded"
                      style={{ color: info.accentColor, background: `${info.accentColor}18` }}
                    >
                      Q
                    </span>
                    <span className="text-sm font-semibold text-foreground leading-snug">{item.q}</span>
                  </div>
                  <div className="shrink-0 text-muted-foreground/60">
                    {openFaq === i
                      ? <ChevronUp className="size-4" />
                      : <ChevronDown className="size-4" />
                    }
                  </div>
                </button>
                {openFaq === i && (
                  <div className="flex gap-3 px-5 pb-4 pt-0">
                    <span
                      className="shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded h-fit mt-0.5"
                      style={{ color: '#6b7280', background: 'rgba(255,255,255,0.05)' }}
                    >
                      A
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
