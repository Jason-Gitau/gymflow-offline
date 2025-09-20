import { Badge } from '@/components/ui/badge';
import { MemberStatus, PaymentStatus } from '@/types';
import { CheckCircle, AlertCircle, XCircle, DollarSign } from 'lucide-react';

interface StatusBadgeProps {
  status: MemberStatus;
  className?: string;
}

interface PaymentBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    active: {
      icon: CheckCircle,
      label: 'Active',
      className: 'status-active'
    },
    due: {
      icon: AlertCircle,
      label: 'Due Today',
      className: 'status-due'
    },
    overdue: {
      icon: XCircle,
      label: 'Overdue',
      className: 'status-overdue'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} ${className} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

export function PaymentBadge({ status, className }: PaymentBadgeProps) {
  const statusConfig = {
    paid: {
      icon: CheckCircle,
      label: 'Paid',
      className: 'status-paid'
    },
    incomplete: {
      icon: DollarSign,
      label: 'Incomplete',
      className: 'status-incomplete'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} ${className} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}