import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  UserCheck, 
  UserX, 
  Clock, 
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { db, Member, type CheckIn } from '@/lib/database';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const statusStyles = {
  active: 'bg-success/10 text-success border-success/20',
  expired: 'bg-destructive/10 text-destructive border-destructive/20',
  'expiring-soon': 'bg-warning/10 text-warning border-warning/20'
};

const paymentStatusStyles = {
  paid: 'bg-success/10 text-success border-success/20',
  incomplete: 'bg-destructive/10 text-destructive border-destructive/20'
};

export default function CheckIn() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [memberCheckIns, setMemberCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const searchMembers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        await db.updateMemberStatuses();
        const results = await db.searchMembers(searchQuery);
        setSearchResults(results.slice(0, 10)); // Limit to 10 results
      } catch (error) {
        console.error('Error searching members:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchMembers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const selectMember = async (member: Member) => {
    setSelectedMember(member);
    setSearchQuery(member.fullName);
    setSearchResults([]);
    
    // Load member's recent check-ins
    try {
      const checkIns = await db.getMemberCheckIns(member.id!, 5);
      setMemberCheckIns(checkIns);
    } catch (error) {
      console.error('Error loading check-ins:', error);
    }
  };

  const canCheckIn = (member: Member): boolean => {
    return member.status === 'active' && member.paymentStatus === 'paid';
  };

  const handleCheckIn = async () => {
    if (!selectedMember) return;

    if (!canCheckIn(selectedMember)) {
      toast({
        title: 'Check-in Blocked',
        description: 'Member must have active subscription and complete payment to check in.',
        variant: 'destructive'
      });
      return;
    }

    setChecking(true);
    try {
      await db.checkInMember(selectedMember.id!);
      
      // Refresh check-ins
      const updatedCheckIns = await db.getMemberCheckIns(selectedMember.id!, 5);
      setMemberCheckIns(updatedCheckIns);

      toast({
        title: 'Check-in Successful! 🎉',
        description: `${selectedMember.fullName} has been checked in successfully.`,
      });

    } catch (error) {
      console.error('Error checking in member:', error);
      toast({
        title: 'Check-in Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setChecking(false);
    }
  };

  const completePayment = async () => {
    if (!selectedMember) return;

    try {
      await db.members.update(selectedMember.id!, { paymentStatus: 'paid' });
      setSelectedMember({ ...selectedMember, paymentStatus: 'paid' });
      
      toast({
        title: 'Payment Completed',
        description: 'Member payment status updated successfully.',
      });
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment status.',
        variant: 'destructive'
      });
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setSelectedMember(null);
    setSearchResults([]);
    setMemberCheckIns([]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Member Check-In</h1>
          <p className="text-muted-foreground">
            Search and check-in gym members
          </p>
        </div>
        <Button onClick={resetSearch} variant="outline">
          New Search
        </Button>
      </motion.div>

      {/* Search Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="card-stats">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Search Member
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && !selectedMember && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => selectMember(member)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center text-white font-semibold">
                        {member.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{member.fullName}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{member.phone}</span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(statusStyles[member.status])}
                    >
                      🟢 {member.status === 'active' ? 'Active' : member.status === 'expiring-soon' ? '🟠 Due Soon' : '🔴 Expired'}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Selected Member Details */}
      {selectedMember && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Member Profile */}
          <Card className="card-stats">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserCheck className="w-5 h-5 mr-2" />
                  Member Profile
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(statusStyles[selectedMember.status])}
                >
                  {selectedMember.status === 'active' ? '🟢 Active' : 
                   selectedMember.status === 'expiring-soon' ? '🟠 Due Soon' : '🔴 Expired'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {selectedMember.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedMember.fullName}</h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {selectedMember.phone}
                    </div>
                    {selectedMember.email && (
                      <div className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {selectedMember.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Subscription</p>
                  <p className="font-medium capitalize">{selectedMember.subscriptionType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fee</p>
                  <p className="font-medium">KSh {selectedMember.subscriptionFee.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Renewal Date</p>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    <p className="font-medium">{format(selectedMember.renewalDate, 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge 
                    variant="outline" 
                    className={cn(paymentStatusStyles[selectedMember.paymentStatus])}
                  >
                    {selectedMember.paymentStatus === 'paid' ? '✅ Paid' : '❌ Incomplete'}
                  </Badge>
                </div>
              </div>

              {/* Payment Warning */}
              {selectedMember.paymentStatus === 'incomplete' && (
                <Alert className="border-destructive/20 bg-destructive/5">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    <strong>Payment Required:</strong> Member has incomplete payment. 
                    Complete payment before check-in.
                  </AlertDescription>
                </Alert>
              )}

              {/* Status Warning */}
              {selectedMember.status !== 'active' && (
                <Alert className="border-warning/20 bg-warning/5">
                  <Clock className="h-4 w-4 text-warning" />
                  <AlertDescription className="text-warning">
                    <strong>Subscription {selectedMember.status === 'expired' ? 'Expired' : 'Expiring Soon'}:</strong> 
                    {' '}Renewal required for check-in access.
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4">
                {selectedMember.paymentStatus === 'incomplete' && (
                  <Button onClick={completePayment} variant="outline" className="flex-1">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Complete Payment
                  </Button>
                )}
                
                <Button 
                  onClick={handleCheckIn}
                  disabled={!canCheckIn(selectedMember) || checking}
                  className={cn(
                    "flex-1",
                    canCheckIn(selectedMember) 
                      ? "bg-success hover:bg-success/90 text-white" 
                      : "opacity-50"
                  )}
                >
                  {checking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Checking In...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Check In
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Check-Ins */}
          <Card className="card-stats">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Check-Ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              {memberCheckIns.length > 0 ? (
                <div className="space-y-3">
                  {memberCheckIns.map((checkIn, index) => (
                    <motion.div
                      key={checkIn.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          isToday(checkIn.checkInTime) ? "bg-success" : "bg-muted-foreground"
                        )}></div>
                        <div>
                          <p className="font-medium">
                            {format(checkIn.checkInTime, 'MMM dd, yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(checkIn.checkInTime, 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      {isToday(checkIn.checkInTime) && (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          Today
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent check-ins</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}