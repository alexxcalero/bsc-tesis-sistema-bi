import { Check, AlertCircle, Clock, X } from 'lucide-react';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'error' | 'processing';
  label?: string;
}

const statusConfig = {
  active: {
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-700 dark:text-green-400',
    icon: Check,
    label: 'Activo',
  },
  inactive: {
    bgColor: 'bg-gray-500/10',
    textColor: 'text-gray-700 dark:text-gray-400',
    icon: X,
    label: 'Inactivo',
  },
  pending: {
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    icon: Clock,
    label: 'Pendiente',
  },
  completed: {
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-700 dark:text-blue-400',
    icon: Check,
    label: 'Completado',
  },
  error: {
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-700 dark:text-red-400',
    icon: AlertCircle,
    label: 'Error',
  },
  processing: {
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-700 dark:text-purple-400',
    icon: Clock,
    label: 'Procesando',
  },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
      <Icon className="w-3 h-3" />
      {label || config.label}
    </span>
  );
}
