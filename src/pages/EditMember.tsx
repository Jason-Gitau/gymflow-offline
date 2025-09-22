import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { db, Member } from '@/lib/database';

const memberSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  subscriptionType: z.enum(['daily', 'weekly', 'monthly']),
  subscriptionFee: z.number().min(1, 'Subscription fee must be greater than 0'),
  startDate: z.date(),
  paymentStatus: z.enum(['paid', 'incomplete']),
});

type MemberFormData = z.infer<typeof memberSchema>;

export default function EditMember() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      paymentStatus: 'paid',
      startDate: new Date(),
    }
  });

  const subscriptionType = watch('subscriptionType');
  const startDate = watch('startDate');

  useEffect(() => {
    const loadMember = async () => {
      if (!id) {
        navigate('/members');
        return;
      }

      try {
        const memberData = await db.members.get(parseInt(id));
        if (!memberData) {
          toast({
            title: 'Error',
            description: 'Member not found',
            variant: 'destructive',
          });
          navigate('/members');
          return;
        }

        setMember(memberData);
        
        // Set form values
        setValue('fullName', memberData.fullName);
        setValue('phone', memberData.phone);
        setValue('email', memberData.email || '');
        setValue('subscriptionType', memberData.subscriptionType);
        setValue('subscriptionFee', memberData.subscriptionFee);
        setValue('startDate', memberData.startDate);
        setValue('paymentStatus', memberData.paymentStatus);
      } catch (error) {
        console.error('Error loading member:', error);
        toast({
          title: 'Error',
          description: 'Failed to load member details',
          variant: 'destructive',
        });
        navigate('/members');
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [id, navigate, setValue, toast]);

  const onSubmit = async (data: MemberFormData) => {
    if (!member) return;

    try {
      const renewalDate = db.calculateRenewalDate(data.startDate, data.subscriptionType);
      const status = db['calculateMemberStatus'](renewalDate);

      await db.members.update(member.id!, {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || undefined,
        subscriptionType: data.subscriptionType,
        subscriptionFee: data.subscriptionFee,
        startDate: data.startDate,
        renewalDate,
        paymentStatus: data.paymentStatus,
        status,
        updatedAt: new Date(),
      });

      toast({
        title: 'Success',
        description: 'Member updated successfully',
      });

      navigate('/members');
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: 'Error',
        description: 'Failed to update member',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/members')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Member</h1>
          <p className="text-muted-foreground">Update member information</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Member Information</CardTitle>
          <CardDescription>
            Update the member's details and subscription information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    {...register('fullName')}
                    className={cn(errors.fullName && "border-destructive")}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    className={cn(errors.phone && "border-destructive")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={cn(errors.email && "border-destructive")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Subscription Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Subscription Information</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Subscription Type *</Label>
                  <Select
                    value={subscriptionType}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                      setValue('subscriptionType', value)
                    }
                  >
                    <SelectTrigger className={cn(errors.subscriptionType && "border-destructive")}>
                      <SelectValue placeholder="Select subscription type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.subscriptionType && (
                    <p className="text-sm text-destructive">{errors.subscriptionType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscriptionFee">Subscription Fee (KSh) *</Label>
                  <Input
                    id="subscriptionFee"
                    type="number"
                    min="1"
                    {...register('subscriptionFee', { 
                      setValueAs: (v) => v === '' ? undefined : parseInt(v, 10) 
                    })}
                    className={cn(errors.subscriptionFee && "border-destructive")}
                  />
                  {errors.subscriptionFee && (
                    <p className="text-sm text-destructive">{errors.subscriptionFee.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground",
                          errors.startDate && "border-destructive"
                        )}
                      >
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setValue('startDate', date)}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.startDate && (
                    <p className="text-sm text-destructive">{errors.startDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Payment Status *</Label>
                  <Select
                    value={watch('paymentStatus')}
                    onValueChange={(value: 'paid' | 'incomplete') => 
                      setValue('paymentStatus', value)
                    }
                  >
                    <SelectTrigger className={cn(errors.paymentStatus && "border-destructive")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="incomplete">Incomplete</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.paymentStatus && (
                    <p className="text-sm text-destructive">{errors.paymentStatus.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Update Member
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/members')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}