interface BadgeProps {
  variant?: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'indigo' | 'gray' | 'orange';
  children: React.ReactNode;
  dot?: boolean;
}

const variants = {
  green:  'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red:    'bg-red-100 text-red-700',
  blue:   'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  gray:   'bg-gray-100 text-gray-600',
  orange: 'bg-orange-100 text-orange-700'
};

const dots = {
  green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500',
  blue: 'bg-blue-500', purple: 'bg-purple-500', indigo: 'bg-indigo-500',
  gray: 'bg-gray-400', orange: 'bg-orange-500'
};

export default function Badge({ variant = 'gray', children, dot = false }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dots[variant]}`} />}
      {children}
    </span>
  );
}

// Pre-built status badges
export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { v: BadgeProps['variant']; label: string }> = {
    pending:    { v: 'yellow', label: 'Pending' },
    confirmed:  { v: 'blue',   label: 'Confirmed' },
    processing: { v: 'indigo', label: 'Processing' },
    shipped:    { v: 'purple', label: 'Shipped' },
    delivered:  { v: 'green',  label: 'Delivered' },
    cancelled:  { v: 'red',    label: 'Cancelled' }
  };
  const cfg = map[status] || { v: 'gray', label: status };
  return <Badge variant={cfg.v} dot>{cfg.label}</Badge>;
}

export function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, { v: BadgeProps['variant']; label: string }> = {
    paid:    { v: 'green',  label: 'Paid' },
    partial: { v: 'yellow', label: 'Partial' },
    unpaid:  { v: 'red',    label: 'Unpaid' }
  };
  const cfg = map[status] || { v: 'gray', label: status };
  return <Badge variant={cfg.v}>{cfg.label}</Badge>;
}

export function GradeBadge({ grade }: { grade: string }) {
  const map: Record<string, BadgeProps['variant']> = { A: 'green', B: 'yellow', C: 'red' };
  return <Badge variant={map[grade] || 'gray'}>Grade {grade}</Badge>;
}

export function MillStatusBadge({ status }: { status: string }) {
  const map: Record<string, { v: BadgeProps['variant']; label: string }> = {
    pending:     { v: 'yellow', label: 'Pending' },
    in_progress: { v: 'blue',   label: 'In Progress' },
    completed:   { v: 'green',  label: 'Completed' }
  };
  const cfg = map[status] || { v: 'gray', label: status };
  return <Badge variant={cfg.v} dot>{cfg.label}</Badge>;
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { v: BadgeProps['variant'] }> = {
    admin:    { v: 'purple' },
    staff:    { v: 'blue' },
    customer: { v: 'green' },
    supplier: { v: 'orange' }
  };
  const cfg = map[role] || { v: 'gray' };
  return <Badge variant={cfg.v}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>;
}
