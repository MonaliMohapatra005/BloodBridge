import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { requestService } from '../../services/request.service';
import { PageHeader } from '../../components/layout/PageHeader';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { BloodBadge } from '../../components/ui/BloodBadge';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Compass, Radio } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['emergency-request', requestId],
    queryFn: () => requestService.getRequestById(requestId!),
    enabled: !!requestId && requestId !== 'undefined' && requestId.length === 24,
  });

  const request = data?.request;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title={request ? `Coordination Chat: ${request.patientName}` : 'Emergency Chat'}
        subtitle={
          request
            ? `Direct in-app communication for ${request.hospitalName}`
            : 'Coordinate arrival, hospital desk, and donation milestones in real-time.'
        }
        badge={
          request?.bloodGroup && <BloodBadge bloodGroup={request.bloodGroup} size="lg" />
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Requests', href: '/requests' },
          {
            label: request?.patientName || 'Request Details',
            href: `/requests/${requestId}`,
          },
          { label: 'Chat' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/requests/${requestId}`}>
              <Button variant="outline" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Details
              </Button>
            </Link>
            <Link to={`/requests/${requestId}/tracking`}>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Compass className="w-4 h-4 text-emerald-400" />}
              >
                Live Map
              </Button>
            </Link>
          </div>
        }
      />

      {requestId && (
        <ChatWindow
          requestId={requestId}
          patientName={request?.patientName}
          hospitalName={request?.hospitalName}
        />
      )}
    </div>
  );
};

