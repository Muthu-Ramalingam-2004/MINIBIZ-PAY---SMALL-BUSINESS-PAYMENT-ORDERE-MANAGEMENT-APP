'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg">
            M
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Reset Password</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Enter your registered email to receive password reset link</p>
        </div>

        <Card className="shadow-xl border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 space-y-4">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Registered Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@sweettreats.com"
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                />

                <Button variant="primary" type="submit" className="w-full">
                  Send Password Reset Instructions
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-3 py-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Reset Email Sent!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We've sent reset instructions to <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>. Please check your inbox.
                </p>
              </div>
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
