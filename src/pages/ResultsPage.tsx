import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { fetchResults, type ApiDrawResult } from '@/lib/fortuneApi'

const tabs = [
  { id: 'cashpot', name: 'Cashpot', apiType: 'cashpot' },
  { id: 'moneytime', name: 'Money Time', apiType: 'money-time' },
  { id: 'pick2single', name: 'Pick 2 Single', apiType: 'pick2-single' },
  { id: 'pick2double', name: 'Pick 2 Double', apiType: 'pick2-double' },
]

const getTabIcon = (id: string) => {
  switch (id) {
    case 'cashpot':
      return <img src="/cashpot_logo.png?v=6" alt="Cashpot" className="w-12 h-12 -m-1.5 object-contain" />
    case 'moneytime':
      return <img src="/moneytime_logo.png?v=6" alt="Money Time" className="w-12 h-12 -m-1.5 object-contain" />
    case 'pick2single':
      return <img src="/pick2_single.png?v=6" alt="Pick 2 Single" className="w-12 h-12 -m-1.5 object-contain" />
    case 'pick2double':
      return <img src="/pick2_double.png?v=6" alt="Pick 2 Double" className="w-12 h-12 -m-1.5 object-contain" />
    default:
      return null
  }
}

export function ResultsPage() {
  const routerNavigate = useNavigate()
  const navigate = (path: string) => routerNavigate(path === 'home' ? '/' : `/${path}`)
  const [activeTab, setActiveTab] = useState('cashpot')
  const [results, setResults] = useState<ApiDrawResult[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0]

    setLoading(true)
    setError(null)

    fetchResults(currentTab.apiType, page, 6)
      .then((result) => {
        if (cancelled) return
        setResults(result.items)
        setLastPage(Math.max(result.lastPage || 1, 1))
      })
      .catch((err: Error) => {
        if (cancelled) return
        setResults([])
        setLastPage(1)
        setError(err.message)
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
          window.scrollTo(0, 0)
        }
      })

    return () => {
      cancelled = true
    }
  }, [activeTab, page])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setPage(1)
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button onClick={() => navigate('home')} className="text-primary hover:underline text-sm font-bold mb-4 inline-block">
            Back to Home
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Official Draw <span className="gold-text">Results</span>
          </h1>
          <p className="text-muted-foreground mt-2">Comprehensive history of all past winning numbers.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border flex items-center gap-2.5 ${activeTab === tab.id
                  ? 'gold-gradient shadow-md'
                  : 'bg-fortune-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
            >
              {getTabIcon(tab.id)}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
            {Array(6).fill(0).map((_, i) => (
              <Card
                key={`skeleton-${i}`}
                className="bg-[#0c0c0c] border border-white/5 animate-pulse"
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4 gap-3">
                    <div className="space-y-2 w-full">
                      <div className="h-5 w-24 bg-white/5 rounded" />
                      <div className="h-3 w-32 bg-white/5 rounded" />
                      <div className="h-3 w-20 bg-white/5 rounded" />
                    </div>
                    <div className="h-6 w-16 bg-white/5 rounded" />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5 gap-4">
                    <div className="flex items-center gap-2">
                       <div className="size-12 rounded-full bg-white/5" />
                       <div className="size-12 rounded-full bg-white/5" />
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="size-10 rounded-full bg-white/5" />
                       <div className="size-10 rounded-full bg-white/5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-400">{error}</div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">No results found.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
              {results.map((result, i) => {
                const isDouble = result.numbers.length > 1
                const hasMegaMonsta = Boolean(result.megaball || result.monstaball)

                return (
                  <Card
                    key={`${result.id}-${result.draw_no}-${i}`}
                    className="bg-fortune-card border border-border/60 hover:-translate-y-1 hover:border-primary/30 transition-all"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4 gap-3">
                        <div>
                          <span className="font-extrabold text-lg text-foreground">{result.draw_no ? `${result.draw_no}` : 'Draw Result'}</span>
                          <p className="text-[13px] text-muted-foreground mt-1">{result.draw_time}</p>
                          <p className="text-[12px] text-primary/80 font-bold mt-1">{result.lottery_name}</p>
                        </div>
                        <div className="bg-primary/10 text-primary px-2.5 py-1 rounded text-xs font-extrabold uppercase tracking-wider">
                          {result.game_label || (isDouble ? 'Double' : 'Single')}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/50 gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {result.numbers.map((num, idx) => (
                            <div key={`${result.id}-num-${idx}`} className="flex flex-col items-center gap-1.5">
                              <div className="number-ball number-ball-result size-12 text-base font-black">
                                {num}
                              </div>
                              <span className="text-[11px] text-muted-foreground font-bold tracking-wider uppercase">Number</span>
                            </div>
                          ))}
                        </div>

                        {hasMegaMonsta && (
                          <div className="flex items-center gap-2">
                            {result.megaball && (
                              <div className="flex flex-col items-center gap-1.5">
                                <div className={`number-ball size-10 ${result.megaball === 'yellow' ? 'number-ball-monsta' : 'number-ball-result'}`} />
                                <span className="text-[11px] text-amber-400 tracking-wider uppercase font-bold">Mega</span>
                              </div>
                            )}
                            {result.monstaball && (
                              <div className="flex flex-col items-center gap-1.5">
                                <div className={`number-ball size-10 ${result.monstaball === 'red' ? 'number-ball-mega' : 'number-ball-result'}`} />
                                <span className="text-[11px] text-red-400 tracking-wider uppercase font-bold">Monsta</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
                Previous
              </Button>
              <div className="h-9 px-4 rounded-md border border-border bg-background flex items-center text-sm font-bold">
                {page} / {lastPage}
              </div>
              <Button variant="outline" size="sm" disabled={page >= lastPage || loading} onClick={() => setPage((current) => current + 1)}>
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
