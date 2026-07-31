import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, AlertCircle, Loader2, ShieldCheck, HelpCircle, CheckCircle, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { fetchTermsConditions, type TermsContent } from '@/lib/fortuneApi'

const ICONS = [ShieldCheck, HelpCircle, FileText, AlertCircle, CheckCircle, Info]

function parseHtmlSections(html: string) {
  const sections: { title: string; content: string }[] = [];
  
  const firstH3Index = html.toLowerCase().indexOf('<h3>');
  if (firstH3Index > 0) {
     const preamble = html.substring(0, firstH3Index).trim();
     if (preamble) {
        sections.push({ title: 'Overview', content: preamble });
     }
  }

  const regex = /<h3>(.*?)<\/h3>([\s\S]*?)(?=<h3|$)/gi;
  let match;
  let hasMatches = false;
  while ((match = regex.exec(html)) !== null) {
    hasMatches = true;
    sections.push({
      title: match[1],
      content: match[2].trim(),
    });
  }

  if (!hasMatches) {
    sections.push({ title: 'Terms & Conditions', content: html });
  }
  return sections;
}

export function TermsPage() {
  const routerNavigate = useNavigate()
  const navigate = (path: string) => routerNavigate(path === 'home' ? '/' : `/${path}`)
  
  const [data, setData] = useState<TermsContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTerms() {
      try {
        const result = await fetchTermsConditions()
        setData(result)
      } catch (err: any) {
        setError(err.message || 'Failed to load Terms and Conditions')
      } finally {
        setLoading(false)
      }
    }
    loadTerms()
  }, [])

  const sections = useMemo(() => {
    if (!data?.content) return [];
    return parseHtmlSections(data.content);
  }, [data?.content]);

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge className="bg-primary/15 text-primary border-primary/25 mb-4">
            <FileText className="size-3 mr-1" /> Legal Agreement
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            {loading ? 'Terms & Conditions' : (data?.title ? data.title.split(' ')[0] + ' ' : 'Terms & ')}
            {!loading && data?.title && data.title.split(' ').length > 1 && (
              <span className="gold-text">{data.title.substring(data.title.indexOf(' ') + 1)}</span>
            )}
            {!loading && !data?.title && <span className="gold-text">Conditions</span>}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Please read these Terms and Conditions carefully before using the Fortune Lottery platform.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-8">
            {Array(3).fill(0).map((_, idx) => (
              <Card key={idx} className="bg-[#0c0c0c] border-white/5 animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="size-6 bg-white/5 rounded-full" />
                     <div className="h-6 w-48 bg-white/5 rounded" />
                  </div>
                  <div className="space-y-4 mt-2">
                      <div className="h-4 w-full bg-white/5 rounded" />
                      <div className="h-4 w-11/12 bg-white/5 rounded" />
                      <div className="h-4 w-4/5 bg-white/5 rounded" />
                      <div className="h-4 w-full bg-white/5 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">
            <AlertCircle className="size-8 mx-auto mb-4" />
            <p>{error}</p>
          </div>
        ) : sections.length > 0 ? (
          <div className="space-y-8">
            {sections.map((section, idx) => {
              const Icon = ICONS[idx % ICONS.length];
              return (
                <Card key={idx} className="bg-fortune-card border-border">
                  <CardContent className="p-6">
                    {section.title && section.title.toLowerCase() !== 'terms & conditions' && (
                      <div className="flex items-center gap-3 mb-4">
                        <Icon className={`size-6 ${idx % 4 === 3 ? 'text-destructive' : 'text-primary'}`} />
                        <h2 className="text-xl font-bold">{section.title.replace(/<\/?[^>]+(>|$)/g, "")}</h2>
                      </div>
                    )}
                    <div 
                      className="terms-content text-sm text-muted-foreground leading-relaxed prose prose-sm prose-invert max-w-none" 
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
           <div className="text-center text-muted-foreground py-12">
             <p>No terms and conditions found.</p>
           </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate('home')}
            className="text-sm font-bold text-primary hover:underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
