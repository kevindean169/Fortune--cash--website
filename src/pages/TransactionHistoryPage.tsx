import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { fetchTransactions, type ApiTransaction } from '@/lib/fortuneApi'
import { formatUsd } from '@/lib/currency'
import { Search, Calendar } from 'lucide-react'

export function TransactionHistoryPage() {
  const { accessToken } = useAuth()
  const [transactions, setTransactions] = useState<ApiTransaction[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState('all') // 'all', 'today', 'specific'
  const [selectedDate, setSelectedDate] = useState('')

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Search Query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim()
        const idMatches = tx.id.toLowerCase().includes(query)
        const typeMatches = tx.type.toLowerCase().includes(query)
        const detailsMatches = tx.details.toLowerCase().includes(query)
        if (!idMatches && !typeMatches && !detailsMatches) {
          return false
        }
      }

      // 2. Date filter
      if (timeFilter === 'today') {
        const todayStr = new Date().toLocaleDateString('en-CA')
        return tx.localDate === todayStr
      } else if (timeFilter === 'specific' && selectedDate) {
        return tx.localDate === selectedDate
      }

      return true
    })
  }, [transactions, searchQuery, timeFilter, selectedDate])

  const hasActiveFilters = searchQuery.trim() !== '' || timeFilter !== 'all'

  const displayLastPage = useMemo(() => {
    if (hasActiveFilters) {
      return Math.max(Math.ceil(filteredTransactions.length / 10), 1)
    }
    return lastPage
  }, [filteredTransactions.length, hasActiveFilters, lastPage])

  const paginatedTransactions = useMemo(() => {
    if (hasActiveFilters) {
      const startIndex = (page - 1) * 10
      return filteredTransactions.slice(startIndex, startIndex + 10)
    }
    return filteredTransactions
  }, [filteredTransactions, hasActiveFilters, page])

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [searchQuery, timeFilter, selectedDate])

  useEffect(() => {
    if (!accessToken) return

    let cancelled = false
    setLoading(true)
    setError(null)

    const delayDebounce = setTimeout(() => {
      const options: any = {}
      if (searchQuery.trim() !== '') {
        options.search = searchQuery.trim()
      }
      if (timeFilter === 'today') {
        options.filter = 'today'
        const todayStr = new Date().toLocaleDateString('en-CA')
        options.startdate = todayStr
        options.enddate = todayStr
      } else if (timeFilter === 'specific' && selectedDate) {
        options.startdate = selectedDate
        options.enddate = selectedDate
      }

      const limit = hasActiveFilters ? 100 : 10
      const fetchPage = hasActiveFilters ? 1 : page

      fetchTransactions(accessToken, fetchPage, limit, options)
        .then((result) => {
          if (cancelled) return
          setTransactions(result.items)
          if (!hasActiveFilters) {
            setLastPage(Math.max(result.lastPage || 1, 1))
          }
        })
        .catch((err: Error) => {
          if (cancelled) return
          setTransactions([])
          setError(err.message)
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false)
            window.scrollTo(0, 0)
          }
        })
    }, searchQuery ? 300 : 0)

    return () => {
      cancelled = true
      clearTimeout(delayDebounce)
    }
  }, [accessToken, page, searchQuery, timeFilter, selectedDate, hasActiveFilters])

  const typeBadge = (type: string) => {
    const normalized = type.toLowerCase()
    if (normalized.includes('deposit')) return 'bg-green-500/10 text-green-400 border-green-500/20'
    if (normalized.includes('withdrawal')) return 'bg-red-500/10 text-red-400 border-red-500/20'
    if (normalized.includes('payout') || normalized.includes('winning')) return 'bg-primary/10 text-primary border-primary/20'
    return 'bg-muted text-muted-foreground border-border'
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">
            Wallet <span className="gold-text">Transactions</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Track deposit funding, payouts, and ticket purchase audits</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-6 bg-fortune-card border border-border/60 p-4 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <input
            type="text"
            placeholder="Search by Transaction ID or Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Quick Filters */}
          <div className="flex bg-background border border-border rounded-xl p-1">
            <button
              onClick={() => {
                setTimeFilter('all')
                setSelectedDate('')
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                timeFilter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => {
                setTimeFilter('today')
                setSelectedDate('')
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                timeFilter === 'today'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Today
            </button>
          </div>

          {/* Specific Date Picker */}
          <div className="relative flex items-center bg-background border border-border rounded-xl px-3 py-1">
            <Calendar className="text-muted-foreground size-4 mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                if (e.target.value) {
                  setTimeFilter('specific')
                } else {
                  setTimeFilter('all')
                }
              }}
              className="bg-transparent border-0 text-xs text-foreground focus:outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      <Card className="bg-fortune-card border border-border/60 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading transactions...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">{error}</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No transactions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-white/[0.01]">
                    <th className="text-left text-muted-foreground font-medium px-6 py-4 text-xs uppercase tracking-wider">Transaction ID</th>
                    <th className="text-left text-muted-foreground font-medium px-6 py-4 text-xs uppercase tracking-wider">Type & Details</th>
                    <th className="text-left text-muted-foreground font-medium px-6 py-4 text-xs uppercase tracking-wider">Timestamp</th>
                    <th className="text-right text-muted-foreground font-medium px-6 py-4 text-xs uppercase tracking-wider">Amount</th>
                    <th className="text-right text-muted-foreground font-medium px-6 py-4 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-border/50 hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{transaction.id}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${typeBadge(transaction.type)}`}>
                          {transaction.type}
                        </span>
                        {transaction.details && (
                          <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
                             {transaction.details}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{transaction.date}</td>
                      <td className={`px-6 py-4 text-right font-extrabold text-sm ${transaction.positive ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.positive ? '+' : '-'}{formatUsd(Math.abs(transaction.amount))}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
          Previous
        </Button>
        <div className="h-9 px-4 rounded-md border border-border bg-background flex items-center text-sm font-bold">
          {page} / {displayLastPage}
        </div>
        <Button variant="outline" size="sm" disabled={page >= displayLastPage || loading} onClick={() => setPage((current) => current + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}
