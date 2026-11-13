import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestService } from '../../services/request.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSocket, useRequestRoom } from '../../sockets/useSocket';
import { SOCKET_EVENTS } from '../../sockets/socketEvents';
import { PageHeader } from '../../components/layout/PageHeader';
import { BloodBadge } from '../../components/ui/BloodBadge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { EmergencyMap } from '../../components/tracking/EmergencyMap';
import { ResponderPoolList } from '../../components/tracking/ResponderPoolList';
import {
  Compass,
  MessageSquare,
  Radio,
  ArrowLeft,
  Building2,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const RequestTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const socket = useSocket();

  useRequestRoom(id);

  // Fetch request details and pool
  const {
    data,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['emergency-request', id],
    queryFn: () => requestService.getRequestById(id!),
    enabled: !!id && id !== 'undefined' && id.length === 24,
    refetchInterval: 15000,
  });

  const request = data?.request;
  const responderPool = data?.responderPool || [];
  const myResponse = data?.myResponse || null;

  const isRequester =
    request && user
      ? typeof request.requesterId === 'object'
        ? String(request.requesterId._id) === String(user._id)
        : String(request.requesterId) === String(user._id)
      : false;

  // Socket.IO real-time pool updates
  useEffect(() => {
    if (!socket || !id) return;

    const handlePoolUpdate = (payload: any) => {
      if (payload.requestId === id) {
        queryClient.invalidateQueries({ queryKey: ['emergency-request', id] });
      }
    };

    socket.on(SOCKET_EVENTS.POOL_UPDATED, handlePoolUpdate);
    socket.on(SOCKET_EVENTS.RESPONDER_STATUS_CHANGED, handlePoolUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.POOL_UPDATED, handlePoolUpdate);
      socket.off(SOCKET_EVENTS.RESPONDER_STATUS_CHANGED, handlePoolUpdate);
    };
  }, [socket, id, queryClient]);

  // Update responder milestone mutation
  const updateResponderStatusMutation = useMutation({
    mutationFn: (status: 'EN_ROUTE' | 'ARRIVED' | 'DONATED' | 'WITHDRAWN') =>
      requestService.updateResponderStatus(id!, { status }),
    onSuccess: (res) => {
      toast.success(res.message || 'Milestone updated', 'Responder Status');
      queryClient.invalidateQueries({ queryKey: ['emergency-request', id] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update milestone');
    },
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <Radio className="w-10 h-10 mx-auto text-blood-700 animate-pulse" />
        <p className="text-sm font-semibold">Loading Live Telemetry Map & Responders...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Request Not Found</h3>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/requests')}>
          Back to Requests
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <PageHeader
        title={`Live Tracking: ${request.patientName}`}
        subtitle={`Real-time telemetry and responder coordination for ${request.hospitalName}`}
        badge={<BloodBadge bloodGroup={request.bloodGroup} size="lg" />}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Requests', href: '/requests' },
          { label: request.patientName, href: `/requests/${id}` },
          { label: 'Live Tracking' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/requests/${id}`}>
              <Button variant="outline" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Details
              </Button>
            </Link>
            <Link to={`/chat/${id}`}>
              <Button
                variant="primary"
                size="md"
                leftIcon={<MessageSquare className="w-4 h-4" />}
              >
                Emergency Chat
              </Button>
            </Link>
          </div>
        }
      />

      {/* Main Interactive Map */}
      <EmergencyMap request={request} responderPool={responderPool} />

      {/* Responder Pool & Status Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Compass className="w-4 h-4 text-blood-700" />
              <span>Emergency Responders Pool ({responderPool.length})</span>
            </CardTitle>
            <span className="text-xs text-slate-400 font-mono">
              Live Room: request:{id}
            </span>
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
    </div>
  );
};

