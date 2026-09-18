import React from 'react'
import { Badge } from '@/components/ui/badge'
import { OrderStatus, PaymentStatus } from '@/types'
import { Clock, CheckCircle2, Package, Truck, CheckCheck, XCircle, AlertCircle } from 'lucide-react'

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus
  type?: 'order' | 'payment'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    // Payment Statuses
    case 'Fully Paid':
      return (
        <Badge variant="success">
          <CheckCheck className="w-3 h-3" />
          <span>Fully Paid</span>
        </Badge>
      )
    case 'Advance Paid':
      return (
        <Badge variant="warning">
          <Clock className="w-3 h-3" />
          <span>Advance Paid</span>
        </Badge>
      )
    case 'Unpaid':
      return (
        <Badge variant="danger">
          <AlertCircle className="w-3 h-3" />
          <span>Unpaid</span>
        </Badge>
      )

    // Order Statuses
    case 'Pending':
      return (
        <Badge variant="warning">
          <Clock className="w-3 h-3" />
          <span>Pending</span>
        </Badge>
      )
    case 'Confirmed':
      return (
        <Badge variant="brand">
          <CheckCircle2 className="w-3 h-3" />
          <span>Confirmed</span>
        </Badge>
      )
    case 'Preparing':
      return (
        <Badge variant="info">
          <Package className="w-3 h-3 animate-pulse" />
          <span>Preparing</span>
        </Badge>
      )
    case 'Ready':
      return (
        <Badge variant="brand">
          <Package className="w-3 h-3" />
          <span>Ready</span>
        </Badge>
      )
    case 'Delivered':
      return (
        <Badge variant="success">
          <Truck className="w-3 h-3" />
          <span>Delivered</span>
        </Badge>
      )
    case 'Completed':
      return (
        <Badge variant="success">
          <CheckCheck className="w-3 h-3" />
          <span>Completed</span>
        </Badge>
      )
    case 'Cancelled':
      return (
        <Badge variant="danger">
          <XCircle className="w-3 h-3" />
          <span>Cancelled</span>
        </Badge>
      )
    default:
      return <Badge variant="neutral">{status}</Badge>
  }
}
