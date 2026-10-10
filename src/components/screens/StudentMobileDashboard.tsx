import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  MapPin, 
  ArrowRight, 
  Calendar,
  Sparkles,
  ChevronRight,
  BarChart3,
  QrCode,
  UserPlus,
  Key,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { FaceRegistrationModal } from '../common/FaceRegistrationModal';
import { QRScannerModal } from '../common/QRScannerModal';

export const StudentMobileDashboard: React.FC = () => {
  const { currentStudent, setCurrentStudent, setActiveScreen } = useAuth();
  const [student, setStudent] = useState(db.getStudentById(currentStudent.id) || currentStudent);
  
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState('VERITY-SESS-9938-X7K');

  const handleChangeStudentPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.length < 6) {
      setPasswordNotice('Password must be at least 6 characters.');
      return;
    }
    db.updateStudentPassword(student.id, newPasswordInput);
    const refreshed = db.getStudentById(student.id);
    if (refreshed) setStudent(refreshed);
    setPasswordNotice('Password successfully updated in institutional database!');
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordNotice(null);
      setNewPasswordInput('');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 max-w-md mx-auto sm:max-w-xl sm:p-4">
      {/* Mobile Top App Bar */}
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={student.avatarUrl}
            alt={student.name}
            className="w-10 h-10 rounded-full border-2 border-blue-600 object-cover shadow-sm"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-900">{student.name}</h2>
              <span className="w-2 h-2 rounded-full bg-green-600" />
            </div>
            <p className="text-[11px] font-mono text-blue-700 font-bold">{student.rollNumber} • Sem {student.semester}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-blue-600 hover:bg-slate-200"
            title="Change Account Password"
          >
            <Key className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowFaceModal(true)}
            className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-blue-600 hover:bg-slate-200"
            title="Register Face"
          >
            <UserPlus className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setActiveScreen('student-history')}
            className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
            title="View Attendance History"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-4 space-y-6">
        {/* Enrolment Guard Banner (if not enrolled) */}
        {!student.enrolledFaceTemplate && (
          <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl flex items-center justify-between text-xs text-amber-900">
            <span className="font-medium">Face Profile Not Enrolled! Register face before check-in.</span>
            <button onClick={() => setShowFaceModal(true)} className="px-2.5 py-1 rounded bg-amber-600 text-white font-bold font-mono text-[11px]">
              Enrol Now
            </button>
          </div>
        )}

        {/* Overall Attendance Radial Score Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-bold">
              OVERALL ATTENDANCE RATE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-green-100 text-green-800 border border-green-200 font-bold">
              GOOD STANDING
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-extrabold font-mono text-slate-900 tracking-tight">
                {student.overallAttendancePct}%
              </div>
              <p className="text-xs text-slate-500 mt-1">34 of 36 required sessions completed</p>
            </div>

            {/* Circular Gauge visual */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#2563EB"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray="201"
                  strokeDashoffset={201 - (201 * student.overallAttendancePct) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <ShieldCheck className="w-6 h-6 text-blue-600 absolute" />
            </div>
          </div>
        </div>

        {/* Action Buttons: Scan QR & Verify Attendance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setShowQrModal(true)}
            className="py-3.5 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-blue-700 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 font-mono"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            Scan Session QR Code
          </button>

          <button
            onClick={() => setActiveScreen('verification-experience')}
            className="py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            Verify Attendance Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Today's Schedule & Classes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <h3 className="font-bold text-slate-900">Today's Class Schedule</h3>
            <span className="text-slate-500 font-mono">Sat, Oct 10</span>
          </div>

          <div className="bg-white border border-slate-200 hover:border-blue-400 p-4 rounded-xl space-y-2 transition-all shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-blue-700 font-bold">CS401</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-green-100 text-green-800 border border-green-200 font-mono font-bold">
                ACTIVE NOW
              </span>
            </div>

            <h4 className="text-xs font-bold text-slate-900">Advanced AI & Biometric Security</h4>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" /> Lab 302 • Dr. Rajesh Kumar
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showFaceModal && (
        <FaceRegistrationModal
          student={student}
          onClose={() => setShowFaceModal(false)}
          onSuccess={(updated) => {
            setStudent(updated);
            setCurrentStudent(updated);
          }}
        />
      )}

      {showQrModal && (
        <QRScannerModal
          onClose={() => setShowQrModal(false)}
          onSessionSelected={(sess, token) => {
            setActiveToken(token);
            setActiveScreen('verification-experience');
          }}
        />
      )}

      {/* Modal: Change Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Change Account Password</h3>
                <p className="text-[10px] text-slate-500 font-mono">{student.rollNumber} • {student.email}</p>
              </div>
            </div>

            {passwordNotice && (
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium">
                {passwordNotice}
              </div>
            )}

            <form onSubmit={handleChangeStudentPassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setPasswordNotice(null); }}
                  className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" /> Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accessible Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2 flex items-center justify-around z-40 max-w-md mx-auto sm:max-w-xl shadow-lg">
        <button
          onClick={() => setActiveScreen('student-dashboard')}
          className="flex flex-col items-center gap-1 text-blue-600 text-[10px] font-mono font-bold"
        >
          <User className="w-4 h-4" /> Home
        </button>
        <button
          onClick={() => setActiveScreen('verification-experience')}
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 text-[10px] font-mono"
        >
          <ShieldCheck className="w-4 h-4 text-blue-600" /> Verify
        </button>
        <button
          onClick={() => setActiveScreen('student-history')}
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 text-[10px] font-mono"
        >
          <BarChart3 className="w-4 h-4" /> History
        </button>
      </nav>
    </div>
  );
};
