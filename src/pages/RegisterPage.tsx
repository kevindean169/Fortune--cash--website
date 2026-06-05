import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'

import { useNavigate } from 'react-router-dom'

export function RegisterPage() {
  const routerNavigate = useNavigate()
  const navigate = (path: string) => routerNavigate(path === 'home' ? '/' : `/${path}`)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    if (!ageConfirmed || !termsAccepted) {
      alert('Please confirm your age and accept the Terms & Conditions')
      return
    }
    navigate('login')
  }

  const inputClass = "w-full bg-background border border-primary/30 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_10px_oklch(0.83_0.17_84/0.2)] transition-all placeholder:text-muted-foreground/50"

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-16 px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-emerald-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-2">
          <button onClick={() => navigate('home')} className="inline-flex items-center justify-center mb-1">
            <img src="/favicon.png" alt="Fortune Logo" className="w-16 h-16 object-contain rounded-xl shadow-[0_0_15px_rgba(224,172,44,0.25)]" />
          </button>
        </div>

        <Card className="bg-fortune-card border-2 border-primary/40 border-b-[8px] border-b-primary/90 border-r-[4px] border-r-primary/70 rounded-3xl shadow-[inset_2px_2px_5px_rgba(255,255,255,0.05),0_10px_25px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold mb-1">
                Create <span className="gold-text"> Account</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Join Fortune Lottery and start placing your bets
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Sachin"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Kumar"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sachin@example.com"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Phone Number</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      className="bg-background border border-primary/30 rounded-xl px-3 py-3 text-sm text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_10px_oklch(0.83_0.17_84/0.2)] transition-all cursor-pointer appearance-none pr-8 min-w-[90px] h-full"
                      defaultValue="+1"
                    >
                      <option value="+1">+1 (US/JA)</option>
                      <option value="+91">+91 (IN)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+55">+55 (BR)</option>
                      <option value="+234">+234 (NG)</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px]">▼</div>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(876) 555-0199"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className={`${inputClass} pl-10 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className={`${inputClass} pl-10 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 mt-4 text-left">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    id="register-age"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-primary/30 accent-primary text-primary bg-background size-4 cursor-pointer focus:ring-0 focus:outline-none"
                  />
                  <label htmlFor="register-age" className="text-sm text-muted-foreground cursor-pointer select-none leading-normal">
                    I confirm that I am 18 years of age or older.
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    id="register-terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-primary/30 accent-primary text-primary bg-background size-4 cursor-pointer focus:ring-0 focus:outline-none"
                  />
                  <label htmlFor="register-terms" className="text-sm text-muted-foreground cursor-pointer select-none leading-normal">
                    I have read and agree to the <span className="text-primary hover:underline cursor-pointer" onClick={() => navigate('terms')}>Terms & Conditions</span> and <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-6 mt-2 text-sm font-bold uppercase tracking-widest gold-gradient text-fortune-navy gold-glow hover:opacity-90"
              >
                Register Account
              </Button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-border/50 text-xs">
              <span className="text-muted-foreground">Already have an account? </span>
              <button
                onClick={() => navigate('login')}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
