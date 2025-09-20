import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, PaymentBadge } from '@/components/StatusBadge';
import { useMembers } from '@/hooks/useMembers';
import { Member } from '@/types';
import { Link } from 'react-router-dom';

export default function Members() {
  const { members, loading } = useMembers();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'due' | 'overdue'>('all');

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.phone.includes(searchQuery) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Members</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Members</h1>
        <Button asChild className="bg-gradient-primary">
          <Link to="/members/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'due', 'overdue'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status ? 'bg-gradient-primary' : ''}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">No members found</div>
          {searchQuery && (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function MemberCard({ member }: { member: Member }) {
  return (
    <Card className="card-hover animate-scale-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{member.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{member.email}</p>
          </div>
          <div className="flex flex-col gap-2">
            <StatusBadge status={member.status} />
            <PaymentBadge status={member.paymentStatus} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Phone:</span>
          <span className="font-medium">{member.phone}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subscription:</span>
          <Badge variant="outline" className="capitalize">
            {member.subscriptionType}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Expires:</span>
          <span className="font-medium">
            {new Date(member.subscriptionEnd).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to={`/members/${member.id}/edit`}>
              Edit
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to={`/checkin?member=${member.id}`}>
              Check-in
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}