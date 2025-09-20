import { useState } from 'react';
import { DollarSign, Plus, Filter, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { usePayments } from '@/hooks/usePayments';

export default function Payments() {
  const { payments, loading, getTodayRevenue, getMonthlyRevenue, getIncompletePayments } = usePayments();
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'incomplete'>('all');

  const filteredPayments = payments.filter(payment => 
    statusFilter === 'all' || payment.status === statusFilter
  );

  const todayRevenue = getTodayRevenue();
  const monthlyRevenue = getMonthlyRevenue();
  const incompleteCount = getIncompletePayments().length;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Payments</h1>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Payments</h1>
        <Button className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Today's Revenue"
          value={`$${todayRevenue}`}
          icon={DollarSign}
          gradient="success"
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${monthlyRevenue}`}
          icon={TrendingUp}
          gradient="primary"
        />
        <StatsCard
          title="Incomplete Payments"
          value={incompleteCount}
          icon={Filter}
          gradient="warning"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'paid', 'incomplete'] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className={statusFilter === status ? 'bg-gradient-primary' : ''}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <Badge variant="secondary" className="ml-2">
                {payments.filter(p => p.status === status).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Payments List */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPayments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{payment.memberName}</div>
                  <div className="text-sm text-muted-foreground">
                    {payment.subscriptionType} subscription
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">${payment.amount}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <Badge 
                    className={payment.status === 'paid' ? 'status-paid' : 'status-incomplete'}
                  >
                    {payment.status === 'paid' ? 'Paid' : 'Incomplete'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          {filteredPayments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No payments found for the selected filter
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}