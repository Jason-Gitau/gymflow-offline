import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  gradient = 'primary',
  className 
}: StatsCardProps) {
  const gradientClasses = {
    primary: 'bg-gradient-primary',
    success: 'bg-gradient-success',
    warning: 'bg-gradient-warning',
    danger: 'bg-gradient-danger'
  };

  return (
    <Card className={`card-hover overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </p>
              <p className="text-3xl font-bold text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {trend && (
                <p className={`text-xs mt-1 ${
                  trend.isPositive ? 'text-success' : 'text-danger'
                }`}>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </p>
              )}
            </div>
            <div className={`${gradientClasses[gradient]} p-3 rounded-xl`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}