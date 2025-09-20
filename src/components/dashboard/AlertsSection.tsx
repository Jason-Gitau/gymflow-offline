import { motion } from 'framer-motion';
import { AlertTriangle, CreditCard, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Member } from '@/lib/database';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface AlertsSectionProps {
  expiredMembers: Member[];
  incompletePayments: Member[];
  upcomingRenewals: Member[];
}

export default function AlertsSection({ 
  expiredMembers, 
  incompletePayments, 
  upcomingRenewals 
}: AlertsSectionProps) {
  const hasAlerts = expiredMembers.length > 0 || incompletePayments.length > 0 || upcomingRenewals.length > 0;

  if (!hasAlerts) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="card-stats bg-success/5 border-success/20">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-semibold text-success">All Good! 🎉</h3>
              <p className="text-sm text-success/80 mt-1">
                No urgent alerts or overdue items
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="card-stats">
        <CardHeader>
          <CardTitle className="flex items-center text-warning">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overdue Members */}
          {expiredMembers.length > 0 && (
            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-destructive flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Overdue Members ({expiredMembers.length})
                </h4>
                <Link to="/members?filter=expired">
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/20">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {expiredMembers.slice(0, 3).map((member) => (
                  <div key={member.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{member.fullName}</span>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                      Expired {format(member.renewalDate, 'MMM dd')}
                    </Badge>
                  </div>
                ))}
                {expiredMembers.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{expiredMembers.length - 3} more expired members
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Incomplete Payments */}
          {incompletePayments.length > 0 && (
            <div className="p-4 border border-warning/20 rounded-lg bg-warning/5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-warning flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Incomplete Payments ({incompletePayments.length})
                </h4>
                <Link to="/payments">
                  <Button variant="outline" size="sm" className="text-warning border-warning/20">
                    Manage
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {incompletePayments.slice(0, 3).map((member) => (
                  <div key={member.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{member.fullName}</span>
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      ❌ Incomplete
                    </Badge>
                  </div>
                ))}
                {incompletePayments.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{incompletePayments.length - 3} more incomplete payments
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Renewals */}
          {upcomingRenewals.length > 0 && (
            <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-primary flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Renewals Due This Week ({upcomingRenewals.length})
                </h4>
                <Link to="/members?filter=expiring-soon">
                  <Button variant="outline" size="sm" className="text-primary border-primary/20">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {upcomingRenewals.slice(0, 3).map((member) => (
                  <div key={member.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{member.fullName}</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Due {format(member.renewalDate, 'MMM dd')}
                    </Badge>
                  </div>
                ))}
                {upcomingRenewals.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{upcomingRenewals.length - 3} more renewals due
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}