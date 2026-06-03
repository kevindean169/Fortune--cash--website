import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Ticket, Search, Trophy, Clock, XCircle, AlertCircle } from 'lucide-react'
import { MOCK_TICKETS } from '@/lib/fortune-data'
import type { PageId } from '@/lib/fortune-data'

interface MyTicketsPageProps {
  navigate: (page: PageId) => void
}

const STATUS_CONFIG = {
  won: { label: 'Won', icon: <Trophy className="size-3" />, className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  lost: { label: 'No Win', icon: <XCircle className="size-3" />, className: 'bg-muted text-muted-foreground border-border/50' },
  active: { label: 'Active', icon: <Clock className="size-3" />, className: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  pending: { label: 'Pending', icon: <AlertCircle className="size-3" />, className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
}

export function MyTicketsPage({ navigate }: MyTicketsPageProps) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [gameFilter, setGameFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = MOCK_TICKETS.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    const matchGame = gameFilter === 'all' || t.game === gameFilter
    const matchSearch = !search || t.id.toLowerCase().includes(search.toLowerCase()) || t.game.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchGame && matchSearch
  })

  const stats = {
    total: MOCK_TICKETS.length,
    won: MOCK_TICKETS.filter(t => t.status === 'won').length,
    active: MOCK_TICKETS.filter(t => t.status === 'active' || t.status === 'pending').length,
    totalWon: MOCK_TICKETS.filter(t => t.prize).reduce((sum, t) => sum + parseFloat((t.prize ?? '$0').replace('$', '').replace(',', '')), 0),
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            My <span className="gold-text">Tickets</span>
          </h1>
          <p className="text-muted-foreground">Your complete lottery ticket history</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Tickets', value: stats.total, color: 'text-foreground' },
            { label: 'Winning Tickets', value: stats.won, color: 'text-emerald-400' },
            { label: 'Active / Pending', value: stats.active, color: 'text-sky-400' },
            { label: 'Total Won', value: `$${stats.totalWon.toLocaleString()}`, color: 'text-primary' },
          ].map((s, i) => (
            <Card key={i} className="bg-fortune-card border-border">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-fortune-card border-border"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-fortune-card border-border">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">No Win</SelectItem>
            </SelectContent>
          </Select>
          <Select value={gameFilter} onValueChange={setGameFilter}>
            <SelectTrigger className="w-36 bg-fortune-card border-border">
              <SelectValue placeholder="All Games" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              <SelectItem value="Cash Pop">Cash Pop</SelectItem>
              <SelectItem value="Pick 2">Pick 2</SelectItem>
              <SelectItem value="Pick 3">Pick 3</SelectItem>
              <SelectItem value="Pick 4">Pick 4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          {filtered.map(ticket => {
            const statusConf = STATUS_CONFIG[ticket.status]
            return (
              <Card key={ticket.id} className={`bg-fortune-card border-border ${
                ticket.status === 'won' ? 'border-emerald-500/20' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Numbers */}
                      <div className="flex gap-1.5">
                        {ticket.numbers.map((n, i) => (
                          <div
                            key={i}
                            className={`number-ball text-xs ${
                              ticket.status === 'won' ? 'number-ball-selected' :
                              ticket.status === 'active' || ticket.status === 'pending' ? 'number-ball-idle' :
                              'number-ball-idle opacity-60'
                            }`}
                            style={{ width: '2rem', height: '2rem' }}
                          >
                            {n}
                          </div>
                        ))}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-sm">{ticket.game}</p>
                          <Badge className={`text-xs gap-1 ${statusConf.className}`}>
                            {statusConf.icon} {statusConf.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {ticket.id} · Draw: {ticket.drawDate}
                        </p>
                      </div>
                    </div>

                    {/* Prize / Action */}
                    <div className="flex items-center gap-4">
                      {ticket.prize && (
                        <div className="text-right">
                          <p className="font-extrabold text-lg text-emerald-400">{ticket.prize}</p>
                          <p className="text-xs text-muted-foreground">Prize Won 🎉</p>
                        </div>
                      )}
                      {(ticket.status === 'active' || ticket.status === 'pending') && (
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sky-400">
                            <Clock className="size-3.5" />
                            <p className="text-sm font-medium">Awaiting draw</p>
                          </div>
                        </div>
                      )}
                      {ticket.status === 'lost' && (
                        <p className="text-sm text-muted-foreground">Better luck next time!</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Ticket className="size-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium mb-1">No tickets found</p>
              <p className="text-sm mb-4">Try adjusting your filters or play a game!</p>
              <Button className="gold-gradient text-fortune-navy font-bold" onClick={() => navigate('games')}>
                Play Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
