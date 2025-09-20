export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  subscriptionType: 'daily' | 'weekly' | 'monthly';
  subscriptionStart: Date;
  subscriptionEnd: Date;
  paymentStatus: 'paid' | 'incomplete';
  status: 'active' | 'due' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckIn {
  id: string;
  memberId: string;
  memberName: string;
  timestamp: Date;
  subscriptionType: string;
  memberStatus: string;
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: Date;
  status: 'paid' | 'incomplete';
  subscriptionType: string;
  notes?: string;
}

export interface DashboardStats {
  activeMembers: number;
  todayCheckIns: number;
  todayRevenue: number;
  incompletePayments: number;
  weeklyCheckIns: { day: string; count: number }[];
  subscriptionDistribution: { type: string; count: number }[];
  revenueByType: { type: string; amount: number }[];
  alerts: {
    overdueMembers: Member[];
    incompletePayments: Payment[];
    renewalsDue: Member[];
  };
}

export type MemberStatus = 'active' | 'due' | 'overdue';
export type PaymentStatus = 'paid' | 'incomplete';
export type SubscriptionType = 'daily' | 'weekly' | 'monthly';