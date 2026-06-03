import { HelpCircle, Mail, Phone, MessageSquare, Clock, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export default function SupportPage() {
  const faqs = [
    {
      question: 'How do I purchase lottery tickets?',
      answer: 'You can purchase lottery tickets through our website or mobile app. Simply select your game, choose your numbers, and complete the payment. Your tickets will be instantly added to your account.',
    },
    {
      question: 'When are the drawing results announced?',
      answer: 'Drawing results are typically announced daily. For specific times, please check the game details page. You will also receive notifications when results are available.',
    },
    {
      question: 'How do I claim my winnings?',
      answer: 'Winnings are automatically credited to your account. For prizes above a certain amount, you may need to verify your identity. Contact our support team for assistance with large claims.',
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Yes, we use industry-standard encryption and security protocols to protect your payment information. All transactions are processed through secure payment gateways.',
    },
    {
      question: 'Can I get a refund on my ticket purchase?',
      answer: 'Lottery tickets are generally non-refundable once purchased. However, if there are exceptional circumstances, please contact our support team for review.',
    },
    {
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your email, and follow the instructions sent to your email. You will be able to set a new password.',
    },
  ]

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@fortunelottery.com',
      detail: 'Response within 24 hours',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: '+1 (800) LOTTERY-1',
      detail: 'Available 9 AM - 11 PM EST',
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Available on website',
      detail: 'Real-time assistance',
    },
  ]

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3 mb-2">
            <HelpCircle className="w-10 h-10 text-primary" />
            Support & Help
          </h1>
          <p className="text-muted-foreground">Get answers to your questions and reach our support team</p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {contactMethods.map((method, i) => {
            const Icon = method.icon
            return (
              <Card key={i} className="bg-card border-border hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{method.title}</h3>
                  <p className="text-sm text-foreground mb-1">{method.description}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {method.detail}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Contact Form */}
        <Card className="bg-card border-border shadow-lg mb-12">
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
            <CardDescription>Fill out the form below and we'll get back to you as soon as possible</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <Input
                    placeholder="Your name"
                    className="bg-muted border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    className="bg-muted border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Subject</label>
                <Input
                  placeholder="How can we help?"
                  className="bg-muted border-border"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Message</label>
                <Textarea
                  placeholder="Describe your issue or question..."
                  className="bg-muted border-border min-h-32"
                />
              </div>

              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>Find answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <Collapsible key={i}>
                  <CollapsibleTrigger className="w-full p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-left">{faq.question}</h3>
                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 bg-muted/30 border border-border border-t-0 rounded-b-lg">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
