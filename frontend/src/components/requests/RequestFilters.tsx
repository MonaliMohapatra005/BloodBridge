import React from 'react';
import { RequestStatus } from '../../types/request.types';
import { Search, Filter, CheckCircle2, User } from 'lucide-react';

interface RequestFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  mineFilter: boolean;
  onMineChange: (mine: boolean) => void;
  compatibleOnlyFilter: boolean;
  onCompatibleOnlyChange: (val: boolean) => void;
  myBloodGroup?: string;
}

export const RequestFilters: React.FC<RequestFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  mineFilter,
  onMineChange,
  compatibleOnlyFilter,
  onCompatibleOnlyChange,
  myBloodGroup,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-card space-y-4">
      {/* Search Input & Mine Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by patient name, hospital or address..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blood-100 focus:border-blood-700 transition-colors"
          />
        </div>

        {/* Toggle Filters */}
        <div className="flex items-center gap-2">
          {/* Mine Toggle */}
          <button
            type="button"
            onClick={() => onMineChange(!mineFilter)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              mineFilter
                ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Requests</span>
          </button>

          {/* Compatible Only Toggle */}
          <button
            type="button"
            onClick={() => onCompatibleOnlyChange(!compatibleOnlyFilter)}
            disabled={mineFilter}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-40 disabled:pointer-events-none ${
              compatibleOnlyFilter
                ? 'bg-blood-700 text-white border-blood-700 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Compatible ({myBloodGroup || 'You'})</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-3">
        <span className="text-slate-400 flex items-center gap-1 mr-2 shrink-0 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Status:</span>
        </span>

        {[
          { label: 'Active Broadcasts', value: '' },
          { label: 'Broadcasting', value: 'BROADCASTING' },
          { label: 'Responders Pooling', value: 'RESPONDERS_POOLING' },
          { label: 'Fulfilled', value: 'FULFILLED' },
          { label: 'Cancelled', value: 'CANCELLED' },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onStatusChange(tab.value)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

