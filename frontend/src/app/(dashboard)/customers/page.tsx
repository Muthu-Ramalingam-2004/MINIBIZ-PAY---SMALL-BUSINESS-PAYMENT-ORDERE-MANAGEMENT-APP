'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/app-context'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { SearchBar } from '@/components/ui/search-bar'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Eye, Edit2, Trash2, Users, Phone, Mail, MapPin } from 'lucide-react'

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, addToast } = useApp()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null)
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setName('')
    setMobile('')
    setEmail('')
    setAddress('')
    setNotes('')
    setErrors({})
    setEditingCustomer(null)
  }

  const handleOpenAdd = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleOpenEdit = (customer: (typeof customers)[0]) => {
    setEditingCustomer(customer.id)
    setName(customer.name)
    setMobile(customer.mobile)
    setEmail(customer.email)
    setAddress(customer.address)
    setNotes(customer.notes || '')
    setErrors({})
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Customer name is required'
    if (!mobile.trim()) newErrors.mobile = 'Mobile number is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer, { name, mobile, email, address, notes })
    } else {
      await addCustomer({ name, mobile, email, address, notes })
    }

    setIsModalOpen(false)
    resetForm()
  }

  const filteredCustomers = customers.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.mobile || '').includes(search) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Manage client contact directory and order history"
        action={
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
            Add Customer
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search customers by name, phone, email..." />
        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total: {filteredCustomers.length} Customers</span>
      </div>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No customers found"
          description="Add your first customer to start tracking orders and advance payments."
          actionLabel="Add Customer"
          onAction={handleOpenAdd}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((cust) => (
                  <TableRow key={cust.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {cust.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{cust.name}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{cust.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-700 dark:text-slate-300">{cust.mobile}</TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">{cust.email || '—'}</TableCell>
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-200 text-center">{cust.totalOrders}</TableCell>
                    <TableCell className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(cust.totalSpent)}</TableCell>
                    <TableCell>
                      {cust.pendingAmount > 0 ? (
                        <span className="font-bold text-rose-600 dark:text-rose-400 text-xs">{formatCurrency(cust.pendingAmount)}</span>
                      ) : (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Cleared</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">{formatDate(cust.lastOrderDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/customers/${cust.id}`}>
                          <Button variant="ghost" size="sm" className="p-1.5 h-8">
                            <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="p-1.5 h-8" onClick={() => handleOpenEdit(cust)}>
                          <Edit2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1.5 h-8 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          onClick={() => setDeletingCustomerId(cust.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        subtitle="Fill in client details to store in directory"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Customer Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Kumar"
            error={errors.name}
            required
          />

          <Input
            label="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="e.g. +91 98765 43210"
            leftIcon={<Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
            error={errors.mobile}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. rahul@example.com"
            leftIcon={<Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
          />

          <Input
            label="Delivery / Billing Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Full street address, area, city"
            leftIcon={<MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Customer Notes & Preferences
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 focus:outline-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Preferred delivery time, eggless preference, allergy notes..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingCustomer ? 'Update Customer' : 'Save Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingCustomerId}
        onClose={() => setDeletingCustomerId(null)}
        onConfirm={() => {
          if (deletingCustomerId) deleteCustomer(deletingCustomerId)
        }}
        title="Delete Customer"
        description="Are you sure you want to delete this customer? Their order records will be preserved."
        confirmLabel="Delete"
        isDanger
      />
    </div>
  )
}
