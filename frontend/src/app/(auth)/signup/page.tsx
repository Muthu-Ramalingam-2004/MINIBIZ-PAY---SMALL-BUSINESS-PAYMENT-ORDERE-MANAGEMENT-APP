'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/app-context'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Store, User, Phone, Mail, Lock, AlertCircle } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useApp()

  const [businessName, setBusinessName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('Home Baker & Confectionery')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!businessName || !ownerName || !email || !password) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please check again.')
      return
    }

    setIsLoading(true)
    const result = await signup({
      businessName,
      ownerName,
      mobile,
      email,
      category,
      password,
    })

    setIsLoading(false)
    if (result.success) {
      router.push('/dashboard')
    } else {
      setErrorMessage(result.error || 'Failed to create merchant account.')
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
            Get Started with MiniBiz<span className="text-brand-600 dark:text-brand-400">Pay</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Create your small business merchant account</p>
        </div>

        <Card className="shadow-xl border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <Input
                label="Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Sweet Treats Bakery"
                leftIcon={<Store className="w-4 h-4 text-slate-400" />}
                required
              />

              <Input
                label="Owner Name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@example.com"
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                />
              </div>

              <Select
                label="Business Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { label: 'Home Baker & Confectionery', value: 'Home Baker & Confectionery' },
                  { label: 'Instagram / WhatsApp Seller', value: 'Instagram / WhatsApp Seller' },
                  { label: 'Freelancer / Designer / Tutor', value: 'Freelancer / Designer / Tutor' },
                  { label: 'Boutique & Fashion Store', value: 'Boutique & Fashion Store' },
                  { label: 'Service Provider / Catering', value: 'Service Provider / Catering' },
                ]}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                />
              </div>

              <Button
                variant="primary"
                type="submit"
                className="w-full py-2.5"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account & Access Dashboard
              </Button>
            </form>

            <div className="text-center text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
                Log In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
