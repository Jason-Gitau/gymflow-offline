import { useEffect } from 'react';
import { Users, UserCheck, DollarSign, AlertTriangle } from 'lucide-react';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { WeeklyCheckInsChart, SubscriptionDistributionChart, RevenueChart } from '@/components/Dashboard/Charts';
import { AlertsSection } from '@/components/Dashboard/AlertsSection';
import { useDashboard } from '@/hooks/useDashboard';
import { initializeDatabase } from '@/lib/database';

export default function Dashboard() {
  const { stats, loading } = useDashboard();

  useEffect(() => {
    initializeDatabase();
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Members"
          value={stats.activeMembers}
          icon={Users}
          gradient="primary"
          className="animate-slide-up"
        />
        <StatsCard
          title="Today's Check-ins"
          value={stats.todayCheckIns}
          icon={UserCheck}
          gradient="success"
          className="animate-slide-up"
        />
        <StatsCard
          title="Today's Revenue"
          value={`$${stats.todayRevenue}`}
          icon={DollarSign}
          gradient="warning"
          className="animate-slide-up"
        />
        <StatsCard
          title="Incomplete Payments"
          value={stats.incompletePayments}
          icon={AlertTriangle}
          gradient="danger"
          className="animate-slide-up"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <WeeklyCheckInsChart data={stats.weeklyCheckIns} />
        <SubscriptionDistributionChart data={stats.subscriptionDistribution} />
        <RevenueChart data={stats.revenueByType} />
      </div>

      {/* Alerts */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alerts & Notifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AlertsSection
            overdueMembers={stats.alerts.overdueMembers}
            incompletePayments={stats.alerts.incompletePayments}
            renewalsDue={stats.alerts.renewalsDue}
          />
        </div>
      </div>
    </div>
  );
}