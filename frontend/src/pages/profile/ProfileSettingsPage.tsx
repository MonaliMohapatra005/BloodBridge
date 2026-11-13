import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { BloodBadge } from '../../components/ui/BloodBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatDate } from '../../lib/utils';
import {
  User,
  Phone,
  Mail,
  Droplet,
  Heart,
  ShieldCheck,
  LogOut,
  Calendar,
  Edit2,
  Check,
  X,
} from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const { user, logout, updateReadiness } = useAuth();
  const toast = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState(user?.fullName || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  useEffect(() => {
    if (user) {
      setEditFullName(user.fullName || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFullName.trim()) {
      toast.warning('Full name cannot be empty');
      return;
    }

    try {
      setIsUpdating(true);
      await updateReadiness({
        fullName: editFullName.trim(),
        email: editEmail.trim() || null,
      });
      setIsEditing(false);
      toast.success('Profile details saved to database successfully!', 'Profile Updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleReadiness = async () => {
    if (!user) return;
    try {
      setIsUpdating(true);
      await updateReadiness({ isAvailableToDonate: !user.isAvailableToDonate });
      toast.success(
        `Donor readiness set to ${!user.isAvailableToDonate ? 'Available' : 'Unavailable'}`,
        'Profile Updated'
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update readiness');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Account & Profile Settings"
        subtitle="Manage your community profile details and security settings."
        badge={
          user?.bloodGroup && <BloodBadge bloodGroup={user.bloodGroup} size="lg" />
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-blood-700" />
                    <span>Personal Information</span>
                  </CardTitle>
                  <CardDescription>
                    Verified community member details used during emergency coordination.
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      required
                    />

                    <Input
                      label="Email Address (Optional)"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => {
                        setIsEditing(false);
                        setEditFullName(user?.fullName || '');
                        setEditEmail(user?.email || '');
                      }}
                      leftIcon={<X className="w-3.5 h-3.5" />}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isUpdating}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Save to Database
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-400 block mb-0.5">Full Name</span>
                    <p className="font-bold text-[#17212B]">{user?.fullName}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-400 block mb-0.5">Phone Number</span>
                    <p className="font-bold text-[#17212B] font-mono">{user?.phone}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-400 block mb-0.5">Email Address</span>
                    <p className="font-medium text-[#17212B]">
                      {user?.email || <span className="text-slate-400 italic">None provided</span>}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-400 block mb-0.5">Registered Blood Group</span>
                    <div className="mt-1">
                      <BloodBadge bloodGroup={user?.bloodGroup || 'O+'} size="sm" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Donor Readiness Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-600" />
                <span>Donor Readiness Toggle</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-[#17212B]">
                    {user?.isAvailableToDonate ? 'Ready to Donate' : 'Temporarily Unavailable'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Toggle whether you wish to receive targeted blood group alerts when someone needs help.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={user?.isAvailableToDonate ? 'primary' : 'outline'}
                  isLoading={isUpdating}
                  onClick={handleToggleReadiness}
                >
                  {user?.isAvailableToDonate ? 'Disable Alerts' : 'Enable Alerts'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Platform Statistics & Logout */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Impact Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Total Donations</span>
                <strong className="text-sm text-[#17212B]">{user?.totalDonations || 0}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Reliability Score</span>
                <strong className="text-sm text-emerald-700">
                  {((user?.reliabilityScore || 1.0) * 100).toFixed(0)}%
                </strong>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Last Donated Date</span>
                <span className="text-slate-700">
                  {user?.lastDonatedAt ? formatDate(user.lastDonatedAt) : 'No donation recorded'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <Button
                variant="danger"
                size="md"
                onClick={logout}
                className="w-full justify-center text-sm font-semibold"
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

