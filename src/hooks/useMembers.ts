import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { Member, MemberStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshMembers = async () => {
    try {
      const allMembers = await db.members.toArray();
      const updatedMembers = allMembers.map(updateMemberStatus);
      
      // Update statuses in database
      await Promise.all(
        updatedMembers.map(member => 
          db.members.update(member.id, { status: member.status })
        )
      );
      
      setMembers(updatedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMemberStatus = (member: Member): Member => {
    const now = new Date();
    const endDate = new Date(member.subscriptionEnd);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDateStart = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    let status: MemberStatus = 'active';
    
    if (endDateStart.getTime() === todayStart.getTime()) {
      status = 'due';
    } else if (endDate < now) {
      status = 'overdue';
    } else {
      status = 'active';
    }
    
    return { ...member, status };
  };

  const addMember = async (memberData: Omit<Member, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const newMember: Member = {
      ...memberData,
      id: uuidv4(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedMember = updateMemberStatus(newMember);
    await db.members.add(updatedMember);
    await refreshMembers();
    return updatedMember;
  };

  const updateMember = async (id: string, updates: Partial<Member>) => {
    const updatedData = {
      ...updates,
      updatedAt: new Date()
    };
    
    await db.members.update(id, updatedData);
    await refreshMembers();
  };

  const deleteMember = async (id: string) => {
    await db.members.delete(id);
    await refreshMembers();
  };

  const getMemberById = async (id: string): Promise<Member | undefined> => {
    return await db.members.get(id);
  };

  const searchMembers = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return members.filter(member => 
      member.name.toLowerCase().includes(lowercaseQuery) ||
      member.phone.includes(query) ||
      member.email.toLowerCase().includes(lowercaseQuery) ||
      member.id.includes(query)
    );
  };

  useEffect(() => {
    refreshMembers();
  }, []);

  return {
    members,
    loading,
    refreshMembers,
    addMember,
    updateMember,
    deleteMember,
    getMemberById,
    searchMembers
  };
}