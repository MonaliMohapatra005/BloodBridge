import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  PlusCircle,
  HeartHandshake,
  Settings,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Main Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/requests',
      label: 'Blood Requests',
      icon: Radio,
      badge: 'Live',
    },
    {
      to: '/requests/create',
      label: 'Create Request',
      icon: PlusCircle,
    },
    {
      to: '/donors/profile',
      label: 'Donor Readiness',
      icon: HeartHandshake,
    },
    {
      to: '/profile',
      label: 'Settings & Profile',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-blood-50 text-blood-700 font-semibold shadow-sm shadow-blood-700/5'
                      : 'text-[#17212B] hover:bg-slate-50 hover:text-blood-700'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'w-4 h-4 transition-colors',
                          isActive
                            ? 'text-blood-700'
                            : 'text-slate-400 group-hover:text-blood-700'
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-blood-700 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Emergency Hotline / Assistance Card at bottom */}
      <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-navy-900 to-slate-900 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2 text-blood-300">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Emergency Protocol</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          BloodBridge coordinates directly with compatible donors within minutes. Every second counts.
        </p>
        <NavLink
          to="/requests/create"
          onClick={onCloseMobile}
          className="inline-flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold bg-blood-700 hover:bg-blood-600 text-white transition-colors"
        >
          <span>Broadcast Now</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </NavLink>
      </div>
    </aside>
  );
};

