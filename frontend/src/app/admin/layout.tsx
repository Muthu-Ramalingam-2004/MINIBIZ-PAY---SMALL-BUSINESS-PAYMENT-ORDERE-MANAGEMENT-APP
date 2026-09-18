import React from 'react'
import Link from 'next/link'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Admin Top Bar */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center">
            A
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              MiniBiz Pay <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">PLATFORM ADMIN</span>
            </h1>
            <p className="text-[11px] text-slate-400">Superadmin Control & Revenue Analytics</p>
          </div>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Merchant App
          </Button>
        </Link>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {children}
      </main>
    </div>
  )
}
