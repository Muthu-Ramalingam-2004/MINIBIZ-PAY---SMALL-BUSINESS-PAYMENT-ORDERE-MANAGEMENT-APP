'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useApp } from '@/context/app-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Lock, Mail, ArrowRight, AlertCircle, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react'

type ViewMode = 'login' | 'forgot_email' | 'forgot_reset'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, requestPasswordReset, resetPassword } = useApp()

  const [mode, setMode] = useState<ViewMode>('login')

  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  // Forgot password flow state
  const [resetEmail, setResetEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [recoveryToken, setRecoveryToken] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const urlMode = searchParams.get('mode')
    const urlEmail = searchParams.get('email')
    if (urlMode === 'reset_password' || searchParams.get('type') === 'recovery') {
      setMode('forgot_reset')
      if (urlEmail) setResetEmail(urlEmail)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.')
      return
    }

    setIsLoading(true)
    const result = await login(email, password)
    setIsLoading(false)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setErrorMessage(result.error || 'Invalid email or password.')
    }
  }

  // Forgot Password Step 1: Verify Email
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!resetEmail) {
      setErrorMessage('Please enter your registered email address.')
      return
    }

    setIsLoading(true)
    const res = await requestPasswordReset(resetEmail)
    setIsLoading(false)

    if (res.success) {
      if (res.recoveryToken) {
        setRecoveryToken(res.recoveryToken)
      }
      setSuccessMessage('Account verified successfully. Please enter your new password below.')
      setMode('forgot_reset')
    } else {
      setErrorMessage(res.error || 'No account found with this email address.')
    }
  }

  // Forgot Password Step 2: Set New Password
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!resetEmail || !newPassword || !confirmNewPassword) {
      setErrorMessage('Please fill in all required fields.')
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
      email: resetEmail,
      newPassword,
      recoveryToken,
    })
    setIsLoading(false)

    if (res.success) {
      setEmail(resetEmail)
      setPassword('')
      setSuccessMessage('Password changed successfully. Please login with your new password.')
      setMode('login')
      setResetEmail('')
      setNewPassword('')
      setConfirmNewPassword('')
      setRecoveryToken('')
    } else {
      setErrorMessage(res.error || 'Failed to update password. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="max-w-md w-full space-y-6">
        {/* Logo Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg">
            M
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            MiniBiz<span className="text-brand-600 dark:text-brand-400">Pay</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {mode === 'login'
              ? 'Log in to your business payment dashboard'
              : mode === 'forgot_email'
              ? 'Step 1: Enter your registered account email'
              : 'Step 2: Enter your new password'}
          </p>
        </div>

        <Card className="shadow-xl border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 space-y-5">
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

            {/* 1. LOGIN MODE */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                />

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded dark:bg-slate-800 dark:border-slate-700"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_email')
                      setResetEmail(email)
                      setErrorMessage('')
                      setSuccessMessage('')
                    }}
                    className="text-brand-600 dark:text-brand-400 hover:underline font-semibold text-xs cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-full py-2.5"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Log In to Dashboard
                </Button>
              </form>
            )}

            {/* 2. FORGOT PASSWORD STEP 1: EMAIL VERIFICATION */}
            {mode === 'forgot_email' && (
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <Input
                  label="Registered Email Address"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                />

                <Button
                  variant="primary"
                  type="submit"
                  className="w-full py-2.5"
                  isLoading={isLoading}
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                >
                  Verify Account & Continue
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login')
                      setErrorMessage('')
                      setSuccessMessage('')
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-brand-600 font-semibold cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                  </button>
                </div>
              </form>
            )}

            {/* 3. FORGOT PASSWORD STEP 2: NEW PASSWORD */}
            {mode === 'forgot_reset' && (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <Input
                  label="Account Email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
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

                <Button
                  variant="primary"
                  type="submit"
                  className="w-full py-2.5"
                  isLoading={isLoading}
                >
                  Change Password
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login')
                      setErrorMessage('')
                      setSuccessMessage('')
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-brand-600 font-semibold cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Cancel & Back to Login
                  </button>
                </div>
              </form>
            )}

            {mode === 'login' && (
              <div className="text-center text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                Don't have a MiniBiz Pay account?{' '}
                <Link href="/signup" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
                  Create Account
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
