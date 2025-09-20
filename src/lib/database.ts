import Dexie, { Table } from 'dexie';

// Database Models
export interface Member {
  id?: number;
  fullName: string;
  phone: string;
  email?: string;
  gender: 'male' | 'female' | 'other';
  startDate: Date;
  subscriptionType: 'daily' | 'weekly' | 'monthly';
  subscriptionFee: number;
  renewalDate: Date;
  status: 'active' | 'expired' | 'expiring-soon';
  paymentStatus: 'paid' | 'incomplete';
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id?: number;
  memberId: number;
  amount: number;
  paymentMethod: 'cash' | 'mpesa' | 'card' | 'bank-transfer';
  paymentDate: Date;
  renewalPeriod: string; // e.g., "Jan 2024", "Week 1 Jan"
  notes?: string;
  status: 'complete' | 'incomplete';
  createdAt: Date;
}

export interface CheckIn {
  id?: number;
  memberId: number;
  checkInTime: Date;
  createdAt: Date;
}

export interface GymSettings {
  id?: number;
  gymName: string;
  gymLogo?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  defaultDailyFee: number;
  defaultWeeklyFee: number;
  defaultMonthlyFee: number;
  pinCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Database Class
export class GymFlowDatabase extends Dexie {
  members!: Table<Member>;
  payments!: Table<Payment>;
  settings!: Table<GymSettings>;
  checkIns!: Table<CheckIn>;

  constructor() {
    super('GymFlowDB');
    
    this.version(2).stores({
      members: '++id, fullName, phone, email, status, subscriptionType, paymentStatus, renewalDate, createdAt',
      payments: '++id, memberId, paymentDate, amount, paymentMethod, status, createdAt',
      settings: '++id, gymName, createdAt',
      checkIns: '++id, memberId, checkInTime, createdAt'
    });

    // Hooks for automatic timestamps and status updates
    this.members.hook('creating', (primKey, obj, trans) => {
      const member = obj as Member;
      member.createdAt = new Date();
      member.updatedAt = new Date();
      member.status = this.calculateMemberStatus(member.renewalDate);
      if (!member.paymentStatus) {
        member.paymentStatus = 'incomplete';
      }
    });

    this.members.hook('updating', (modifications, primKey, obj, trans) => {
      const mods = modifications as Partial<Member>;
      mods.updatedAt = new Date();
      if (mods.renewalDate) {
        mods.status = this.calculateMemberStatus(mods.renewalDate);
      }
    });

    this.payments.hook('creating', (primKey, obj, trans) => {
      const payment = obj as Payment;
      payment.createdAt = new Date();
      if (!payment.status) {
        payment.status = 'complete';
      }
    });

    this.checkIns.hook('creating', (primKey, obj, trans) => {
      const checkIn = obj as CheckIn;
      checkIn.createdAt = new Date();
    });

    this.settings.hook('creating', (primKey, obj, trans) => {
      const settings = obj as GymSettings;
      settings.createdAt = new Date();
      settings.updatedAt = new Date();
    });

    this.settings.hook('updating', (modifications, primKey, obj, trans) => {
      const mods = modifications as Partial<GymSettings>;
      mods.updatedAt = new Date();
    });
  }

  // Helper Methods
  private calculateMemberStatus(renewalDate: Date): 'active' | 'expired' | 'expiring-soon' {
    const now = new Date();
    const timeDiff = renewalDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return 'expired';
    } else if (daysDiff <= 7) {
      return 'expiring-soon';
    } else {
      return 'active';
    }
  }

  // Calculate renewal date based on subscription type
  calculateRenewalDate(startDate: Date, subscriptionType: Member['subscriptionType']): Date {
    const renewalDate = new Date(startDate);
    
    switch (subscriptionType) {
      case 'daily':
        renewalDate.setDate(renewalDate.getDate() + 1);
        break;
      case 'weekly':
        renewalDate.setDate(renewalDate.getDate() + 7);
        break;
      case 'monthly':
        renewalDate.setMonth(renewalDate.getMonth() + 1);
        break;
    }
    
    return renewalDate;
  }

  // Database Operations
  async getAllMembers(): Promise<Member[]> {
    return this.members.orderBy('fullName').toArray();
  }

  async getMembersByStatus(status: Member['status']): Promise<Member[]> {
    return this.members.where('status').equals(status).toArray();
  }

  async getActiveMembers(): Promise<Member[]> {
    return this.members.where('status').equals('active').toArray();
  }

  async getExpiredMembers(): Promise<Member[]> {
    return this.members.where('status').equals('expired').toArray();
  }

  async getExpiringSoonMembers(): Promise<Member[]> {
    return this.members.where('status').equals('expiring-soon').toArray();
  }

  async getMemberPayments(memberId: number): Promise<Payment[]> {
    return this.payments.where('memberId').equals(memberId).reverse().toArray();
  }

  async getMonthlyRevenue(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const payments = await this.payments
      .where('paymentDate')
      .between(startDate, endDate)
      .toArray();
    
    const completePayments = payments.filter(p => p.status === 'complete');
    return completePayments.reduce((total, payment) => total + payment.amount, 0);
  }

  async getDailyRevenue(date: Date): Promise<number> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const payments = await this.payments
      .where('paymentDate')
      .between(startDate, endDate)
      .toArray();
    
    const completePayments = payments.filter(p => p.status === 'complete');
    return completePayments.reduce((total, payment) => total + payment.amount, 0);
  }

  async getTodayCheckIns(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const checkIns = await this.checkIns
      .where('checkInTime')
      .between(today, tomorrow)
      .toArray();
    
    return checkIns.length;
  }

  async getMemberCheckIns(memberId: number, limit = 5): Promise<CheckIn[]> {
    return this.checkIns
      .where('memberId')
      .equals(memberId)
      .reverse()
      .limit(limit)
      .toArray();
  }

  async getIncompletePayments(): Promise<Member[]> {
    return this.members.where('paymentStatus').equals('incomplete').toArray();
  }

  async checkInMember(memberId: number): Promise<CheckIn> {
    const checkIn: Omit<CheckIn, 'id'> = {
      memberId,
      checkInTime: new Date(),
      createdAt: new Date()
    };
    
    const id = await this.checkIns.add(checkIn);
    return { ...checkIn, id };
  }

  async getGymSettings(): Promise<GymSettings | undefined> {
    return this.settings.orderBy('id').last();
  }

  async updateMemberStatuses(): Promise<void> {
    const members = await this.getAllMembers();
    
    for (const member of members) {
      const newStatus = this.calculateMemberStatus(member.renewalDate);
      if (member.status !== newStatus) {
        await this.members.update(member.id!, { status: newStatus });
      }
    }
  }

  // Search functionality
  async searchMembers(query: string): Promise<Member[]> {
    const searchTerm = query.toLowerCase();
    return this.members
      .filter(member => 
        member.fullName.toLowerCase().includes(searchTerm) ||
        member.phone.includes(searchTerm) ||
        (member.email && member.email.toLowerCase().includes(searchTerm))
      )
      .toArray();
  }
}

// Database instance
export const db = new GymFlowDatabase();

// Initialize default settings
export const initializeDefaultSettings = async () => {
  const existingSettings = await db.getGymSettings();
  
  if (!existingSettings) {
    await db.settings.add({
      gymName: 'FitFlow Gym',
      defaultDailyFee: 150,
      defaultWeeklyFee: 800,
      defaultMonthlyFee: 2500,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
};