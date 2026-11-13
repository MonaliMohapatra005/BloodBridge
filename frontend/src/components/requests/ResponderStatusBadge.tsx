import React from 'react';
import { ResponderStatus } from '../../types/responder.types';
import { Badge } from '../ui/Badge';
import { CheckCircle2, Clock, Car, Navigation, ShieldCheck, UserX } from 'lucide-react';

interface ResponderStatusBadgeProps {
  status: ResponderStatus;
  size?: 'sm' | 'md';
}

export const ResponderStatusBadge: React.FC<ResponderStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  switch (status) {
    case 'CONFIRMED_PRIMARY':
      return (
        <Badge variant="primary" size={size} className="gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Primary Donor</span>
        </Badge>
      );
    case 'CONFIRMED_BACKUP':
      return (
        <Badge variant="backup" size={size} className="gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Backup Responder</span>
        </Badge>
      );
    case 'EN_ROUTE':
      return (
        <Badge variant="en_route" size={size} className="gap-1 animate-pulse">
          <Navigation className="w-3.5 h-3.5" />
          <span>En Route</span>
        </Badge>
      );
    case 'ARRIVED':
      return (
        <Badge variant="arrived" size={size} className="gap-1">
          <Car className="w-3.5 h-3.5" />
          <span>Arrived at Hospital</span>
        </Badge>
      );
    case 'DONATED':
      return (
        <Badge variant="donated" size={size} className="gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Donation Complete</span>
        </Badge>
      );
    case 'WITHDRAWN':
      return (
        <Badge variant="withdrawn" size={size} className="gap-1">
          <UserX className="w-3.5 h-3.5" />
          <span>Withdrawn</span>
        </Badge>
      );
    default:
      return <Badge variant="default" size={size}>{status}</Badge>;
  }
};

