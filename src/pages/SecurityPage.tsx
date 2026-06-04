import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldCheck } from 'lucide-react'

export function SecurityPage() {
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
            <input type="password" placeholder="••••••••" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">Confirm Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="pt-4">
            <Button className="w-full gold-gradient font-bold py-6 rounded-xl text-sm hover:opacity-90 transition-opacity">
              Update Password
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
