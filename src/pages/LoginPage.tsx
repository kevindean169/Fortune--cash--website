import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, EyeOff, User, Lock, Sparkles } from 'lucide-react'
import type { PageId } from '@/lib/fortune-data'

interface LoginPageProps {
  navigate: (page: PageId) => void
}

export function LoginPage({ navigate }: LoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-16 px-4">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button onClick={() => navigate('home')} className="inline-flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center size-10 rounded-full gold-gradient shadow-md">
              <Sparkles className="size-5 text-fortune-navy" />
            </div>
            <span className="text-2xl font-extrabold">
              <span className="gold-text">Fortune</span>
              <span> Lottery</span>
            </span>
          </button>
        </div>

        <Card className="bg-fortune-card border border-primary/20 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <CardContent className="p-8 relative">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold leading-tight mb-2">
                Welcome Back,<br />
                <span className="gold-text">High Roller!</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Log in to continue your winning journey with Fortune Lottery.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username */}
              <div className="relative">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter Your Username"
                    className="w-full bg-background border border-primary/30 rounded-xl pl-10 pr-4 py-3.5 text-sm text-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_10px_oklch(0.83_0.17_84/0.2)] transition-all placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Your Password"
                    className="w-full bg-background border border-primary/30 rounded-xl pl-10 pr-10 py-3.5 text-sm text-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_10px_oklch(0.83_0.17_84/0.2)] transition-all placeholder:text-muted-foreground/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <button type="button" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full py-6 mt-4 text-sm font-bold uppercase tracking-widest"
                style={{
                  background: 'linear-gradient(to bottom, #5c9e42, #36791d)',
                  border: '1px solid oklch(0.83 0.17 84 / 0.5)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 0 15px rgba(92,158,66,0.3)',
                  color: 'white',
                }}
              >
                Login
              </Button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-border/50 text-xs">
              <span className="text-muted-foreground">Don't have an account? </span>
              <button
                onClick={() => navigate('register')}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Create Account
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
