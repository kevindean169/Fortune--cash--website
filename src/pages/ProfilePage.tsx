import { Card, CardContent } from '@/components/ui/card'
import { User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export function ProfilePage() {
  const { accessToken, user: authUser } = useAuth()
  const [profileData, setProfileData] = useState<any>(authUser)
  const [loading, setLoading] = useState<boolean>(!authUser)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) {
      setError('Please login to view your profile.')
      setLoading(false)
      return
    }

    const baseUrl = import.meta.env.VITE_AUTH_API_URL || 'https://node.rglabs.net/api/v1'
    const appKey = import.meta.env.VITE_AUTH_API_KEY || 'c326d53a97bc32972cc7de9d4f03d27845efc9a81d8f1e7af347f3da42cbd52e'

    fetch(`${baseUrl}/auth/me`, {
      headers: {
        'X-App-Key': appKey,
        'Authorization': `Bearer ${accessToken}`,
      }
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success && resData.data) {
          setProfileData(resData.data)
        } else {
          // If fetch fails but we already have authUser, don't show block error
          if (!authUser) {
            setError(resData.message || 'Failed to retrieve profile')
          }
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Fetch profile error:', err)
        if (!authUser) {
          setError('Failed to retrieve profile details')
        }
        setLoading(false)
      })
  }, [accessToken, authUser])

  if (loading) {
    return (
      <Card className="bg-fortune-card border border-border/60">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground text-sm mt-4">Loading profile details...</p>
        </CardContent>
      </Card>
    )
  }

  // Only show full page error if we have no local cache profileData to display
  if (error && !profileData) {
    return (
      <Card className="bg-fortune-card border border-border/60">
        <CardContent className="p-8 text-center">
          <p className="text-red-400 font-semibold">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const displayData = profileData || authUser

  return (
    <Card className="bg-fortune-card border border-border/60 animate-in fade-in slide-in-from-bottom-2">
      <CardContent className="p-6 sm:p-8">
        <h3 className="font-bold text-xl text-foreground border-b border-border pb-4 mb-6 flex items-center gap-2">
          <User className="size-5 text-primary" />
          Personal Details
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 bg-background/30 border border-neutral-900 rounded-2xl">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-1">User ID</label>
              <span className="text-base font-extrabold text-foreground tracking-wide font-mono block break-all">
                {displayData?.id || '—'}
              </span>
            </div>
            <div className="p-4 bg-background/30 border border-neutral-900 rounded-2xl">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-1">Username</label>
              <span className="text-base font-extrabold text-foreground tracking-wide block">
                {displayData?.username || '—'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 bg-background/30 border border-neutral-900 rounded-2xl">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-1">Role</label>
              <span className="text-base font-extrabold text-primary uppercase tracking-wider block">
                {displayData?.role || '—'}
              </span>
            </div>
            <div className="p-4 bg-background/30 border border-neutral-900 rounded-2xl">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-1">Status</label>
              <span className={`text-base font-extrabold block uppercase tracking-wider ${displayData?.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                {displayData?.status || '—'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
