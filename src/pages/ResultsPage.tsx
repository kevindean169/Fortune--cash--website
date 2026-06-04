import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'

const tabs = [
  { id: 'cashpot', name: 'Cashpot' },
  { id: 'moneytime', name: 'Money Time' },
  { id: 'pick2single', name: 'Pick 2 Single' },
  { id: 'pick2double', name: 'Pick 2 Double' },
]

const getTabIcon = (id: string) => {
  switch (id) {
    case 'cashpot':
      return <img src="/cashpot_logo.png" alt="Cashpot" className="w-7 h-7 object-contain" />
    case 'moneytime':
      return <img src="/moneytime_logo.png" alt="Money Time" className="w-7 h-7 object-contain" />
    case 'pick2single':
    case 'pick2double':
      return <img src="/pick2_logo.png" alt="Pick 2" className="w-7 h-7 object-contain" />
    default:
      return null
  }
}

const cashpotResults = [
  { draw_no: '4521', draw_time: '30 May, 2026 • 6:00 PM', cashpot_no: '14', megaball: 'yellow', monstaball: 'red' },
  { draw_no: '4520', draw_time: '30 May, 2026 • 2:00 PM', cashpot_no: '07', megaball: 'white', monstaball: 'red' },
  { draw_no: '4519', draw_time: '29 May, 2026 • 6:00 PM', cashpot_no: '28', megaball: 'yellow', monstaball: 'white' },
  { draw_no: '4518', draw_time: '29 May, 2026 • 2:00 PM', cashpot_no: '03', megaball: 'white', monstaball: 'white' },
  { draw_no: '4517', draw_time: '28 May, 2026 • 6:00 PM', cashpot_no: '19', megaball: 'yellow', monstaball: 'red' },
  { draw_no: '4516', draw_time: '28 May, 2026 • 2:00 PM', cashpot_no: '35', megaball: 'white', monstaball: 'white' },
]

const moneytimeResults = [
  { draw_no: '2804', draw_time: '30 May, 2026 • 7:00 PM', cashpot_no: '33', megaball: 'white', monstaball: 'white' },
  { draw_no: '2803', draw_time: '30 May, 2026 • 3:00 PM', cashpot_no: '05', megaball: 'yellow', monstaball: 'red' },
  { draw_no: '2802', draw_time: '29 May, 2026 • 7:00 PM', cashpot_no: '19', megaball: 'white', monstaball: 'red' },
  { draw_no: '2801', draw_time: '29 May, 2026 • 3:00 PM', cashpot_no: '11', megaball: 'yellow', monstaball: 'white' },
  { draw_no: '2800', draw_time: '28 May, 2026 • 7:00 PM', cashpot_no: '27', megaball: 'white', monstaball: 'red' },
]

const pick2SingleResults = [
  { draw_no: '892', draw_time: '30 May, 2026 • 6:00 PM', cashpot_no: '25' },
  { draw_no: '891', draw_time: '30 May, 2026 • 2:00 PM', cashpot_no: '09' },
  { draw_no: '890', draw_time: '29 May, 2026 • 6:00 PM', cashpot_no: '14' },
  { draw_no: '889', draw_time: '29 May, 2026 • 2:00 PM', cashpot_no: '73' },
  { draw_no: '888', draw_time: '28 May, 2026 • 6:00 PM', cashpot_no: '51' },
]

const pick2DoubleResults = [
  { draw_no: '1092', draw_time: '30 May, 2026 • 6:00 PM', cashpot_no: '12,18' },
  { draw_no: '1091', draw_time: '30 May, 2026 • 2:00 PM', cashpot_no: '04,22' },
  { draw_no: '1090', draw_time: '29 May, 2026 • 6:00 PM', cashpot_no: '09,15' },
  { draw_no: '1089', draw_time: '29 May, 2026 • 2:00 PM', cashpot_no: '31,07' },
  { draw_no: '1088', draw_time: '28 May, 2026 • 6:00 PM', cashpot_no: '22,44' },
]

export function ResultsPage() {
  const routerNavigate = useNavigate()
  const navigate = (path: string) => routerNavigate(path === 'home' ? '/' : `/${path}`)
  const [activeTab, setActiveTab] = useState('cashpot')

  const getActiveResults = () => {
    switch (activeTab) {
      case 'moneytime': return moneytimeResults
      case 'pick2single': return pick2SingleResults
      case 'pick2double': return pick2DoubleResults
      default: return cashpotResults
    }
  }

  const hasMegaMonsta = activeTab === 'cashpot' || activeTab === 'moneytime'
  const isDouble = activeTab === 'pick2double'

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('home')} className="text-primary hover:underline text-sm font-bold mb-4 inline-block">
            ← Back to Home
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Official Draw <span className="gold-text">Results</span>
          </h1>
          <p className="text-muted-foreground mt-2">Comprehensive history of all past winning numbers.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all border flex items-center gap-2.5 ${activeTab === tab.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-md gold-glow'
                  : 'bg-fortune-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
            >
              {getTabIcon(tab.id)}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Results Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
          {getActiveResults().map((result, i) => (
            <Card
              key={result.draw_no}
              className="bg-fortune-card border border-border/60 hover:-translate-y-1 hover:border-primary/30 transition-all"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="font-extrabold text-lg text-foreground">#{result.draw_no}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{result.draw_time}</p>
                  </div>
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                    {isDouble ? 'Double' : 'Single'}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    {isDouble ? (
                      (result.cashpot_no as string).split(',').map((num, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary/30 bg-primary/10 font-extrabold text-base text-primary"
                        >
                          {num.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-primary/30 bg-primary/10 font-extrabold text-lg text-primary">
                        {result.cashpot_no}
                      </span>
                    )}
                  </div>

                  {hasMegaMonsta && 'megaball' in result && (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 mb-1 ${(result as any).megaball === 'yellow'
                              ? 'bg-primary/20 border-primary text-primary'
                              : 'bg-muted border-border text-muted-foreground'
                            }`}
                        >
                          M
                        </span>
                        <span className="text-[9px] text-muted-foreground font-bold uppercase">Mega</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 mb-1 ${(result as any).monstaball === 'red'
                              ? 'bg-red-500/15 border-red-500 text-red-400'
                              : 'bg-muted border-border text-muted-foreground'
                            }`}
                        >
                          X
                        </span>
                        <span className="text-[9px] text-muted-foreground font-bold uppercase">Monsta</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  )
}
