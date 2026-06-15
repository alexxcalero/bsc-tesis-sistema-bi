import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  href?: string;
  variant?: 'default' | 'highlight' | 'subtle';
}

export function StatCard({
  title,
  value,
  description,
  icon,
  variant = 'default',
}: StatCardProps) {
  const baseClasses = 'rounded-lg p-4 border';
  const variantClasses = {
    default: 'bg-card border-border',
    highlight: 'bg-primary/10 border-primary/20',
    subtle: 'bg-secondary/5 border-secondary/20',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-lg font-semibold text-foreground">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
        </div>
        {icon && <div className="flex-shrink-0 text-primary/60">{icon}</div>}
      </div>
    </div>
  );
}
