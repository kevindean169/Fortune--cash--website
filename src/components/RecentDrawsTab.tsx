import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

interface RecentDrawsTabProps {
  lotteryId: string
}

function formatDateTimeToLocal(dateTimeStr: string): string {
  if (!dateTimeStr) return '-';
  
  const cleanStr = dateTimeStr.trim().replace(' ', 'T');
  const dateObj = new Date(`${cleanStr}-05:00`);
  
  if (isNaN(dateObj.getTime())) {
    return dateTimeStr;
  }

  const localTimeDisplay = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
  const localDateDisplay = dateObj.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  
  return `${localDateDisplay} ${localTimeDisplay}`;
}

export function RecentDrawsTab({ lotteryId }: RecentDrawsTabProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const baseUrl = import.meta.env.VITE_API_URL || ''
    
    fetch(`${baseUrl}/api/recent-draws/${lotteryId}?page=${page}&per_page=10`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch recent draws')
        return res.json()
      })
      .then(resData => {
        if (cancelled) return
        if (resData.data) {
          setData(resData.data)
          if (resData.drawCount) {
             setLastPage(Math.max(1, Math.ceil(resData.drawCount / 10)))
          } else {
             setLastPage(page + (resData.data.length === 10 ? 1 : 0))
          }
        } else {
          setData([])
        }
      })
      .catch(err => {
        if (cancelled) return
        setError(err.message)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
      
    return () => { cancelled = true }
  }, [lotteryId, page])

  return (
     <div className="py-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground font-semibold">Loading recent draws...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-400 font-semibold">{error}</div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground font-semibold">No recent draws found.</div>
        ) : (
          <>
            <Card className="bg-fortune-card border border-border/60 mb-6">
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/15 border-b border-primary/20">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4">Draw No</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4">Draw Time</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4">Game</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-primary/80 p-4 text-center">Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((draw, i) => {
                       const mainNumber = draw.cashpot_no || draw.pick2_no || draw.winning_number || ''
                       const numbers = mainNumber ? String(mainNumber).split(/[,-]/).map(n => n.trim()) : []
                       const hasMegaMonsta = Boolean(draw.megaball || draw.monstaball)
                       
                       return (
                        <TableRow key={`${draw.id}-${i}`} className="hover:bg-white/5 border-border/50 group transition-colors">
                          <TableCell className="px-4 py-2 font-black text-foreground">{draw.draw_no}</TableCell>
                          <TableCell className="px-4 py-2 text-xs text-zinc-400 font-medium">{formatDateTimeToLocal(draw.draw_time)}</TableCell>
                          <TableCell className="px-4 py-2 font-bold text-primary text-xs uppercase tracking-wider">{draw.lottery_type}</TableCell>
                          <TableCell className="px-4 py-2">
                            <div className="flex items-center justify-center gap-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {numbers.map((num: string, idx: number) => {
                                  const numLabel = numbers.length > 1 
                                    ? `NUM ${idx + 1}`
                                    : draw.lottery_type?.toLowerCase().includes('cashpot')
                                      ? 'CASHPOT'
                                      : 'NUM';
                                      
                                  return (
                                    <div key={idx} className="flex flex-col items-center gap-1">
                                      <div className="number-ball number-ball-result size-8 text-xs font-black">
                                        {num}
                                      </div>
                                      <span className="text-[9px] text-muted-foreground font-bold tracking-wider uppercase">{numLabel}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              {hasMegaMonsta && (
                                <div className="flex items-center gap-2 ml-2 pl-4 border-l border-border/50">
                                  {draw.megaball && (
                                    <div className="flex flex-col items-center gap-1">
                                      <div className={`number-ball size-8 ${draw.megaball === 'yellow' ? 'number-ball-monsta' : 'number-ball-result'}`} />
                                      <span className="text-[9px] text-amber-400 tracking-wider uppercase font-bold">Mega</span>
                                    </div>
                                  )}
                                  {draw.monstaball && (
                                    <div className="flex flex-col items-center gap-1">
                                      <div className={`number-ball size-8 ${draw.monstaball === 'red' ? 'number-ball-mega' : 'number-ball-result'}`} />
                                      <span className="text-[9px] text-red-400 tracking-wider uppercase font-bold">Monsta</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                       )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            {lastPage > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  Prev
                </Button>
                <div className="h-9 px-4 rounded-md border border-border bg-background flex items-center text-sm font-bold">
                  {page} / {lastPage}
                </div>
                <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
     </div>
  )
}
