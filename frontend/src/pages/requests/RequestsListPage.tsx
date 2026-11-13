import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { requestService } from '../../services/request.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { BloodRequest, RequestStatus } from '../../types/request.types';
import { PageHeader } from '../../components/layout/PageHeader';
import { RequestCard } from '../../components/requests/RequestCard';
import { RequestFilters } from '../../components/requests/RequestFilters';
import { Modal } from '../../components/ui/Modal';
import { LocationPickerMap } from '../../components/location/LocationPickerMap';
import { Button } from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { PlusCircle, RefreshCw, Compass, Navigation } from 'lucide-react';

export const RequestsListPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [mineFilter, setMineFilter] = useState(false);
  const [compatibleOnlyFilter, setCompatibleOnlyFilter] = useState(false);

  // Quick Respond Modal State
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [manualLat, setManualLat] = useState<number | null>(null);
  const [manualLng, setManualLng] = useState<number | null>(null);

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery({
    queryKey: [
      'all-emergency-requests',
      { status: statusFilter || undefined, mine: mineFilter, compatibleOnly: compatibleOnlyFilter },
    ],
    queryFn: () =>
      requestService.getRequests({
        status: (statusFilter as RequestStatus) || undefined,
        mine: mineFilter || undefined,
        compatibleOnly: compatibleOnlyFilter || undefined,
      }),
  });

  const allRequests = data?.requests || [];

  // Client-side text search by patient name, hospital name or address
  const filteredRequests = allRequests.filter((req) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      req.patientName.toLowerCase().includes(term) ||
      req.hospitalName.toLowerCase().includes(term) ||
      req.hospitalAddress.toLowerCase().includes(term) ||
      req.bloodGroup.toLowerCase().includes(term)
    );
  });

  // Respond mutation
  const respondMutation = useMutation({
    mutationFn: ({ id, lat, lng }: { id: string; lat: number; lng: number }) =>
      requestService.respondToRequest(id, { lat, lng }),
    onSuccess: (res, variables) => {
      toast.success(res.message || 'Help confirmed!', 'Response Logged');
      queryClient.invalidateQueries({ queryKey: ['all-emergency-requests'] });
      setSelectedRequest(null);
      navigate(`/requests/${variables.id}/tracking`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Could not respond to request');
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
        toast.warning('Could not auto-detect location. Please enter coordinates manually.');
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
      toast.warning('Please enter valid latitude and longitude coordinates.');
      return;
    }

    respondMutation.mutate({
      id: selectedRequest._id,
      lat: manualLat,
      lng: manualLng,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Emergency Blood Requests"
        subtitle="Discover, filter, and respond to urgent blood needs across hospitals and care facilities."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => refetch()}
              isLoading={isRefetching}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/requests/create')}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Broadcast Need
            </Button>
          </div>
        }
      />

      {/* Filter Component */}
      <RequestFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        mineFilter={mineFilter}
        onMineChange={setMineFilter}
        compatibleOnlyFilter={compatibleOnlyFilter}
        onCompatibleOnlyChange={setCompatibleOnlyFilter}
        myBloodGroup={user?.bloodGroup}
      />

      {/* Request Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title="No Blood Requests Found"
          description={
            search || statusFilter || mineFilter || compatibleOnlyFilter
              ? 'No requests match your current filters. Try resetting filters or searching for something else.'
              : 'There are no active emergency requests right now. Create one if you need urgent blood.'
          }
          actionLabel="Create Request"
          onAction={() => navigate('/requests/create')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRequests.map((req) => (
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
