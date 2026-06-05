import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'

export function ProfilePage() {
  const profile = {
    firstName: 'Sachin',
    lastName: 'Kumar',
    email: 'sachin@example.com',
    mobile: '+1 (876) 555-0199',
    address: '10 Main Street',
    city: 'Kingston',
  }

  return (
    <Card className="bg-fortune-card border border-border/60 animate-in fade-in slide-in-from-bottom-2">
      <CardContent className="p-6 sm:p-8">
        <h3 className="font-bold text-xl text-foreground border-b border-border pb-4 mb-6 flex items-center gap-2">
          <User className="size-5 text-primary" />
          Personal & Address Details
        </h3>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">First Name</label>
              <input type="text" defaultValue={profile.firstName} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">Last Name</label>
              <input type="text" defaultValue={profile.lastName} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">Email Address</label>
              <input type="email" defaultValue={profile.email} disabled className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed opacity-50" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">Phone Number</label>
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    className="bg-background border border-border rounded-xl px-3 py-3 text-sm text-foreground font-semibold focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none pr-8 min-w-[90px] h-full"
                    defaultValue="+1"
                  >
                    <option value="+1">+1 (US/JA)</option>
                    <option value="+91">+91 (IN)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+55">+55 (BR)</option>
                    <option value="+234">+234 (NG)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground text-[10px]">▼</div>
                </div>
                <input
                  type="text"
                  defaultValue="(876) 555-0199"
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-2">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">Street Address</label>
              <input type="text" defaultValue={profile.address} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-2">City</label>
              <input type="text" defaultValue={profile.city} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div className="pt-6 text-right">
            <Button className="gold-gradient font-bold px-8 py-6 rounded-xl text-sm hover:opacity-90 transition-opacity">
              Save Profile Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
