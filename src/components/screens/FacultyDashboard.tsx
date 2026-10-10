import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  QrCode, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Plus, 
  Download, 
  MapPin, 
  Sliders, 
  RefreshCw,
  Search,
  ChevronRight,
  UserCheck,
  Key,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { ClassSession } from '../../types';

export const FacultyDashboard: React.FC = () => {
  const { currentFaculty, setActiveScreen, setSelectedAttemptId } = useAuth();
  const [sessions, setSessions] = useState<ClassSession[]>(db.getSessions());
  const [activeSession, setActiveSession] = useState<ClassSession>(sessions[0]);
  const [students, setStudents] = useState(db.getStudents());
  
  const [showSessionWizard, setShowSessionWizard] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [facultyPassInput, setFacultyPassInput] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);

  const [qrCountdown, setQrCountdown] = useState(14);
  const [qrToken, setQrToken] = useState(activeSession?.qrCodeChallengeToken || 'VERITY-SESS-9938-X7K');
  const [filterState, setFilterState] = useState<'all' | 'present' | 'late' | 'review'>('all');
  const [studentSearch, setStudentSearch] = useState('');

  // Geofence Wizard state
  const [wizardSubject, setWizardSubject] = useState('CS401');
  const [wizardGeofence, setWizardGeofence] = useState(25);
  const [wizardLateThreshold, setWizardLateThreshold] = useState(10);

  // Sync DB sessions and students
  useEffect(() => {
    setSessions(db.getSessions());
    setStudents(db.getStudents());
  }, []);

  // Dynamic QR Code Countdown simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
          const newToken = `VERITY-SESS-${Math.floor(1000 + Math.random() * 9000)}-${randomSuffix}`;
          setQrToken(newToken);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleExportCSV = () => {
    db.exportSessionCSV(activeSession.id);
  };

  const handleLaunchSession = () => {
    const newSess = db.createSession({
      subjectCode: wizardSubject,
      subjectName: wizardSubject === 'CS401' ? 'Advanced AI Security' : wizardSubject === 'CS408' ? 'Distributed Systems' : 'Network Threat Intelligence',
      geofenceRadiusMeters: wizardGeofence,
      lateThresholdMinutes: wizardLateThreshold
    });
    setSessions(db.getSessions());
    setActiveSession(newSess);
    setQrToken(newSess.qrCodeChallengeToken);
    setShowSessionWizard(false);
  };

  const handleUpdateFacultyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyPassInput || facultyPassInput.length < 6) {
      setPasswordFeedback('Password must be at least 6 characters.');
      return;
    }
    db.updateFacultyPassword(currentFaculty.id, facultyPassInput);
    setPasswordFeedback('Password successfully updated in institutional database!');
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordFeedback(null);
      setFacultyPassInput('');
    }, 1200);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Faculty Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Faculty Class Console
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              FACULTY PORTAL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {currentFaculty.name} • {currentFaculty.department} ({currentFaculty.employeeId})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
            title="Change Account Password"
          >
            <Key className="w-4 h-4 text-amber-600" /> Change Password
          </button>

          <button
            onClick={() => setShowSessionWizard(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Start New Verification Session
          </button>
          
          {/* REAL CSV REPORT EXPORTER BUTTON */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-600" /> Export CSV Report
          </button>
        </div>
      </div>

      {/* Main Grid: Live QR Generator & Real-Time Counter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Rotating QR Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm flex flex-col items-center text-center">
          <div className="w-full flex items-center justify-between border-b border-slate-200 pb-3 text-xs">
            <span className="font-mono text-blue-700 font-bold">{activeSession.subjectCode}</span>
            <span className="flex items-center gap-1 text-green-700 font-mono font-bold text-[11px] bg-green-100 px-2 py-0.5 rounded border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-ping" /> LIVE SESSION
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900">{activeSession.subjectName}</h3>
          <p className="text-xs text-slate-500">{activeSession.classroomName} • Geofence Radius: {activeSession.geofenceRadiusMeters}m</p>

          {/* Visual QR Frame */}
          <div className="relative p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-md space-y-2 scanline max-w-[220px]">
            {/* SVG QR Code Simulation */}
            <svg viewBox="0 0 100 100" className="w-44 h-44 mx-auto fill-slate-900">
              <path d="M0,0 h30 v30 h-30 z M5,5 v20 h20 v-20 z M10,10 h10 v10 h-10 z" />
              <path d="M70,0 h30 v30 h-30 z M75,5 v20 h20 v-20 z M80,10 h10 v10 h-10 z" />
              <path d="M0,70 h30 v30 h-30 z M5,75 v20 h20 v-20 z M10,80 h10 v10 h-10 z" />
              <rect x="35" y="5" width="10" height="20" />
              <rect x="50" y="15" width="15" height="10" />
              <rect x="35" y="35" width="30" height="30" />
              <rect x="75" y="45" width="20" height="15" />
              <rect x="45" y="75" width="20" height="20" />
              <rect x="75" y="75" width="15" height="15" />
            </svg>
            <div className="bg-blue-50 text-blue-800 font-mono text-[10px] py-1 px-2 rounded border border-blue-200 truncate font-bold">
              {qrToken}
            </div>
          </div>

          {/* Expiry Countdown */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>Rotates in:</span>
            <span className="text-blue-700 font-bold text-sm bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {qrCountdown}s
            </span>
          </div>
        </div>

        {/* Real-time Attendance Statistics Counter */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Real-Time Class Telemetry</h3>
              <p className="text-xs text-slate-500">Live student check-ins for active session</p>
            </div>
            <div className="text-xs font-mono text-blue-700 font-bold bg-blue-50 px-3 py-1.5 rounded border border-blue-200">
              Session ID: {activeSession.id}
            </div>
          </div>

          {/* 4 Counter Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-50 border border-green-200 p-3 rounded-lg">
              <span className="text-xs text-slate-600 flex items-center justify-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Verified Present
              </span>
              <span className="text-2xl font-mono font-bold text-green-700 mt-1 block">
                {activeSession.stats.presentCount}
              </span>
            </div>

            <div className="bg-slate-50 border border-amber-200 p-3 rounded-lg">
              <span className="text-xs text-slate-600 flex items-center justify-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Late Arrival
              </span>
              <span className="text-2xl font-mono font-bold text-amber-700 mt-1 block">
                {activeSession.stats.lateCount}
              </span>
            </div>

            <div className="bg-slate-50 border border-purple-200 p-3 rounded-lg">
              <span className="text-xs text-slate-600 flex items-center justify-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-purple-600" /> Pending Review
              </span>
              <span className="text-2xl font-mono font-bold text-purple-700 mt-1 block">
                {activeSession.stats.pendingReviewCount}
              </span>
            </div>

            <div className="bg-slate-50 border border-red-200 p-3 rounded-lg">
              <span className="text-xs text-slate-600 flex items-center justify-center gap-1 font-medium">
                <XCircle className="w-3.5 h-3.5 text-red-600" /> Rejected
              </span>
              <span className="text-2xl font-mono font-bold text-red-700 mt-1 block">
                {activeSession.stats.rejectedCount}
              </span>
            </div>
          </div>

          {/* Student Roster Table Filter */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setFilterState('all')}
                  className={`px-2.5 py-1 rounded font-mono ${filterState === 'all' ? 'bg-blue-100 text-blue-800 font-bold border border-blue-300' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  All ({students.length})
                </button>
                <button
                  onClick={() => setFilterState('present')}
                  className={`px-2.5 py-1 rounded font-mono ${filterState === 'present' ? 'bg-green-100 text-green-800 font-bold border border-green-300' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Verified
                </button>
                <button
                  onClick={() => setFilterState('review')}
                  className={`px-2.5 py-1 rounded font-mono ${filterState === 'review' ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Needs Review
                </button>
              </div>

              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Filter student..."
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 pl-8 pr-2 py-1.5 rounded outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Roster List */}
            <div className="space-y-2">
              {students.filter(std => {
                const matchesSearch = !studentSearch || 
                  std.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                  std.rollNumber.toLowerCase().includes(studentSearch.toLowerCase());
                
                if (filterState === 'present') {
                  return matchesSearch && std.id !== 'std_3';
                } else if (filterState === 'review') {
                  return matchesSearch && std.id === 'std_3';
                }
                return matchesSearch;
              }).map((std) => (
                <div key={std.id} className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={std.avatarUrl} alt={std.name} className="w-8 h-8 rounded-full border border-blue-300 object-cover" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{std.name}</span>
                        <span className="font-mono text-blue-700 text-[11px] font-semibold">{std.rollNumber}</span>
                        {std.enrolledFaceTemplate && (
                          <span className="text-[10px] text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded border border-blue-200 font-bold">
                            FACE ENROLLED
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">{std.registeredDevice}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    {std.id === 'std_3' ? (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold">
                        REVIEW NEEDED (42m)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-200 text-[10px] font-bold">
                        VERIFIED 10:04 AM
                      </span>
                    )}

                    {std.id === 'std_3' && (
                      <button
                        onClick={() => {
                          setSelectedAttemptId('VATT-2026-981');
                          setActiveScreen('investigation-center');
                        }}
                        className="text-amber-700 hover:underline text-[11px] font-bold"
                      >
                        Inspect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Session Creation Wizard Modal */}
      {showSessionWizard && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" /> Configure & Launch Class Session
              </h3>
              <button onClick={() => setShowSessionWizard(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subject & Course Code</label>
                <select
                  value={wizardSubject}
                  onChange={(e) => setWizardSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-900 outline-none focus:border-blue-600"
                >
                  <option value="CS401">CS401: Advanced AI & Biometric Security</option>
                  <option value="CS408">CS408: Distributed Systems & Cryptography</option>
                  <option value="CS412">CS412: Network Threat Intelligence</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Classroom Location</label>
                <input
                  type="text"
                  value="Cyber Security Research Lab 302 (Building A)"
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 p-2.5 rounded-lg text-slate-500 font-medium"
                />
              </div>

              {/* Geofence Radius Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">Geofence Boundary Radius</label>
                  <span className="font-mono text-blue-700 font-bold">{wizardGeofence} meters</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={wizardGeofence}
                  onChange={(e) => setWizardGeofence(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <p className="text-[10px] text-slate-500 mt-1">Students outside {wizardGeofence}m radius will trigger Review Needed.</p>
              </div>

              {/* Late Threshold Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">Late Arrival Cutoff Threshold</label>
                  <span className="font-mono text-amber-700 font-bold">{wizardLateThreshold} minutes</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={wizardLateThreshold}
                  onChange={(e) => setWizardLateThreshold(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button onClick={() => setShowSessionWizard(false)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200">Cancel</button>
              <button
                onClick={handleLaunchSession}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
              >
                Launch Active QR Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Change Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Change Faculty Password</h3>
                <p className="text-[10px] text-slate-500 font-mono">{currentFaculty.employeeId} • {currentFaculty.email}</p>
              </div>
            </div>

            {passwordFeedback && (
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium">
                {passwordFeedback}
              </div>
            )}

            <form onSubmit={handleUpdateFacultyPassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    value={facultyPassInput}
                    onChange={(e) => setFacultyPassInput(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded text-slate-900 outline-none focus:border-indigo-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setPasswordFeedback(null); }}
                  className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-indigo-600 text-white font-bold text-xs shadow-sm hover:bg-indigo-700 flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" /> Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
