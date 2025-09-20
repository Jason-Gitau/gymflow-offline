import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { CheckIn, Member } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function useCheckIns() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCheckIns = async () => {
    try {
      const allCheckIns = await db.checkIns.orderBy('timestamp').reverse().toArray();
      setCheckIns(allCheckIns);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCheckIn = async (member: Member) => {
    // Check if member can check in
    if (member.paymentStatus === 'incomplete' || member.status === 'overdue') {
      throw new Error('Cannot check in: Member has incomplete payment or overdue subscription');
    }

    const newCheckIn: CheckIn = {
      id: uuidv4(),
      memberId: member.id,
      memberName: member.name,
      timestamp: new Date(),
      subscriptionType: member.subscriptionType,
      memberStatus: member.status
    };

    await db.checkIns.add(newCheckIn);
    await refreshCheckIns();
    return newCheckIn;
  };

  const getTodayCheckIns = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    return checkIns.filter(checkIn => {
      const checkInDate = new Date(checkIn.timestamp);
      return checkInDate >= todayStart && checkInDate < todayEnd;
    });
  };

  const getWeeklyCheckIns = () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayCheckIns = checkIns.filter(checkIn => {
        const checkInDate = new Date(checkIn.timestamp);
        return checkInDate >= dayStart && checkInDate < dayEnd;
      });

      weeklyData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayCheckIns.length
      });
    }

    return weeklyData;
  };

  const getMemberCheckIns = (memberId: string, limit = 5) => {
    return checkIns
      .filter(checkIn => checkIn.memberId === memberId)
      .slice(0, limit);
  };

  useEffect(() => {
    refreshCheckIns();
  }, []);

  return {
    checkIns,
    loading,
    refreshCheckIns,
    addCheckIn,
    getTodayCheckIns,
    getWeeklyCheckIns,
    getMemberCheckIns
  };
}