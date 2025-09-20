import { useState, useEffect } from 'react';
import { DashboardStats } from '@/types';
import { useMembers } from './useMembers';
import { useCheckIns } from './useCheckIns';
import { usePayments } from './usePayments';

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { members } = useMembers();
  const { getTodayCheckIns, getWeeklyCheckIns } = useCheckIns();
  const { getTodayRevenue, getRevenueByType, getIncompletePayments } = usePayments();

  const calculateStats = () => {
    if (!members.length) return;

    const activeMembers = members.filter(m => m.status === 'active').length;
    const todayCheckIns = getTodayCheckIns().length;
    const todayRevenue = getTodayRevenue();
    const incompletePaymentsCount = getIncompletePayments().length;
    
    const weeklyCheckIns = getWeeklyCheckIns();
    
    // Subscription distribution
    const subscriptionMap = new Map<string, number>();
    members.forEach(member => {
      const type = member.subscriptionType;
      subscriptionMap.set(type, (subscriptionMap.get(type) || 0) + 1);
    });
    
    const subscriptionDistribution = Array.from(subscriptionMap.entries()).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count
    }));

    const revenueByType = getRevenueByType();

    // Alerts
    const overdueMembers = members.filter(m => m.status === 'overdue');
    const incompletePaymentMembers = getIncompletePayments();
    
    // Renewals due this week
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const renewalsDue = members.filter(member => {
      const endDate = new Date(member.subscriptionEnd);
      return endDate <= nextWeek && member.status === 'active';
    });

    const newStats: DashboardStats = {
      activeMembers,
      todayCheckIns,
      todayRevenue,
      incompletePayments: incompletePaymentsCount,
      weeklyCheckIns,
      subscriptionDistribution,
      revenueByType,
      alerts: {
        overdueMembers,
        incompletePayments: incompletePaymentMembers,
        renewalsDue
      }
    };

    setStats(newStats);
    setLoading(false);
  };

  useEffect(() => {
    calculateStats();
  }, [members]);

  return {
    stats,
    loading,
    refreshStats: calculateStats
  };
}