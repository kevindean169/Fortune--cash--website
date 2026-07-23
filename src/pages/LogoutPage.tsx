import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function LogoutPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Perform the logout logic immediately when the page opens
    logout(false)
  }, [logout])

  return (
    <div className="flex items-center justify-center relative overflow-hidden py-16 px-4 bg-background">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header Logo */}
        <div className="text-center mb-2">
          <button onClick={() => navigate('/')} className="inline-flex items-center justify-center mb-1">
            <img 
              src="/favicon.png" 
              alt="Fortune Logo" 
              className="w-16 h-16 object-contain rounded-xl shadow-[0_0_15px_rgba(224,172,44,0.25)]" 
            />
          </button>
        </div>

        {/* Logout Content Card */}
        <Card className="bg-fortune-card border-2 border-primary/40 border-b-[8px] border-b-primary/90 border-r-[4px] border-r-primary/70 rounded-3xl shadow-[inset_2px_2px_5px_rgba(255,255,255,0.05),0_10px_25px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 border border-primary/30 mb-4 animate-pulse">
                <LogOut className="size-8 text-primary" />
              </div>
              <h1 className="text-2xl font-extrabold mb-3">
                Logged <span className="gold-text">Out</span>
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                You have been successfully logged out.
              </p>
              <p className="text-muted-foreground/80 text-xs">
                Thank you for playing with Fortune Lottery!
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => navigate('/login')}
                className="w-full py-6 text-sm font-bold uppercase tracking-widest gold-gradient text-fortune-navy gold-glow hover:opacity-90 transition-all cursor-pointer"
              >
                Login Again
              </Button>

              <button
                onClick={() => navigate('/')}
                className="w-full py-3.5 text-xs font-bold uppercase tracking-widest border border-primary/30 rounded-xl text-primary hover:bg-primary/10 transition-all cursor-pointer block text-center"
              >
                Go to Homepage
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
