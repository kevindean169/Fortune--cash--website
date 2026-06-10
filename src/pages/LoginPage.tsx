import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, EyeOff, User, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function LoginPage() {
  const routerNavigate = useNavigate()
  const navigate = (path: string) => routerNavigate(path === 'home' ? '/' : `/${path}`)
  const { user, accessToken, loading, login, error, setError } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const authError = sessionStorage.getItem('fortune_auth_error')
    if (authError) {
      setError(authError)
      sessionStorage.removeItem('fortune_auth_error')
    }
  }, [setError])

  useEffect(() => {
    if (!loading && user && accessToken) {
      routerNavigate('/dashboard', { replace: true })
    }
  }, [accessToken, loading, routerNavigate, user])

  if (loading) {
    return null
  }

  if (user && accessToken) {
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!ageConfirmed || !termsAccepted) {
      alert('Please confirm your age and accept the Terms & Conditions')
      return
    }
    setSubmitting(true)
    const success = await login(username, password)
    setSubmitting(false)
    if (success) {
      navigate('dashboard')
    }
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
        <div className="text-center mb-2">
          <button onClick={() => navigate('home')} className="inline-flex items-center justify-center mb-1">
            <img src="/favicon.png" alt="Fortune Logo" className="w-16 h-16 object-contain rounded-xl shadow-[0_0_15px_rgba(224,172,44,0.25)]" />
          </button>
        </div>

        <Card className="bg-fortune-card border-2 border-primary/40 border-b-[8px] border-b-primary/90 border-r-[4px] border-r-primary/70 rounded-3xl shadow-[inset_2px_2px_5px_rgba(255,255,255,0.05),0_10px_25px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold mb-1">
                Welcome <span className="gold-text"> Back</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Log in to continue your winning journey with Fortune Lottery
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-xs mb-4 text-center">
                {error}
              </div>
            )}

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

              {/* Checkboxes */}
              <div className="space-y-3 mt-4 text-left">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    id="login-age"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-primary/30 accent-primary text-primary bg-background size-4 cursor-pointer focus:ring-0 focus:outline-none"
                  />
                  <label htmlFor="login-age" className="text-sm text-muted-foreground cursor-pointer select-none leading-normal">
                    I confirm that I am 18 years of age or older.
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    id="login-terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-primary/30 accent-primary text-primary bg-background size-4 cursor-pointer focus:ring-0 focus:outline-none"
                  />
                  <label htmlFor="login-terms" className="text-sm text-muted-foreground cursor-pointer select-none leading-normal">
                    I have read and agree to the <span className="text-primary hover:underline cursor-pointer" onClick={() => navigate('terms')}>Terms & Conditions</span> and <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
                  </label>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-6 mt-4 text-sm font-bold uppercase tracking-widest gold-gradient text-fortune-navy gold-glow hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="size-5 rounded-full border-2 border-t-fortune-navy border-fortune-navy/20 animate-spin" />
                ) : (
                  'Login'
                )}
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
