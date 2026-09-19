'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/app-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, ArrowLeft, Lock, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { requestPasswordReset, resetPassword } = useApp()

  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [recoveryToken, setRecoveryToken] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!email) {
      setErrorMessage('Please enter your registered email address.')
      return
    }

    setIsLoading(true)
    const res = await requestPasswordReset(email)
    setIsLoading(false)

    if (res.success) {
      if (res.recoveryToken) {
        setRecoveryToken(res.recoveryToken)
      }
      setSuccessMessage('Account verified. Please enter your new password below.')
      setStep(2)
    } else {
      setErrorMessage(res.error || 'No account found with this email address.')
    }
  }

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!email || !newPassword || !confirmNewPassword) {
      setErrorMessage('Please fill in all fields.')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New password and confirm password do not match.')
      return
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    setIsLoading(true)
    const res = await resetPassword({
      email,
      newPassword,
      recoveryToken,
    })
    setIsLoading(false)

    if (res.success) {
      alert('Password changed successfully. Please login with your new password.')
      router.push('/login')
    } else {
      setErrorMessage(res.error || 'Failed to reset password. Please check your credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg">
            M
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Reset Password</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {step === 1 ? 'Step 1: Enter your registered account email' : 'Step 2: Enter your new password'}
          </p>
        </div>

        <Card className="shadow-xl border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <Input
                  label="Registered Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                />

                <Button variant="primary" type="submit" className="w-full py-2.5" isLoading={isLoading} leftIcon={<ShieldCheck className="w-4 h-4" />}>
                  Verify Account & Continue
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <Input
                  label="Account Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  placeholder="you@example.com"
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 chars)"
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                />

                <Button variant="primary" type="submit" className="w-full py-2.5" isLoading={isLoading}>
                  Change Password
                </Button>
              </form>
            )}

            <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link href="/login">
                <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
