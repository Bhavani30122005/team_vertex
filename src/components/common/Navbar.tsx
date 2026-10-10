import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  Bell, 
  User, 
  Lock, 
  LogOut,
  Layers, 
  ChevronDown,
  Sparkles,
  Eye,
  BarChart2,
  AlertOctagon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { 
    role, 
    setRole, 
    logout,
    activeScreen, 
    setActiveScreen, 
    notificationsCount, 
    searchQuery, 
    setSearchQuery,
    currentStudent,
    currentFaculty
  } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Tagline */}
        <div 
          onClick={() => setActiveScreen('landing')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600 p-0.5 shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-all flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-wider font-mono">VERITY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight">Presence, Proven.</p>
          </div>
        </div>

        {/* Global Search Bar (for dashboard roles) */}
        {role !== 'public' && (
          <div className="hidden md:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, session, attempt ID..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white text-xs text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 rounded-lg outline-none transition-all shadow-inner"
            />
          </div>
        )}

        {/* Navigation Quick Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
          <button
            onClick={() => setActiveScreen('landing')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeScreen === 'landing' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          
          <button
            onClick={() => setActiveScreen('verification-experience')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              activeScreen === 'verification-experience' 
                ? 'text-blue-600 bg-blue-50 font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            Live Verification Check
          </button>

          <button
            onClick={() => setActiveScreen('investigation-center')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              activeScreen === 'investigation-center' 
                ? 'text-amber-700 bg-amber-50 font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
            Security Center
          </button>

          <button
            onClick={() => setActiveScreen('analytics')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              activeScreen === 'analytics' 
                ? 'text-blue-700 bg-blue-50 font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
            Analytics
          </button>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {role === 'public' ? (
            <button
              onClick={() => setActiveScreen('auth')}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" /> Platform Login
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button 
                onClick={() => setActiveScreen('investigation-center')}
                className="relative p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors"
                title="Notifications & Alerts"
              >
                <Bell className="w-4 h-4" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[10px] text-white font-mono font-bold flex items-center justify-center">
                    {notificationsCount}
                  </span>
                )}
              </button>

              {/* User Profile Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  src={role === 'faculty' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' : currentStudent.avatarUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-blue-300 object-cover"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">
                    {role === 'faculty' ? currentFaculty.name : role === 'student' ? currentStudent.name : 'System Admin'}
                  </p>
                  <p className="text-[10px] text-blue-600 font-mono font-bold">
                    {role.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 text-slate-700 text-xs font-medium transition-all flex items-center gap-1.5 ml-1"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
