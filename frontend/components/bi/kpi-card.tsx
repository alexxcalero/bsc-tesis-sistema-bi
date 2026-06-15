import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function KPICard({
  label,
  value,
  change,
  unit,
  icon,
  trend = 'neutral',
}: KPICardProps) {
  const trendColor =
    trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';
  const TrendIcon =
    trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
        </div>
        {icon && <div className="text-primary opacity-60">{icon}</div>}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-2 text-sm">
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          <span className={trendColor}>
            {Math.abs(change)}% {change > 0 ? 'aumento' : change < 0 ? 'disminución' : 'sin cambio'}
          </span>
          <span className="text-muted-foreground">vs período anterior</span>
        </div>
      )}
    </div>
  );
}
