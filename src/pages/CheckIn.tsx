import { useState, useEffect } from 'react';
import { Search, User, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, PaymentBadge } from '@/components/StatusBadge';
import { useMembers } from '@/hooks/useMembers';
import { useCheckIns } from '@/hooks/useCheckIns';
import { usePayments } from '@/hooks/usePayments';
import { Member } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';

export default function CheckIn() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchParams] = useSearchParams();
  
  const { members, searchMembers } = useMembers();
  const { addCheckIn, getMemberCheckIns } = useCheckIns();
  const { completePayment } = usePayments();

  const searchResults = searchQuery ? searchMembers(searchQuery) : [];
  const memberCheckIns = selectedMember ? getMemberCheckIns(selectedMember.id) : [];

  useEffect(() => {
    const memberId = searchParams.get('member');
    if (memberId) {
      const member = members.find(m => m.id === memberId);
      if (member) {
        setSelectedMember(member);
      }
    }
  }, [members, searchParams]);

  const handleCheckIn = async () => {
    if (!selectedMember) return;

    try {
      await addCheckIn(selectedMember);
      toast({
        title: 'Check-in Successful!',
        description: `${selectedMember.name} has been checked in.`,
      });
      setSelectedMember(null);
      setSearchQuery('');
    } catch (error) {
      toast({
        title: 'Check-in Failed',
        description: error instanceof Error ? error.message : 'Unable to check in member',
        variant: 'destructive',
      });
    }
  };

  const handleCompletePayment = async () => {
    if (!selectedMember) return;

    try {
      // For demo purposes, using a default amount based on subscription type
      const amounts = { daily: 10, weekly: 25, monthly: 50 };
      const amount = amounts[selectedMember.subscriptionType];
      
      await completePayment(selectedMember, amount);
      
      // Update selected member status
      const updatedMember = { ...selectedMember, paymentStatus: 'paid' as const };
      setSelectedMember(updatedMember);
      
      toast({
        title: 'Payment Completed!',
        description: `Payment of $${amount} has been recorded for ${selectedMember.name}.`,
      });
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: 'Unable to complete payment',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Member Check-In</h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Search */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg h-12"
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map(member => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className="p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.phone}</div>
                      </div>
                      <div className="flex gap-2">
                        <StatusBadge status={member.status} />
                        <PaymentBadge status={member.paymentStatus} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Member */}
      {selectedMember && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Member Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{selectedMember.name}</span>
                <div className="flex gap-2">
                  <StatusBadge status={selectedMember.status} />
                  <PaymentBadge status={selectedMember.paymentStatus} />
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{selectedMember.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{selectedMember.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subscription:</span>
                  <Badge variant="outline" className="capitalize">
                    {selectedMember.subscriptionType}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span>{new Date(selectedMember.subscriptionEnd).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                {selectedMember.paymentStatus === 'paid' && selectedMember.status === 'active' ? (
                  <Button 
                    onClick={handleCheckIn}
                    className="w-full bg-gradient-success"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check In
                  </Button>
                ) : (
                  <div className="space-y-2">
                    {selectedMember.paymentStatus === 'incomplete' && (
                      <Button 
                        onClick={handleCompletePayment}
                        className="w-full bg-gradient-warning"
                      >
                        Complete Payment First
                      </Button>
                    )}
                    {selectedMember.status === 'overdue' && (
                      <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg">
                        <div className="flex items-center gap-2 text-danger">
                          <XCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Subscription expired. Please renew before check-in.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Check-ins */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Recent Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              {memberCheckIns.length > 0 ? (
                <div className="space-y-3">
                  {memberCheckIns.map(checkIn => (
                    <div key={checkIn.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <span className="text-sm">
                        {new Date(checkIn.timestamp).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(checkIn.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No recent check-ins
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedMember && !searchQuery && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Search for a Member</h3>
          <p className="text-muted-foreground">
            Use the search box above to find a member for check-in
          </p>
        </div>
      )}
    </div>
  );
}