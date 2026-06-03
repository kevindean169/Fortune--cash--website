import { Smartphone, Download, Star, Users, Zap, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function MobileAppPage() {
  const features = [
    {
      icon: Zap,
      title: 'Instant Tickets',
      description: 'Buy lottery tickets instantly from your phone',
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Bank-level security for all transactions',
    },
    {
      icon: Users,
      title: 'Social Features',
      description: 'Share results and celebrate wins with friends',
    },
    {
      icon: Star,
      title: 'Notifications',
      description: 'Real-time alerts for drawing results',
    },
  ]

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3 mb-2">
            <Smartphone className="w-10 h-10 text-primary" />
            Mobile App
          </h1>
          <p className="text-muted-foreground">Download Fortune Lottery on iOS and Android</p>
        </div>

        {/* Download Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-500/10 to-primary/10 border-blue-500/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <Smartphone className="w-16 h-16 text-blue-500" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">iOS App</h2>
                  <p className="text-muted-foreground mb-4">Available on iPhone and iPad</p>
                  <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 border mb-4">
                    iOS 14+
                  </Badge>
                </div>
                <Button className="bg-blue-500 text-white hover:bg-blue-600 w-full flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download on App Store
                </Button>
                <div className="pt-4 border-t border-border w-full">
                  <p className="text-xs text-muted-foreground mb-2">Rating</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < 4 ? 'fill-yellow-500 text-yellow-500' : 'text-muted'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold">4.8</span>
                    <span className="text-xs text-muted-foreground">(2,543 reviews)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-primary/10 border-green-500/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <Smartphone className="w-16 h-16 text-green-500" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Android App</h2>
                  <p className="text-muted-foreground mb-4">Available on Google Play Store</p>
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30 border mb-4">
                    Android 8+
                  </Badge>
                </div>
                <Button className="bg-green-500 text-white hover:bg-green-600 w-full flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download on Play Store
                </Button>
                <div className="pt-4 border-t border-border w-full">
                  <p className="text-xs text-muted-foreground mb-2">Rating</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < 4 ? 'fill-yellow-500 text-yellow-500' : 'text-muted'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold">4.7</span>
                    <span className="text-xs text-muted-foreground">(3,891 reviews)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8">Why Download Our App?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <Card key={i} className="bg-card border-border hover:border-primary transition-colors">
                  <CardContent className="pt-6">
                    <Icon className="w-8 h-8 text-primary mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* System Requirements */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              System Requirements
            </CardTitle>
            <CardDescription>Minimum requirements to run Fortune Lottery app</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-foreground mb-4">iOS Requirements</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>iOS 14.0 or later</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>iPhone 6s or later</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>50 MB free storage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Wi-Fi or mobile connection</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-4">Android Requirements</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Android 8.0 or later</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>512 MB RAM minimum</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>60 MB free storage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Internet connectivity required</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
