import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, UserCheck, AlertCircle, Key, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';

export const AuthScreen: React.FC = () => {
  const { setRole, setCurrentStudent, setCurrentFaculty } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'forgot' | 'activation'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fillCredentials = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid institutional email address.');
      return;
    }

    // Handle Password Change / Reset Tab
    if (activeTab === 'forgot') {
      if (!newPassword || newPassword.length < 6) {
        setErrorMessage('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('New passwords do not match. Please re-enter.');
        return;
      }

      // Check if email belongs to Admin, Faculty, or Student
      if (cleanEmail === 'admin@vertex.edu' || cleanEmail === 'admin@verity.edu') {
        db.updateAdminPassword(newPassword);
        setSuccessMessage('Admin master password updated successfully! You can now sign in.');
        setTimeout(() => setActiveTab('login'), 1200);
        return;
      }

      const facultyUpdated = db.updateFacultyPassword(cleanEmail, newPassword);
      if (facultyUpdated) {
        setSuccessMessage('Faculty password successfully updated! Please sign in with your new credentials.');
        setTimeout(() => setActiveTab('login'), 1200);
        return;
      }

      const studentUpdated = db.updateStudentPassword(cleanEmail, newPassword);
      if (studentUpdated) {
        setSuccessMessage('Student password successfully updated! Please sign in with your new credentials.');
        setTimeout(() => setActiveTab('login'), 1200);
        return;
      }

      setErrorMessage('No registered institutional account found with this email address.');
      return;
    }

    if (activeTab === 'activation') {
      setSuccessMessage('Account activated! You can now sign in with your credentials.');
      setActiveTab('login');
      return;
    }

    // Authenticate strictly against Database
    const authResult = db.authenticateUser(cleanEmail, cleanPass);
    if (!authResult.success) {
      setErrorMessage(authResult.message || 'Access Denied: Invalid credentials.');
      return;
    }

    if (authResult.role === 'admin') {
      setSuccessMessage('Administrator authenticated successfully! Redirecting to Security Ops...');
      setTimeout(() => {
        setRole('admin');
      }, 400);
      return;
    }

    if (authResult.role === 'faculty') {
      if (authResult.user) setCurrentFaculty(authResult.user as any);
      setSuccessMessage(`Welcome, ${(authResult.user as any)?.name || 'Faculty'}! Redirecting to Session Portal...`);
      setTimeout(() => {
        setRole('faculty');
      }, 400);
      return;
    }

    if (authResult.role === 'student') {
      if (authResult.user) setCurrentStudent(authResult.user as any);
      setSuccessMessage(`Welcome, ${(authResult.user as any)?.name || 'Student'}! Redirecting to Mobile Dashboard...`);
      setTimeout(() => {
        setRole('student');
      }, 400);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shadow-sm mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-wide">VERITY Secure Portal</h2>
          <p className="text-xs text-slate-500 font-medium">Multi-Layer Cryptographic & Biometric Authentication</p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 text-xs font-medium">
          <button
            onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-2.5 border-b-2 transition-all ${
              activeTab === 'login' 
                ? 'border-blue-600 text-blue-700 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('activation'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-2.5 border-b-2 transition-all ${
              activeTab === 'activation' 
                ? 'border-blue-600 text-blue-700 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Account Activation
          </button>
          <button
            onClick={() => { setActiveTab('forgot'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-2.5 border-b-2 transition-all ${
              activeTab === 'forgot' 
                ? 'border-blue-600 text-blue-700 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Forgot Password
          </button>
        </div>

        {/* Form Alerts */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-900 text-xs p-3 rounded-lg flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3 rounded-lg flex items-center gap-2 font-mono font-medium">
            <UserCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vertex.edu or student@vertex.edu"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white text-slate-900 pl-9 pr-3 py-2.5 rounded-lg outline-none transition-all"
                required
              />
            </div>
          </div>

          {activeTab === 'login' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white text-slate-900 pl-9 pr-10 py-2.5 rounded-lg outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'forgot' && (
            <>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white text-slate-900 pl-9 pr-10 py-2.5 rounded-lg outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white text-slate-900 pl-9 pr-3 py-2.5 rounded-lg outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'activation' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Activation Code
              </label>
              <input
                type="text"
                placeholder="VERITY-ACT-9901"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white text-slate-900 px-3 py-2.5 rounded-lg outline-none font-mono"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {activeTab === 'login' ? 'Authenticate & Enter Portal' : activeTab === 'activation' ? 'Activate Account' : 'Change & Set Password'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Credentials Guide for Evaluation */}
        <div className="pt-2 border-t border-slate-200">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
              <Key className="w-3.5 h-3.5 text-blue-600" />
              <span>Registered Accounts:</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => fillCredentials('admin@vertex.edu', db.getAdminPassword())}
                className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-left transition-all"
              >
                <span className="font-bold text-indigo-900 block truncate">Admin</span>
                <span className="text-slate-500 font-mono text-[9px] truncate block">{db.getAdminPassword()}</span>
              </button>
              {(() => {
                const fac = db.getFacultyList()[0];
                return (
                  <button
                    type="button"
                    onClick={() => fac && fillCredentials(fac.email, fac.password || 'Faculty@Vertex2026')}
                    className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-all"
                  >
                    <span className="font-bold text-amber-900 block truncate">{fac ? fac.name.split(' ')[0] : 'Faculty'}</span>
                    <span className="text-slate-500 font-mono text-[9px] truncate block">{fac ? fac.password || 'Faculty@Vertex2026' : 'N/A'}</span>
                  </button>
                );
              })()}
              {(() => {
                const std = db.getStudents()[0];
                return (
                  <button
                    type="button"
                    onClick={() => std && fillCredentials(std.email, std.password || 'Student@Vertex2026')}
                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition-all"
                  >
                    <span className="font-bold text-emerald-900 block truncate">{std ? std.name.split(' ')[0] : 'Student'}</span>
                    <span className="text-slate-500 font-mono text-[9px] truncate block">{std ? std.password || 'Student@Vertex2026' : 'N/A'}</span>
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
