import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Info, ShieldCheck } from 'lucide-react'
import { fetchAboutUs, type AboutContent } from '@/lib/fortuneApi'

export function AboutPage() {
  const [about, setAbout] = useState<AboutContent>({
    title: 'About Us',
    content: 'Fortune Lottery is committed to delivering a secure, simple, and responsible online lottery experience.',
  })

  useEffect(() => {
    let cancelled = false

    fetchAboutUs()
      .then((data) => {
        if (!cancelled) setAbout(data)
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Badge className="bg-primary/15 text-primary border-primary/25 mb-4">
            <Info className="size-3 mr-1" /> Fortune Cash
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            {about.title || 'About Us'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Learn more about the team and platform behind Fortune Lottery.
          </p>
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
          {about.image && (
            <div className="overflow-hidden rounded-lg border border-border/60 bg-fortune-card">
              <img src={about.image} alt={about.title || 'About Fortune'} className="w-full aspect-[4/3] object-cover" />
            </div>
          )}

          <Card className="bg-fortune-card border-border">
            <CardContent className="p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <ShieldCheck className="size-6 text-primary" />
                <h2 className="text-xl font-bold">Our Story</h2>
              </div>
              <div
                className="prose prose-invert max-w-none text-sm text-muted-foreground leading-relaxed [&_div]:mb-4 [&_p]:mb-4"
                dangerouslySetInnerHTML={{ __html: about.content }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
