import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { APILottery } from '@/types/lottery'
import { useDateTimeCountdown } from '@/hooks/useDateTimeCountdown'

const isNotStarted = (startDateTime: string) => {
  if (!startDateTime) return false
  
  let dtStr = startDateTime.trim()
  if (dtStr) {
    if (!dtStr.endsWith('Z')) {
      dtStr = dtStr.replace(' ', 'T').substring(0, 19) + '-05:00'
    }
  }
  
  return new Date().getTime() < new Date(dtStr).getTime()
}

const mapTypeToPath = (type: string, name?: string): string => {
  const t = type?.toLowerCase() || ''
  const n = name?.toLowerCase() || ''
  if (t.includes('double') || n.includes('double')) return 'pick-2-double'
  if (t.includes('single') || n.includes('single')) return 'pick-2-single'
  if (t.includes('money time') || n.includes('money time') || t.includes('moneytime') || n.includes('moneytime')) return 'money-time'
  return 'cashpot'
}

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '/lottery_machine.jpg'
  if (imagePath.startsWith('http')) return imagePath
  const baseUrl = (import.meta.env.VITE_API_URL || 'https://fortunescash.com').replace(/\/$/, '')
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
}

export function GameCard({ game }: { game: APILottery }) {
  const routerNavigate = useNavigate()
  const navigate = (path: string) => routerNavigate(`/${path}`)

  const notStarted = isNotStarted(game.startDateTime)
  const targetDate = notStarted ? game.startDateTime : game.currentDraw

  const [d, h, m, s] = useDateTimeCountdown(targetDate)
  const isZero = d === '00' && h === '00' && m === '00' && s === '00'
  const displayNotStarted = notStarted || isZero
  const path = mapTypeToPath(game.type, game.name)
  const infoPath = `/lottery-info?type=${encodeURIComponent(game.type || game.name)}`

  return (
    <div
      className="bg-fortune-card border border-border/60 rounded-xl flex overflow-hidden shadow-[0_0_10px_rgba(224,172,44,0.05)] hover:shadow-[0_0_20px_rgba(224,172,44,0.15)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
      onClick={() => routerNavigate(infoPath)}
    >
      {/* Left: Image */}
      <div className="w-[38%] sm:w-[32%] relative shrink-0 bg-background overflow-hidden">
        <img
          src={getImageUrl(game.image)}
          alt={game.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* slant overlay */}
        <div
          className="absolute top-0 bottom-0 right-0 w-8 bg-fortune-card z-20"
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)', transform: 'translateX(1px)' }}
        />
      </div>

      {/* Right: Content */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between z-20 min-h-[160px]">
        {/* Badge & Title */}
        <div className="flex justify-between items-start mb-3 gap-2">
          <div className="flex flex-col gap-1 items-start shrink-0">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); routerNavigate(infoPath) }}
              className="px-2.5 py-0.5 bg-[#e0ac2c]/10 border border-[#e0ac2c]/20 text-[#e0ac2c] rounded text-[10px] font-bold whitespace-nowrap uppercase tracking-wider hover:bg-[#e0ac2c]/20 hover:border-[#e0ac2c]/40 transition-all cursor-pointer"
              title={`Learn about ${game.type}`}
            >
              {game.type?.toUpperCase() === 'CASHPOT MONEY TIME' ? 'MONEY TIME' : game.type}
            </button>
            {game.schedule && (
              <span className="text-[9px] text-[#e0ac2c]/70 font-bold uppercase tracking-wider pl-0.5">
                {game.schedule}
              </span>
            )}
          </div>
          <h3 className="font-extrabold text-foreground text-sm text-right pl-2 leading-tight uppercase tracking-wider min-w-0 break-words flex-1">
            {game.name}
          </h3>
        </div>

        {/* Countdown */}
        <div className="mb-3 text-right">
          <p className="text-[10px] text-muted-foreground/80 mb-1.5 font-bold uppercase tracking-widest">
            {displayNotStarted ? 'Lottery Starts In' : 'Next Draw In'}
          </p>
          <div className="flex gap-1.5 justify-end">
            {[{ v: d, l: 'Day' }, { v: h, l: 'Hour' }, { v: m, l: 'Min' }, { v: s, l: 'Sec' }].map((t) => (
              <div key={t.l} className="flex flex-col items-center">
                <div className="w-9 h-8 rounded border border-neutral-800 flex items-center justify-center bg-black/60 mb-1 shadow-inner">
                  <span className="font-extrabold text-xs text-white tabular-nums">{t.v}</span>
                </div>
                <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">{t.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bet Button */}
        <Button
          size="sm"
          onClick={(e) => { e.stopPropagation(); navigate(`${path}?id=${game.id}`) }}
          className="w-[80%] self-end gold-gradient text-white font-bold rounded-lg h-9 hover:opacity-90 transition-all text-xs tracking-wide shadow-md"
        >
          Bet Now
        </Button>
      </div>
    </div>
  )
}
