import React, { useState } from 'react';
import { ResponderItem } from '../../types/responder.types';
import { ResponderStatusBadge } from '../requests/ResponderStatusBadge';
import { BloodBadge } from '../ui/BloodBadge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { formatDistance, formatDuration } from '../../lib/utils';
import {
  Car,
  CheckCircle2,
  Navigation,
  Phone,
  ShieldCheck,
  UserX,
  AlertTriangle,
} from 'lucide-react';

interface ResponderPoolListProps {
  responderPool: ResponderItem[];
  myResponse: ResponderItem | null;
  onUpdateStatus: (status: 'EN_ROUTE' | 'ARRIVED' | 'DONATED' | 'WITHDRAWN') => Promise<void>;
  isUpdating: boolean;
  isRequester: boolean;
}

export const ResponderPoolList: React.FC<ResponderPoolListProps> = ({
  responderPool,
  myResponse,
  onUpdateStatus,
  isUpdating,
  isRequester,
}) => {
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const primaryResponders = responderPool.filter(
    (r) =>
      ['CONFIRMED_PRIMARY', 'EN_ROUTE', 'ARRIVED', 'DONATED'].includes(r.status) &&
      r.status !== 'WITHDRAWN'
  );

  const backupResponders = responderPool.filter(
    (r) => r.status === 'CONFIRMED_BACKUP'
  );

  const handleConfirmWithdraw = async () => {
    await onUpdateStatus('WITHDRAWN');
    setWithdrawModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Current User Responder Control Panel (if logged in user is a responder in this pool) */}
      {myResponse && myResponse.status !== 'WITHDRAWN' && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200 p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blood-700">
                Your Donation Status
              </span>
              <div className="flex items-center gap-2 mt-1">
                <h4 className="text-base font-bold text-[#17212B]">
                  Active as {myResponse.status === 'CONFIRMED_PRIMARY' ? 'Primary Donor' : myResponse.status.replace('_', ' ')}
                </h4>
                <ResponderStatusBadge status={myResponse.status} />
              </div>
            </div>

            {/* Status Transition Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {['CONFIRMED_PRIMARY', 'CONFIRMED_BACKUP'].includes(myResponse.status) && (
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={isUpdating}
                  onClick={() => onUpdateStatus('EN_ROUTE')}
                  leftIcon={<Navigation className="w-3.5 h-3.5" />}
                >
                  Mark En Route
                </Button>
              )}

              {myResponse.status === 'EN_ROUTE' && (
                <Button
                  size="sm"
                  variant="success"
                  isLoading={isUpdating}
                  onClick={() => onUpdateStatus('ARRIVED')}
                  leftIcon={<Car className="w-3.5 h-3.5" />}
                >
                  Confirm Arrival
                </Button>
              )}

              {myResponse.status === 'ARRIVED' && (
                <Button
                  size="sm"
                  variant="success"
                  isLoading={isUpdating}
                  onClick={() => onUpdateStatus('DONATED')}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Mark Donated
                </Button>
              )}

              {myResponse.status !== 'DONATED' && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => setWithdrawModalOpen(true)}
                  className="text-red-600 hover:bg-red-50 border-red-200"
                  leftIcon={<UserX className="w-3.5 h-3.5" />}
                >
                  Withdraw
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Road Distance to Hospital: <strong className="text-slate-800">{formatDistance(myResponse.distanceMeters)}</strong> | Road ETA: <strong className="text-slate-800">{formatDuration(myResponse.etaSeconds)}</strong>
          </p>
        </div>
      )}

      {/* Confirmation Modal for Withdrawal */}
      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        title="Withdraw from Responder Pool?"
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setWithdrawModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isUpdating}
              onClick={handleConfirmWithdraw}
            >
              Confirm Withdrawal
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              Are you sure you need to withdraw?
            </p>
            <p className="text-xs text-slate-500">
              Withdrawing will immediately promote the closest ranked backup responder to Primary Donor so the patient is not delayed.
            </p>
          </div>
        </div>
      </Modal>

      {/* Primary Responders Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h4 className="text-base font-bold text-[#17212B]">
              Primary Donors ({primaryResponders.length})
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-medium">Ranked by road travel time</span>
        </div>

        {primaryResponders.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
            <p className="text-sm font-medium text-slate-600">No primary donors confirmed yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Emergency alerts have been broadcast to compatible donors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {primaryResponders.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-card transition-shadow space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                      #{item.poolRank}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-[#17212B]">
                        {item.responderId?.fullName || 'Volunteer Donor'}
                      </h5>
                      {item.responderId?.phone && (
                        <a
                          href={`tel:${item.responderId.phone}`}
                          className="text-xs text-slate-500 hover:text-blood-700 flex items-center gap-1 font-mono mt-0.5"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{item.responderId.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <BloodBadge bloodGroup={item.responderId?.bloodGroup} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Travel ETA</span>
                    <span className="font-bold text-[#17212B]">{formatDuration(item.etaSeconds)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Distance</span>
                    <span className="font-bold text-[#17212B]">{formatDistance(item.distanceMeters)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <ResponderStatusBadge status={item.status} size="sm" />
                  <span className="text-[11px] text-slate-400">
                    {item.responderId?.totalDonations || 0} prior donations
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backup Responders Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-[#17212B]">
              Backup Responders ({backupResponders.length})
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-medium">Auto-promotes if primary withdraws</span>
        </div>

        {backupResponders.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No backup responders queued yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {backupResponders.map((item) => (
              <div
                key={item._id}
                className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Rank #{item.poolRank}</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {item.responderId?.fullName || 'Volunteer Donor'}
                    </span>
                  </div>
                  <BloodBadge bloodGroup={item.responderId?.bloodGroup} size="sm" />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>ETA: <strong className="text-slate-700">{formatDuration(item.etaSeconds)}</strong> ({formatDistance(item.distanceMeters)})</span>
                  <ResponderStatusBadge status={item.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

