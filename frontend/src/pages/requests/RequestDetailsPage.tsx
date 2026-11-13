import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestService } from '../../services/request.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSocket, useRequestRoom } from '../../sockets/useSocket';
import { SOCKET_EVENTS } from '../../sockets/socketEvents';
import { PageHeader } from '../../components/layout/PageHeader';
import { BloodBadge } from '../../components/ui/BloodBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { LocationPickerMap } from '../../components/location/LocationPickerMap';
import { ResponderPoolList } from '../../components/tracking/ResponderPoolList';
import { formatDate, formatDistance, formatDuration } from '../../lib/utils';
import {
  Building2,
  Clock,
  Compass,
  Layers,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Radio,
  ShieldCheck,
  User,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const RequestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const socket = useSocket();

  useRequestRoom(id);

  // Modals
  const [respondModalOpen, setRespondModalOpen] = useState(false);
  const [statusConfirmModal, setStatusConfirmModal] = useState<'FULFILLED' | 'CANCELLED' | null>(
    null
  );

  // Response coordinates
  const [manualLat, setManualLat] = useState<number | null>(null);
  const [manualLng, setManualLng] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Fetch single request details
  const {
    data,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['emergency-request', id],
    queryFn: () => requestService.getRequestById(id!),
    enabled: !!id && id !== 'undefined' && id.length === 24,
  });

  const request = data?.request;
  const responderPool = data?.responderPool || [];
  const myResponse = data?.myResponse || null;
  const compatibility = data?.compatibility;

  const isRequester =
    request && user
      ? typeof request.requesterId === 'object'
        ? String(request.requesterId._id) === String(user._id)
        : String(request.requesterId) === String(user._id)
      : false;

  const isClosed =
    request && ['FULFILLED', 'CANCELLED', 'EXPIRED'].includes(request.status);

  // Real-time socket listeners for live pool and status updates
  useEffect(() => {
    if (!socket || !id) return;

    const handlePoolUpdated = (payload: any) => {
      if (payload.requestId === id) {
        queryClient.invalidateQueries({ queryKey: ['emergency-request', id] });
        toast.info('Responder pool has been updated in real-time', 'Pool Telemetry');
      }
    };

    const handleStatusChanged = (payload: any) => {
      if (payload.requestId === id) {
        queryClient.invalidateQueries({ queryKey: ['emergency-request', id] });
        toast.warning(`Request status changed to ${payload.status}`, 'Status Update');
      }
    };

    socket.on(SOCKET_EVENTS.POOL_UPDATED, handlePoolUpdated);
    socket.on(SOCKET_EVENTS.REQUEST_STATUS_CHANGED, handleStatusChanged);
    socket.on(SOCKET_EVENTS.RESPONDER_STATUS_CHANGED, handlePoolUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.POOL_UPDATED, handlePoolUpdated);
      socket.off(SOCKET_EVENTS.REQUEST_STATUS_CHANGED, handleStatusChanged);
      socket.off(SOCKET_EVENTS.RESPONDER_STATUS_CHANGED, handlePoolUpdated);
    };
  }, [socket, id, queryClient, toast]);

  // Respond mutation
  const respondMutation = useMutation({
    mutationFn: (coords: { lat: number; lng: number }) =>
      requestService.respondToRequest(id!, coords),
    onSuccess: (res) => {
      toast.success(res.message || 'Help confirmed!', 'Enrolled in Pool');
      queryClient.invalidateQueries({ queryKey: ['emergency-request', id] });
      setRespondModalOpen(false);
      navigate(`/requests/${id}/tracking`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to confirm response');
    },
  });

  // Update responder status mutation
  const updateResponderStatusMutation = useMutation({
    mutationFn: (status: 'EN_ROUTE' | 'ARRIVED' | 'DONATED' | 'WITHDRAWN') =>
      requestService.updateResponderStatus(id!, { status }),
    onSuccess: (res) => {
      toast.success(res.message || 'Status updated', 'Milestone Updated');
      queryClient.invalidateQueries({ queryKey: ['emergency-request', id] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update responder milestone');
    },
  });

  // Update request status mutation (Requester only)
  const updateRequestStatusMutation = useMutation({
    mutationFn: (status: 'FULFILLED' | 'CANCELLED') =>
      requestService.updateRequestStatus(id!, { status }),
    onSuccess: (res) => {
      toast.success(res.message || 'Status updated', 'Request Status');
      queryClient.invalidateQueries({ queryKey: ['emergency-request', id] });
      setStatusConfirmModal(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update request status');
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

  const handleOpenRespondModal = () => {
    setRespondModalOpen(true);
    setManualLat(null);
    setManualLng(null);
    requestGPS();
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 space-y-3">
        <Radio className="w-8 h-8 mx-auto text-blood-700 animate-pulse" />
        <p className="text-sm">Connecting to live request telemetry...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Blood Request Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          This emergency broadcast may have been deleted or expired.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => navigate('/requests')}
        >
          Back to All Requests
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      <PageHeader
        title={request.patientName}
        subtitle={`Emergency blood broadcast for ${request.hospitalName}`}
        badge={
          <BloodBadge
            bloodGroup={request.bloodGroup}
            size="lg"
            isCompatible={compatibility?.isCompatibleWithMe}
          />
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Requests', href: '/requests' },
          { label: request.patientName },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/requests/${id}/tracking`}>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Compass className="w-4 h-4 text-emerald-400" />}
              >
                Live Map Tracking
              </Button>
            </Link>

            <Link to={`/chat/${id}`}>
              <Button
                variant="outline"
                size="md"
                leftIcon={<MessageSquare className="w-4 h-4 text-slate-600" />}
              >
                Emergency Chat
              </Button>
            </Link>

            {!isClosed && !myResponse && (
              <Button
                variant="primary"
                size="md"
                onClick={handleOpenRespondModal}
                leftIcon={<Navigation className="w-4 h-4" />}
              >
                Confirm Help
              </Button>
            )}

            {isRequester && !isClosed && (
              <div className="flex items-center gap-2">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => setStatusConfirmModal('FULFILLED')}
                >
                  Mark Fulfilled
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusConfirmModal('CANCELLED')}
                  className="text-red-600 hover:bg-red-50 border-red-200"
                >
                  Cancel Request
                </Button>
              </div>
            )}
          </div>
        }
      />

      {/* Status & Medical Summary Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Request Status
          </span>
          <Badge
            variant={
              request.status === 'BROADCASTING'
                ? 'broadcasting'
                : request.status === 'RESPONDERS_POOLING'
                ? 'pooling'
                : request.status === 'FULFILLED'
                ? 'fulfilled'
                : 'cancelled'
            }
          >
            {request.status.replace('_', ' ')}
          </Badge>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Urgency Level
          </span>
          <Badge
            variant={
              request.urgencyLevel === 'CRITICAL'
                ? 'critical'
                : request.urgencyLevel === 'URGENT'
                ? 'urgent'
                : 'scheduled'
            }
          >
            {request.urgencyLevel}
          </Badge>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Units Needed
          </span>
          <span className="text-base font-bold text-[#17212B]">
            {request.unitsNeeded} Unit{request.unitsNeeded > 1 ? 's' : ''}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Target Pool
          </span>
          <span className="text-base font-bold text-[#17212B]">
            {request.targetPoolSize} Donors
          </span>
        </div>
      </div>

      {/* Hospital Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blood-700" />
            <span>Hospital & Destination Coordinates</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Hospital Facility</p>
              <p className="font-bold text-[#17212B] text-base mt-0.5">{request.hospitalName}</p>
              <p className="text-slate-500 text-xs mt-1 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{request.hospitalAddress}</span>
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Latitude / Longitude:</span>
                <span className="font-mono font-semibold">
                  {request.hospitalLat.toFixed(5)}, {request.hospitalLng.toFixed(5)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Broadcast Issued:</span>
                <span>{formatDate(request.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expires At:</span>
                <span>{formatDate(request.expiresAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compatibility Matrix Card */}
      {compatibility && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Medical Compatibility Matrix (RBC)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-slate-500">Patient requires: </span>
                <strong className="text-[#17212B]">{compatibility.patientBloodGroup}</strong>
                <span className="mx-2">•</span>
                <span className="text-slate-500">Your registered group: </span>
                <strong className="text-blood-700">{compatibility.myBloodGroup}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                {compatibility.isCompatibleWithMe ? (
                  <span className="text-emerald-700 bg-emerald-100/70 font-semibold px-2.5 py-1 rounded-lg">
                    ✓ Medically Compatible
                  </span>
                ) : (
                  <span className="text-slate-600 bg-slate-200/70 font-semibold px-2.5 py-1 rounded-lg">
                    Incompatible for Direct RBC
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span>All compatible donor blood groups for {compatibility.patientBloodGroup}:</span>
              {compatibility.compatibleDonorGroups.map((bg) => (
                <BloodBadge key={bg} bloodGroup={bg} size="sm" showIcon={false} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranked Responder Pool Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-blood-700" />
              <span>Ranked Responder Pool ({responderPool.length})</span>
            </CardTitle>
            <Link to={`/requests/${id}/tracking`} className="text-xs font-semibold text-blood-700 hover:text-blood-800">
              Open Live Map →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <ResponderPoolList
            responderPool={responderPool}
            myResponse={myResponse}
            onUpdateStatus={async (status) => {
              await updateResponderStatusMutation.mutateAsync(status);
            }}
            isUpdating={updateResponderStatusMutation.isPending}
            isRequester={isRequester}
          />
        </CardContent>
      </Card>

      {/* Confirm Help Modal */}
      <Modal
        isOpen={respondModalOpen}
        onClose={() => setRespondModalOpen(false)}
        title="Confirm Emergency Help"
        description={`Patient: ${request.patientName} (${request.bloodGroup}) at ${request.hospitalName}`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRespondModalOpen(false)}
              disabled={respondMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={respondMutation.isPending}
              disabled={manualLat === null || manualLng === null || isNaN(manualLat) || isNaN(manualLng)}
              onClick={() => {
                if (manualLat !== null && manualLng !== null) {
                  respondMutation.mutate({ lat: manualLat, lng: manualLng });
                }
              }}
              leftIcon={<Compass className="w-4 h-4" />}
            >
              Confirm Response
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-blood-800 leading-relaxed">
            Your current coordinates are submitted strictly once to calculate driving time to <strong>{request.hospitalName}</strong> and assign your slot as a <strong>Primary</strong> or <strong>Backup</strong> donor.
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
              <label className="text-[11px] text-slate-500 font-medium block mb-1">Latitude</label>
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
              <label className="text-[11px] text-slate-500 font-medium block mb-1">Longitude</label>
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

      {/* Requester Status Change Modal (Fulfilled or Cancelled) */}
      <Modal
        isOpen={!!statusConfirmModal}
        onClose={() => setStatusConfirmModal(null)}
        title={
          statusConfirmModal === 'FULFILLED'
            ? 'Mark Request as Fulfilled?'
            : 'Cancel Emergency Request?'
        }
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusConfirmModal(null)}
              disabled={updateRequestStatusMutation.isPending}
            >
              Back
            </Button>
            <Button
              variant={statusConfirmModal === 'FULFILLED' ? 'success' : 'danger'}
              size="sm"
              isLoading={updateRequestStatusMutation.isPending}
              onClick={() => {
                if (statusConfirmModal) {
                  updateRequestStatusMutation.mutate(statusConfirmModal);
                }
              }}
            >
              Confirm {statusConfirmModal}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          {statusConfirmModal === 'FULFILLED'
            ? 'This will notify all active responders that blood units have been successfully received and mark the emergency broadcast as fulfilled.'
            : 'This will close the broadcast and notify all donors in the responder pool.'}
        </p>
      </Modal>
    </div>
  );
};

