import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'

export function SecurityPage() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleUpdatePassword = () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match')
      return
    }
    alert('Password updated successfully')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <Card className="bg-fortune-card border border-border/60 animate-in fade-in slide-in-from-bottom-2">
      <CardContent className="p-6 sm:p-8">
        <h3 className="font-bold text-xl text-foreground border-b border-border pb-4 mb-6 flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          Change Password
        </h3>
        <div className="space-y-5 max-w-md">
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">Current Password</label>
            <div className="relative">
              <input 
                type={showCurrent ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-4 pr-10 py-3 text-sm text-foreground focus:outline-none focus:border-primary" 
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">New Password</label>
              <div className="relative">
                <input 
                  type={showNew ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-4 pr-10 py-3 text-sm text-foreground focus:outline-none focus:border-primary" 
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirm ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-4 pr-10 py-3 text-sm text-foreground focus:outline-none focus:border-primary" 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <Button 
              onClick={handleUpdatePassword}
              className="w-full gold-gradient font-bold py-6 rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              Update Password
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
