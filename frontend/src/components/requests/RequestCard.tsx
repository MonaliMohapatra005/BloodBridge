import React from 'react';
import { Link } from 'react-router-dom';
import { BloodRequest } from '../../types/request.types';
import { BloodBadge } from '../ui/BloodBadge';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate, formatRelativeTime } from '../../lib/utils';
import {
  MapPin,
  Clock,
  Layers,
  ArrowRight,
  Radio,
  Building2,
  Users,
} from 'lucide-react';

interface RequestCardProps {
  request: BloodRequest;
  onRespondClick?: (request: BloodRequest) => void;
  isMyRequest?: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onRespondClick,
  isMyRequest = false,
}) => {
  const urgencyVariants = {
    CRITICAL: 'critical',
    URGENT: 'urgent',
    SCHEDULED: 'scheduled',
  } as const;

  const statusVariants = {
    BROADCASTING: 'broadcasting',
    RESPONDERS_POOLING: 'pooling',
    FULFILLED: 'fulfilled',
    CANCELLED: 'cancelled',
    EXPIRED: 'default',
  } as const;

  const isClosed = ['FULFILLED', 'CANCELLED', 'EXPIRED'].includes(request.status);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top emergency stripe for critical */}
      {request.urgencyLevel === 'CRITICAL' && !isClosed && (
        <div className="h-1.5 bg-gradient-to-r from-blood-700 via-red-500 to-blood-800" />
      )}

      <div className="p-5 sm:p-6 space-y-4 flex-1">
        {/* Header: Blood Group, Patient & Status Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <BloodBadge
              bloodGroup={request.bloodGroup}
              size="lg"
              isCompatible={request.isCompatibleWithMe}
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-[#17212B] tracking-tight">
                  {request.patientName}
                </h4>
                {isMyRequest && (
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    Created by you
                  </span>
                )}
              </div>
              <p className="text-xs text-[#73808C] flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatRelativeTime(request.createdAt)}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <Badge variant={urgencyVariants[request.urgencyLevel] || 'default'}>
              {request.urgencyLevel}
            </Badge>
            <Badge variant={statusVariants[request.status] || 'default'}>
              {request.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Hospital & Location Details */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-sm">
          <div className="flex items-start gap-2.5 text-[#17212B]">
            <Building2 className="w-4 h-4 text-blood-700 shrink-0 mt-0.5" />
            <span className="font-medium text-xs sm:text-sm">{request.hospitalName}</span>
          </div>

          <div className="flex items-start gap-2.5 text-slate-500 text-xs">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed">{request.hospitalAddress}</span>
          </div>
        </div>

        {/* Stats Grid: Units Needed & Pool Size */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Layers className="w-3.5 h-3.5 text-blood-700" />
              <span>Units Needed</span>
            </div>
            <p className="text-base font-bold text-[#17212B]">
              {request.unitsNeeded}{' '}
              <span className="text-xs font-normal text-slate-500">
                Unit{request.unitsNeeded > 1 ? 's' : ''}
              </span>
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Users className="w-3.5 h-3.5 text-navy-700" />
              <span>Target Pool</span>
            </div>
            <p className="text-base font-bold text-[#17212B]">
              {request.targetPoolSize}{' '}
              <span className="text-xs font-normal text-slate-500">Donors</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 sm:px-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
        <Link
          to={`/requests/${request._id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blood-700 transition-colors"
        >
          <span>View Details & Pool</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center gap-2">
          {!isClosed && onRespondClick && (
            <Button
              size="sm"
              variant={request.isCompatibleWithMe ? 'primary' : 'outline'}
              onClick={() => onRespondClick(request)}
              disabled={isClosed}
              className="text-xs py-1.5"
            >
              Respond
            </Button>
          )}

          <Link to={`/requests/${request._id}/tracking`}>
            <Button size="sm" variant="secondary" className="text-xs py-1.5 gap-1.5">
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>Live Track</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

