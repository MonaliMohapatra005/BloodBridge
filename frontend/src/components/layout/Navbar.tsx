import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket, useSocketConnected } from '../../sockets/useSocket';
import { BloodBadge } from '../ui/BloodBadge';
import {
  Activity,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Droplet,
  PlusCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const { user, logout, updateReadiness } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isUpdatingReadiness, setIsUpdatingReadiness] = useState(false);

  const isConnected = useSocketConnected();

  const handleToggleAvailability = async () => {
    if (!user) return;
    try {
      setIsUpdatingReadiness(true);
      await updateReadiness({ isAvailableToDonate: !user.isAvailableToDonate });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingReadiness(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-blood-700 flex items-center justify-center text-white shadow-md shadow-blood-700/25 group-hover:bg-blood-800 transition-colors">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-[#17212B] flex items-center gap-1.5">
                  Blood<span className="text-blood-700">Bridge</span>
                </span>
                <span className="text-[10px] tracking-wider font-semibold uppercase text-slate-400 -mt-1 hidden sm:block">
                  Emergency Network
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Actions, Blood Group, Availability & User */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Real-time Socket Status */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={isConnected ? 'Real-time telemetry active' : 'Reconnecting to network'}
            >
              {isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden md:inline">Live Sync</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  <span className="hidden md:inline">Connecting</span>
                </>
              )}
            </div>

            {/* Quick Broadcast Button */}
            <Link
              to="/requests/create"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blood-700 hover:bg-blood-800 shadow-sm shadow-blood-700/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Broadcast Need</span>
            </Link>

            {/* User Blood Group Badge */}
            {user?.bloodGroup && (
              <BloodBadge bloodGroup={user.bloodGroup} size="sm" className="hidden xs:inline-flex" />
            )}

            {/* Donor Readiness Quick Toggle */}
            {user && (
              <button
                type="button"
                onClick={handleToggleAvailability}
                disabled={isUpdatingReadiness}
                className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  user.isAvailableToDonate
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70'
                }`}
                title="Click to toggle donor emergency readiness"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    user.isAvailableToDonate ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-400'
                  }`}
                />
                <span className="hidden md:inline">
                  {user.isAvailableToDonate ? 'Ready to Donate' : 'Unavailable'}
                </span>
              </button>
            )}

            {/* User Profile Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-xl bg-navy-900 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#17212B] leading-tight">
                    {user?.fullName}
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    {user?.phone}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-[#17212B]">{user?.fullName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{user?.phone}</p>
                      {user?.email && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">Group:</span>
                        <span className="text-xs font-bold text-blood-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                          {user?.bloodGroup}
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/donors/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#17212B] hover:bg-slate-50 transition-colors"
                    >
                      <Activity className="w-4 h-4 text-slate-500" />
                      <span>Donor Readiness</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#17212B] hover:bg-slate-50 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      <span>Account Settings</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

