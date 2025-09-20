import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, DollarSign, Calendar, Users } from 'lucide-react';
import { Member, Payment } from '@/types';
import { Link } from 'react-router-dom';

interface AlertsSectionProps {
  overdueMembers: Member[];
  incompletePayments: Payment[];
  renewalsDue: Member[];
}

export function AlertsSection({ overdueMembers, incompletePayments, renewalsDue }: AlertsSectionProps) {
  const alerts = [
    {
      title: 'Overdue Subscriptions',
      count: overdueMembers.length,
      icon: AlertTriangle,
      color: 'danger',
      items: overdueMembers.slice(0, 3),
      link: '/members?filter=overdue'
    },
    {
      title: 'Incomplete Payments',
      count: incompletePayments.length,
      icon: DollarSign,
      color: 'warning',
      items: incompletePayments.slice(0, 3),
      link: '/payments?filter=incomplete'
    },
    {
      title: 'Renewals Due Soon',
      count: renewalsDue.length,
      icon: Calendar,
      color: 'primary',
      items: renewalsDue.slice(0, 3),
      link: '/members?filter=due'
    }
  ];

  if (alerts.every(alert => alert.count === 0)) {
    return (
      <Card className="card-hover col-span-full">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">All Clear!</h3>
            <p className="text-muted-foreground">No pending alerts at the moment.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {alerts.map((alert) => {
        if (alert.count === 0) return null;
        
        const Icon = alert.icon;
        const colorClasses = {
          danger: 'text-danger bg-danger/10 border-danger/20',
          warning: 'text-warning bg-warning/10 border-warning/20',
          primary: 'text-primary bg-primary/10 border-primary/20'
        };

        return (
          <Card key={alert.title} className="card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {alert.title}
                </CardTitle>
                <Badge className={colorClasses[alert.color as keyof typeof colorClasses]}>
                  {alert.count}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 mb-4">
                {alert.items.map((item: any, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.memberName || item.name}</span>
                    <span className="text-muted-foreground">
                      {item.amount ? `$${item.amount}` : 
                       item.subscriptionEnd ? new Date(item.subscriptionEnd).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))}
                {alert.count > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{alert.count - 3} more
                  </div>
                )}
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to={alert.link}>
                  View All
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}