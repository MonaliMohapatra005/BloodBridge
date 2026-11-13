import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { BloodBadge } from '../../components/ui/BloodBadge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { getEligiblePatientGroupsForDonor } from '../../lib/bloodCompatibility';
import { formatDate } from '../../lib/utils';
import {
  Activity,
  Heart,
  Droplet,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

export const DonorProfilePage: React.FC = () => {
  const { user, updateReadiness } = useAuth();
  const toast = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastDonatedInput, setLastDonatedInput] = useState<string>(
    user?.lastDonatedAt ? new Date(user.lastDonatedAt).toISOString().split('T')[0] : ''
  );

  useEffect(() => {
    if (user?.lastDonatedAt) {
      setLastDonatedInput(new Date(user.lastDonatedAt).toISOString().split('T')[0]);
    } else {
      setLastDonatedInput('');
    }
  }, [user?.lastDonatedAt]);

  const canDonateTo = user?.bloodGroup
    ? getEligiblePatientGroupsForDonor(user.bloodGroup)
    : [];

  // Check 90-day cooldown
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const lastDonatedDate = user?.lastDonatedAt ? new Date(user.lastDonatedAt) : null;
  const isEligibleCooldown = !lastDonatedDate || lastDonatedDate <= ninetyDaysAgo;
  const remainingCooldownDays = lastDonatedDate && !isEligibleCooldown
    ? Math.max(1, Math.ceil((lastDonatedDate.getTime() + 90 * 24 * 60 * 60 * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleToggleAvailability = async () => {
    if (!user) return;
    try {
      setIsUpdating(true);
      await updateReadiness({ isAvailableToDonate: !user.isAvailableToDonate });
      toast.success(
        `Your status is now ${!user.isAvailableToDonate ? 'Ready to Donate' : 'Unavailable'}`,
        'Donor Readiness'
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update readiness');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveLastDonationDate = async () => {
    try {
      setIsUpdating(true);
      const isoDate = lastDonatedInput ? new Date(lastDonatedInput).toISOString() : null;
      await updateReadiness({ lastDonatedAt: isoDate });
      toast.success('Last donation date updated successfully', 'Cooldown Configured');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update donation date');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Donor Readiness & Availability"
        subtitle="Manage your emergency broadcast eligibility, 90-day donation cooldown, and community donor status."
        badge={
          user?.bloodGroup && <BloodBadge bloodGroup={user.bloodGroup} size="lg" />
        }
      />

      {/* Main Readiness Toggle Card */}
      <Card className="border-blood-100 shadow-sm overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-slate-50 via-white to-red-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Emergency Broadcast Readiness
            </span>
            <h3 className="text-xl font-bold text-[#17212B]">
              {user?.isAvailableToDonate
                ? 'Ready to Receive Emergency Broadcasts'
                : 'Temporarily Unavailable'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              When ready, you will be alerted when a nearby hospital requests blood matching your group ({user?.bloodGroup}).
            </p>
          </div>

          <Button
            size="lg"
            variant={user?.isAvailableToDonate ? 'primary' : 'outline'}
            isLoading={isUpdating}
            onClick={handleToggleAvailability}
            className="shrink-0 font-bold px-6"
          >
            {user?.isAvailableToDonate ? 'Mark as Unavailable' : 'I am Ready to Donate'}
          </Button>
        </div>
      </Card>

      {/* Grid of Medical & Eligibility Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Blood Group & Compatibility Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Droplet className="w-4 h-4 text-blood-700" />
              <span>Blood Group Compatibility</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-600 font-medium">Your Blood Group</span>
              <BloodBadge bloodGroup={user?.bloodGroup || 'O+'} size="md" />
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-2 font-medium">
                Patients with these blood groups can receive your blood:
              </span>
              <div className="flex flex-wrap gap-2">
                {canDonateTo.map((group) => (
                  <BloodBadge key={group} bloodGroup={group} size="sm" showIcon={false} />
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {user?.bloodGroup === 'O-'
                  ? 'Universal Donor: You can donate red blood cells to any patient in an emergency!'
                  : `Your blood is verified compatible for ${canDonateTo.length} blood recipient groups.`}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 90-Day Cooldown & Donation History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-navy-700" />
              <span>90-Day Donation Cooldown</span>
            </CardTitle>
            <CardDescription>
              Medical guidelines enforce a 90-day cooldown between whole blood donations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-600 font-medium">Cooldown Status</span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  isEligibleCooldown
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isEligibleCooldown
                  ? 'Eligible to Donate'
                  : `Cooldown Active (${remainingCooldownDays} days left)`}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 block">
                Last Blood Donation Date
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={lastDonatedInput}
                  onChange={(e) => setLastDonatedInput(e.target.value)}
                  className="flex-1 text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blood-700"
                />
                <Button
                  size="sm"
                  variant="outline"
                  isLoading={isUpdating}
                  onClick={handleSaveLastDonationDate}
                >
                  Save Date
                </Button>
                {user?.lastDonatedAt && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isUpdating}
                    onClick={async () => {
                      setLastDonatedInput('');
                      setIsUpdating(true);
                      try {
                        await updateReadiness({ lastDonatedAt: null });
                        toast.success('Donation cooldown cleared', 'Reset');
                      } catch (err: any) {
                        toast.error(err.message || 'Failed to clear');
                      } finally {
                        setIsUpdating(false);
                      }
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Updating this prevents receiving emergency requests while your body replenishes red blood cells.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Total Donations Logged:</span>
              <strong className="text-base text-[#17212B]">{user?.totalDonations || 0}</strong>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

