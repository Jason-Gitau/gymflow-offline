import { BarChart3, Download, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklyCheckInsChart, SubscriptionDistributionChart, RevenueChart } from '@/components/Dashboard/Charts';
import { useDashboard } from '@/hooks/useDashboard';
import { StatsCard } from '@/components/Dashboard/StatsCard';

export default function Reports() {
  const { stats, loading } = useDashboard();

  if (loading || !stats) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleExportPDF = () => {
    // Placeholder for PDF export functionality
    console.log('Exporting reports as PDF...');
  };

  const handleExportCSV = () => {
    // Placeholder for CSV export functionality
    console.log('Exporting reports as CSV...');
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Members"
          value={stats.activeMembers}
          icon={BarChart3}
          gradient="primary"
        />
        <StatsCard
          title="Today's Check-ins"
          value={stats.todayCheckIns}
          icon={Calendar}
          gradient="success"
        />
        <StatsCard
          title="Today's Revenue"
          value={`$${stats.todayRevenue}`}
          icon={TrendingUp}
          gradient="warning"
        />
        <StatsCard
          title="Pending Issues"
          value={stats.incompletePayments}
          icon={BarChart3}
          gradient="danger"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <WeeklyCheckInsChart data={stats.weeklyCheckIns} />
        <SubscriptionDistributionChart data={stats.subscriptionDistribution} />
        <RevenueChart data={stats.revenueByType} />
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Member Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Members</span>
                <span className="font-semibold text-success">{stats.activeMembers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overdue Members</span>
                <span className="font-semibold text-danger">{stats.alerts.overdueMembers.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Renewals Due Soon</span>
                <span className="font-semibold text-warning">{stats.alerts.renewalsDue.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Today's Revenue</span>
                <span className="font-semibold text-success">${stats.todayRevenue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Incomplete Payments</span>
                <span className="font-semibold text-danger">{stats.incompletePayments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Weekly Check-ins</span>
                <span className="font-semibold text-primary">
                  {stats.weeklyCheckIns.reduce((sum, day) => sum + day.count, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}