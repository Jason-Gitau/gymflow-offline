import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { Payment, Member } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshPayments = async () => {
    try {
      const allPayments = await db.payments.orderBy('date').reverse().toArray();
      setPayments(allPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPayment = async (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: uuidv4()
    };

    await db.payments.add(newPayment);
    await refreshPayments();
    return newPayment;
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    await db.payments.update(id, updates);
    await refreshPayments();
  };

  const completePayment = async (member: Member, amount: number) => {
    // Mark existing incomplete payment as paid if exists
    const existingPayment = payments.find(
      p => p.memberId === member.id && p.status === 'incomplete'
    );

    if (existingPayment) {
      await updatePayment(existingPayment.id, { 
        status: 'paid', 
        amount,
        date: new Date() 
      });
    } else {
      await addPayment({
        memberId: member.id,
        memberName: member.name,
        amount,
        date: new Date(),
        status: 'paid',
        subscriptionType: member.subscriptionType
      });
    }

    // Update member payment status
    await db.members.update(member.id, { paymentStatus: 'paid' });
  };

  const getTodayRevenue = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    return payments
      .filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= todayStart && 
               paymentDate < todayEnd && 
               payment.status === 'paid';
      })
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getRevenueByType = () => {
    const revenueMap = new Map<string, number>();
    
    payments
      .filter(p => p.status === 'paid')
      .forEach(payment => {
        const current = revenueMap.get(payment.subscriptionType) || 0;
        revenueMap.set(payment.subscriptionType, current + payment.amount);
      });

    return Array.from(revenueMap.entries()).map(([type, amount]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      amount
    }));
  };

  const getIncompletePayments = () => {
    return payments.filter(p => p.status === 'incomplete');
  };

  const getMonthlyRevenue = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return payments
      .filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= monthStart && 
               paymentDate <= monthEnd && 
               payment.status === 'paid';
      })
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  useEffect(() => {
    refreshPayments();
  }, []);

  return {
    payments,
    loading,
    refreshPayments,
    addPayment,
    updatePayment,
    completePayment,
    getTodayRevenue,
    getRevenueByType,
    getIncompletePayments,
    getMonthlyRevenue
  };
}