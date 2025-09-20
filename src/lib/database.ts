import Dexie, { Table } from 'dexie';
import { Member, CheckIn, Payment } from '@/types';

export class GymDatabase extends Dexie {
  members!: Table<Member>;
  checkIns!: Table<CheckIn>;
  payments!: Table<Payment>;

  constructor() {
    super('GymManagementDB');
    
    this.version(1).stores({
      members: 'id, name, phone, email, subscriptionType, status, paymentStatus, subscriptionStart, subscriptionEnd',
      checkIns: 'id, memberId, memberName, timestamp, subscriptionType',
      payments: 'id, memberId, memberName, amount, date, status, subscriptionType'
    });
  }
}

export const db = new GymDatabase();

// Initialize with some sample data if database is empty
export async function initializeDatabase() {
  const memberCount = await db.members.count();
  
  if (memberCount === 0) {
    // Add sample members
    const sampleMembers: Member[] = [
      {
        id: '1',
        name: 'John Smith',
        phone: '+1234567890',
        email: 'john@example.com',
        subscriptionType: 'monthly',
        subscriptionStart: new Date(2024, 8, 1),
        subscriptionEnd: new Date(2024, 9, 1),
        paymentStatus: 'paid',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        phone: '+1234567891',
        email: 'sarah@example.com',
        subscriptionType: 'weekly',
        subscriptionStart: new Date(2024, 8, 15),
        subscriptionEnd: new Date(2024, 8, 22),
        paymentStatus: 'incomplete',
        status: 'due',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Mike Wilson',
        phone: '+1234567892',
        email: 'mike@example.com',
        subscriptionType: 'monthly',
        subscriptionStart: new Date(2024, 7, 1),
        subscriptionEnd: new Date(2024, 8, 1),
        paymentStatus: 'paid',
        status: 'overdue',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'Emma Davis',
        phone: '+1234567893',
        email: 'emma@example.com',
        subscriptionType: 'daily',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 24 * 60 * 60 * 1000),
        paymentStatus: 'paid',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.members.bulkAdd(sampleMembers);

    // Add sample check-ins
    const sampleCheckIns: CheckIn[] = [
      {
        id: '1',
        memberId: '1',
        memberName: 'John Smith',
        timestamp: new Date(),
        subscriptionType: 'monthly',
        memberStatus: 'active'
      },
      {
        id: '2',
        memberId: '4',
        memberName: 'Emma Davis',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        subscriptionType: 'daily',
        memberStatus: 'active'
      }
    ];

    await db.checkIns.bulkAdd(sampleCheckIns);

    // Add sample payments
    const samplePayments: Payment[] = [
      {
        id: '1',
        memberId: '1',
        memberName: 'John Smith',
        amount: 50,
        date: new Date(),
        status: 'paid',
        subscriptionType: 'monthly'
      },
      {
        id: '2',
        memberId: '2',
        memberName: 'Sarah Johnson',
        amount: 15,
        date: new Date(),
        status: 'incomplete',
        subscriptionType: 'weekly'
      }
    ];

    await db.payments.bulkAdd(samplePayments);
  }
}