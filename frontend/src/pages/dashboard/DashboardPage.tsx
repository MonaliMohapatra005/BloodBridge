import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { requestService } from '../../services/request.service';
import { BloodRequest } from '../../types/request.types';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { RequestCard } from '../../components/requests/RequestCard';
import { BloodBadge } from '../../components/ui/BloodBadge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { LocationPickerMap } from '../../components/location/LocationPickerMap';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getEligiblePatientGroupsForDonor } from '../../lib/bloodCompatibility';
import {
  Radio,
  PlusCircle,
  Activity,
  Heart,
  Droplet,
  Users,
  AlertCircle,
  Compass,
  ArrowRight,
  ShieldCheck,
  Navigation,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Quick Respond Modal State
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [manualLat, setManualLat] = useState<number | null>(null);
  const [manualLng, setManualLng] = useState<number | null>(null);

  // Fetch active requests
  const {
    data: requestsData,
    isLoading: isLoadingRequests,
    error: requestsError,
    refetch,
  } = useQuery({
    queryKey: ['emergency-requests'],
    queryFn: () => requestService.getRequests(),
    refetchInterval: 10000,
  });

  // Fetch my requests
  const { data: myRequestsData } = useQuery({
    queryKey: ['my-emergency-requests'],
    queryFn: () => requestService.getRequests({ mine: true }),
  });

  const activeRequests = requestsData?.requests || [];
  const myRequests = myRequestsData?.requests || [];
  const compatibleRequests = activeRequests.filter((r) => r.isCompatibleWithMe);

  const canDonateTo = user?.bloodGroup
    ? getEligiblePatientGroupsForDonor(user.bloodGroup)
    : [];

  // Live dynamic calculation of 90-day cooldown from MongoDB user profile
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const lastDonatedDate = user?.lastDonatedAt ? new Date(user.lastDonatedAt) : null;
  const isEligibleCooldown = !lastDonatedDate || lastDonatedDate <= ninetyDaysAgo;
  const remainingCooldownDays = lastDonatedDate && !isEligibleCooldown
    ? Math.max(1, Math.ceil((lastDonatedDate.getTime() + 90 * 24 * 60 * 60 * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Respond mutation
  const respondMutation = useMutation({
    mutationFn: ({ id, lat, lng }: { id: string; lat: number; lng: number }) =>
      requestService.respondToRequest(id, { lat, lng }),
    onSuccess: (data, variables) => {
      toast.success(
        data.message || 'You have confirmed your emergency response!',
        'Response Confirmed'
      );
      queryClient.invalidateQueries({ queryKey: ['emergency-requests'] });
      setSelectedRequest(null);
      navigate(`/requests/${variables.id}/tracking`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Could not confirm response');
    },
  });

  const requestGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser. Please enter coordinates manually.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setManualLat(parseFloat(pos.coords.latitude.toFixed(6)));
        setManualLng(parseFloat(pos.coords.longitude.toFixed(6)));
        setIsGettingLocation(false);
      },
      (err) => {
        console.warn('Geolocation unavailable:', err.message);
        setIsGettingLocation(false);
        toast.warning('Could not auto-detect location. Please enter coordinates manually or allow location access.');
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const handleOpenRespondModal = (req: BloodRequest) => {
    setSelectedRequest(req);
    setManualLat(null);
    setManualLng(null);
    requestGPS();
  };

  const handleConfirmResponse = () => {
    if (!selectedRequest) return;
    if (manualLat === null || manualLng === null || isNaN(manualLat) || isNaN(manualLng)) {
      toast.warning('Valid latitude and longitude are required to calculate road ETA.');
      return;
    }

    respondMutation.mutate({
      id: selectedRequest._id,
      lat: manualLat,
      lng: manualLng,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header with Welcome and User Summary */}
      <PageHeader
        title={`Welcome, ${user?.fullName || 'Volunteer'}`}
        subtitle="Real-time emergency blood broadcast coordination network. Zero continuous GPS tracking."
        badge={
          user?.bloodGroup && (
            <BloodBadge bloodGroup={user.bloodGroup} size="lg" className="shadow-sm" />
          )
        }
        actions={
          <div className="flex items-center gap-2">
            <Link to="/requests/create">
              <Button
                variant="primary"
                size="md"
                className="shadow-sm shadow-blood-700/20"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Create Emergency Request
              </Button>
            </Link>
          </div>
        }
      />

      {/* Critical Alert Banner if there are compatible requests awaiting help */}
      {user?.isAvailableToDonate && compatibleRequests.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-600 via-blood-700 to-red-800 text-white shadow-lg shadow-blood-700/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white shrink-0">
              <AlertCircle className="w-6 h-6 animate-pulse text-red-200" />
            </div>
            <div>
              <h4 className="text-base font-bold tracking-tight">
                {compatibleRequests.length} Emergency Blood Broadcast{compatibleRequests.length > 1 ? 's' : ''} Require Your Blood Group ({user.bloodGroup})!
              </h4>
              <p className="text-xs text-red-100 mt-0.5">
                Nearby patients are counting on compatible donors right now.
              </p>
            </div>
          </div>
          <Link to="/requests" className="shrink-0">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white text-blood-700 hover:bg-red-50 border-0 font-bold"
            >
              View Broadcasts
            </Button>
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Active Broadcasts"
          value={activeRequests.length}
          subtext="Emergency cases seeking donors"
          icon={Radio}
          iconColor="text-blood-700"
          iconBg="bg-red-50"
        />

        <StatCard
          label="Compatible With You"
          value={compatibleRequests.length}
          subtext={`Can donate to: ${canDonateTo.join(', ')}`}
          icon={Droplet}
          iconColor="text-emerald-700"
          iconBg="bg-emerald-50"
        />

        <StatCard
          label="Your Total Donations"
          value={user?.totalDonations || 0}
          subtext="Life-saving donations recorded"
          icon={Heart}
          iconColor="text-pink-600"
          iconBg="bg-pink-50"
        />

        <StatCard
          label="Your Requests"
          value={myRequests.length}
          subtext="Requests created by you"
          icon={Users}
          iconColor="text-navy-700"
          iconBg="bg-navy-50"
        />
      </div>

      {/* Main Content: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Emergency Broadcasts (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blood-700 animate-ping inline-block" />
              <h3 className="text-lg font-bold text-[#17212B]">Live Emergency Broadcasts</h3>
            </div>
            <Link
              to="/requests"
              className="text-xs font-semibold text-blood-700 hover:text-blood-800 flex items-center gap-1 transition-colors"
            >
              <span>View all ({activeRequests.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoadingRequests ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : activeRequests.length === 0 ? (
            <EmptyState
              title="No Active Emergency Broadcasts"
              description="There are currently no active blood broadcasts in the system. Create one if you or someone you know requires blood."
              actionLabel="Create Blood Request"
              onAction={() => navigate('/requests/create')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRequests.slice(0, 4).map((req) => (
                <RequestCard
                  key={req._id}
                  request={req}
                  isMyRequest={
                    user
                      ? typeof req.requesterId === 'object'
                        ? String(req.requesterId._id) === String(user._id)
                        : String(req.requesterId) === String(user._id)
                      : false
                  }
                  onRespondClick={handleOpenRespondModal}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Donor Readiness & Profile Card (1 col) */}
        <div className="space-y-6">
          {/* Donor Readiness Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Donor Readiness</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Emergency Alert Status
                  </p>
                  <p className="text-sm font-semibold text-[#17212B]">
                    {user?.isAvailableToDonate ? 'Ready to receive alerts' : 'Currently Unavailable'}
                  </p>
                </div>
                <span
                  className={`w-3.5 h-3.5 rounded-full ${
                    user?.isAvailableToDonate
                      ? 'bg-emerald-500 ring-4 ring-emerald-100'
                      : 'bg-slate-300'
                  }`}
                />
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Registered Blood Group:</span>
                  <span className="font-bold text-blood-700">{user?.bloodGroup}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Eligible Recipients:</span>
                  <span className="font-semibold">{canDonateTo.join(', ')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">90-Day Donation Cooldown:</span>
                  <span className={`font-semibold ${isEligibleCooldown ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isEligibleCooldown ? 'Eligible to Donate' : `Cooldown Active (${remainingCooldownDays} days left)`}
                  </span>
                </div>
              </div>

              <Link to="/donors/profile" className="block w-full pt-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Manage Donor Settings
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Zero GPS Privacy Assurance */}
          <Card className="bg-gradient-to-br from-slate-900 to-navy-950 text-white border-0">
            <CardContent className="p-6 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-blood-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold tracking-tight">Zero Continuous GPS Tracking</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                BloodBridge protects your battery and privacy. No app background location tracking is performed. Coordinates are captured strictly once upon tapping <em>Confirm Response</em>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Help Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="Confirm Emergency Help"
        description={
          selectedRequest &&
          `Patient: ${selectedRequest.patientName} (${selectedRequest.bloodGroup}) at ${selectedRequest.hospitalName}`
        }
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRequest(null)}
              disabled={respondMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={respondMutation.isPending}
              disabled={manualLat === null || manualLng === null || isNaN(manualLat) || isNaN(manualLng)}
              onClick={handleConfirmResponse}
              leftIcon={<Compass className="w-4 h-4" />}
            >
              Confirm Response
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-blood-800 leading-relaxed">
            Your current coordinates are submitted strictly once to calculate road travel time (ETA) via OSRM and assign your slot as a <strong>Primary Donor</strong> or <strong>Backup Responder</strong>.
          </div>

          {/* Interactive Map Picker for Donor Location */}
          <LocationPickerMap
            lat={manualLat}
            lng={manualLng}
            onChange={(lat, lng) => {
              setManualLat(lat);
              setManualLng(lng);
            }}
            markerType="donor"
            height="200px"
            helperText="Click the map where you are starting from or click 'Detect My GPS'."
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                placeholder="Click map or GPS"
                value={manualLat !== null ? manualLat : ''}
                onChange={(e) => setManualLat(e.target.value === '' ? null : parseFloat(e.target.value))}
                className="w-full text-xs font-mono p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blood-700"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                placeholder="Click map or GPS"
                value={manualLng !== null ? manualLng : ''}
                onChange={(e) => setManualLng(e.target.value === '' ? null : parseFloat(e.target.value))}
                className="w-full text-xs font-mono p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blood-700"
              />
            </div>
          </div>
          {manualLat === null && (
            <p className="text-[11px] text-amber-600">
              Please click the map or 'Detect My GPS' to enable response confirmation.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};
