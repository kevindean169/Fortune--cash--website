import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'https://node.rglabs.net/api/v1'
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://fortunescash.com').replace(/\/$/, '')
const APP_KEY = import.meta.env.VITE_AUTH_API_KEY || 'c326d53a97bc32972cc7de9d4f03d27845efc9a81d8f1e7af347f3da42cbd52e'

type Step = 'AMOUNT' | 'SET_PIN' | 'ENTER_PIN' | 'CHANGE_PIN' | 'SUCCESS'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function WithdrawalDialog({ open, onOpenChange, onSuccess }: Props) {
  const { user, accessToken } = useAuth()
  
  const [step, setStep] = useState<Step>('AMOUNT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [amount, setAmount] = useState('')
  const [pin, setPin] = useState('')
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  
  const resetState = () => {
    setStep('AMOUNT')
    setAmount('')
    setPin('')
    setOldPin('')
    setNewPin('')
    setError(null)
    setLoading(false)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) resetState()
    onOpenChange(isOpen)
  }

  const getHeaders = () => ({
    'Authorization': `Bearer ${accessToken}`,
    'X-App-Key': APP_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  })

  const checkAmount = async () => {
    setError(null)
    if (!amount || isNaN(Number(amount)) || Number(amount) < 10) {
      setError('Amount must be a valid number')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/wallet/withdraw/check?amount=${amount}`, {
        headers: getHeaders()
      })
      const data = await res.json()
      
      if (!res.ok || !data.success) {
        setError(data.message || 'Error checking withdrawal amount')
        return
      }
      
      if (!data.data.valid) {
        setError(data.data.message || 'Amount is not valid for withdrawal')
        return
      }
      
      if (!data.data.pinSet) {
        setStep('SET_PIN')
      } else {
        setStep('ENTER_PIN')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitSetPin = async () => {
    setError(null)
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/wallet/pin/set`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ pin })
      })
      const data = await res.json()
      
      if (!res.ok || !data.success) {
        setError(data.message || 'Error setting PIN')
        return
      }
      
      setStep('ENTER_PIN')
      setPin('') // clear PIN for the enter step
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitWithdraw = async () => {
    setError(null)
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits')
      return
    }
    
    setLoading(true)
    try {
      const idempotencyKey = crypto.randomUUID()
      const res = await fetch(`${BASE_URL}/wallet/withdraw/submit`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({ 
          amount: Number(amount), 
          pin, 
          idempotencyKey 
        })
      })
      const data = await res.json()
      
      if (!res.ok || !data.success) {
        if (data.errors) {
            setError(data.errors.map((e: any) => e.message).join(', '))
        } else {
            setError(data.message || 'Error submitting withdrawal')
        }
        return
      }

      if (user?.id && data?.data?.transactionId) {
        try {
          await fetch(`${API_BASE_URL}/api/customer/sent-withdraw-request/${user.id}?amount=${data.data.amount || amount}&trx=${data.data.transactionId}`, {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          });
        } catch (e) {
          console.error('Error notifying admin of withdrawal:', e);
        }
      }
      
      setStep('SUCCESS')
      onSuccess()
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitChangePin = async () => {
    setError(null)
    if (!/^\d{4}$/.test(oldPin) || !/^\d{4}$/.test(newPin)) {
      setError('PINs must be exactly 4 digits')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/wallet/pin/reset`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ oldPin, newPin })
      })
      const data = await res.json()
      
      if (!res.ok || !data.success) {
        setError(data.message || 'Error changing PIN')
        return
      }
      
      setStep('ENTER_PIN')
      setOldPin('')
      setNewPin('')
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-fortune-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {step !== 'AMOUNT' && step !== 'SUCCESS' && (
              <button 
                onClick={() => setStep(step === 'CHANGE_PIN' ? 'ENTER_PIN' : 'AMOUNT')}
                className="hover:bg-muted/50 p-1 rounded-md transition-colors"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
            {step === 'AMOUNT' && 'Withdraw Funds'}
            {step === 'SET_PIN' && 'Set Your PIN'}
            {step === 'ENTER_PIN' && 'Enter PIN'}
            {step === 'CHANGE_PIN' && 'Change PIN'}
            {step === 'SUCCESS' && 'Success!'}
          </DialogTitle>
          <DialogDescription>
            {step === 'AMOUNT' && 'Enter the amount you wish to withdraw.'}
            {step === 'SET_PIN' && 'You need to set a 4-digit PIN for withdrawals.'}
            {step === 'ENTER_PIN' && 'Please enter your 4-digit PIN to confirm the withdrawal.'}
            {step === 'CHANGE_PIN' && 'Enter your current PIN and a new PIN.'}
            {step === 'SUCCESS' && 'Your withdrawal request has been submitted.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {step === 'AMOUNT' && (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (Min. $100)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkAmount()}
                disabled={loading}
              />
              <Button className="w-full mt-4" onClick={checkAmount} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
            </div>
          )}

          {step === 'SET_PIN' && (
            <div className="space-y-2">
              <Label htmlFor="pin">New 4-Digit PIN</Label>
              <Input
                id="pin"
                type="password"
                maxLength={4}
                placeholder="****"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && submitSetPin()}
                disabled={loading}
              />
              <Button className="w-full mt-4" onClick={submitSetPin} disabled={loading || pin.length !== 4}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Set PIN
              </Button>
            </div>
          )}

          {step === 'ENTER_PIN' && (
            <div className="space-y-2">
              <Label htmlFor="enter-pin">4-Digit PIN</Label>
              <Input
                id="enter-pin"
                type="password"
                maxLength={4}
                placeholder="****"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && submitWithdraw()}
                disabled={loading}
              />
              <div className="flex justify-between items-center mt-4 gap-2">
                <button 
                  onClick={() => setStep('CHANGE_PIN')} 
                  className="text-xs text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                >
                  Change PIN?
                </button>
                <Button onClick={submitWithdraw} disabled={loading || pin.length !== 4} className="flex-1 max-w-[200px]">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm
                </Button>
              </div>
            </div>
          )}

          {step === 'CHANGE_PIN' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="old-pin">Current PIN</Label>
                <Input
                  id="old-pin"
                  type="password"
                  maxLength={4}
                  placeholder="****"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-pin">New PIN</Label>
                <Input
                  id="new-pin"
                  type="password"
                  maxLength={4}
                  placeholder="****"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && submitChangePin()}
                  disabled={loading}
                />
              </div>
              <Button className="w-full mt-4" onClick={submitChangePin} disabled={loading || oldPin.length !== 4 || newPin.length !== 4}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change PIN
              </Button>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center py-6">
              <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Request Submitted</h3>
              <p className="text-muted-foreground mb-6">
                Your withdrawal request for ${Number(amount).toFixed(2)} has been submitted and is pending admin approval.
              </p>
              <Button className="w-full" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
