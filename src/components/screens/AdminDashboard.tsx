import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  ShieldCheck, 
  ChevronRight, 
  Trash2, 
  TrendingUp, 
  Calendar,
  RotateCcw,
  Search,
  UserPlus,
  Mail,
  UserCheck,
  Building,
  Key,
  Lock,
  Camera
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TrustPulse } from '../common/TrustPulse';
import { db } from '../../services/db';
import { Student, Faculty } from '../../types';
import { mockRiskEvents, mockSessions } from '../../data/mockData';
import { FaceRegistrationModal } from '../common/FaceRegistrationModal';

export const AdminDashboard: React.FC = () => {
  const { setActiveScreen, setSelectedAttemptId } = useAuth();
  
  // Dynamic State synchronized with db
  const [students, setStudents] = useState<Student[]>(db.getStudents());
  const [facultyList, setFacultyList] = useState<Faculty[]>(db.getFacultyList());
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'faculty'>('overview');

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [faceModalStudent, setFaceModalStudent] = useState<Student | null>(null);
  const [passwordModalUser, setPasswordModalUser] = useState<{ type: 'student' | 'faculty'; id: string; name: string; email: string } | null>(null);
  const [editPasswordValue, setEditPasswordValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentDept, setNewStudentDept] = useState('Computer Science & Security');
  const [newStudentPassword, setNewStudentPassword] = useState('Student@Vertex2026');

  // Add Faculty Form State
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyEmpId, setNewFacultyEmpId] = useState('');
  const [newFacultyEmail, setNewFacultyEmail] = useState('');
  const [newFacultyDept, setNewFacultyDept] = useState('Computer Science & Engineering');
  const [newFacultyDesignation, setNewFacultyDesignation] = useState('Assistant Professor');
  const [newFacultyPassword, setNewFacultyPassword] = useState('Faculty@Vertex2026');

  // Action status message
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'danger' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Student Handlers
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentRoll || !newStudentEmail) return;

    const added = db.addStudent({
      name: newStudentName,
      rollNumber: newStudentRoll,
      email: newStudentEmail,
      password: newStudentPassword || 'Student@Vertex2026',
      department: newStudentDept,
      semester: 6,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
    });

    setStudents(db.getStudents());
    setShowAddStudentModal(false);
    setNewStudentName('');
    setNewStudentRoll('');
    setNewStudentEmail('');
    setNewStudentPassword('Student@Vertex2026');
    showNotification(`Student ${added.name} successfully enrolled! Credentials active.`);
  };

  const handleRemoveStudent = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove student "${name}"? This removes their biometric records and revokes sign-in access.`)) {
      db.removeStudent(id);
      setStudents(db.getStudents());
      showNotification(`Student "${name}" removed from institution.`, 'danger');
    }
  };

  // Faculty Handlers
  const handleAddFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacultyName || !newFacultyEmpId || !newFacultyEmail) return;

    const added = db.addFaculty({
      name: newFacultyName,
      employeeId: newFacultyEmpId,
      email: newFacultyEmail,
      password: newFacultyPassword || 'Faculty@Vertex2026',
      department: newFacultyDept,
      designation: newFacultyDesignation
    });

    setFacultyList(db.getFacultyList());
    setShowAddFacultyModal(false);
    setNewFacultyName('');
    setNewFacultyEmpId('');
    setNewFacultyEmail('');
    setNewFacultyPassword('Faculty@Vertex2026');
    showNotification(`Faculty ${added.name} registered successfully! Credentials active.`);
  };

  const handleRemoveFaculty = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove faculty member "${name}"? This revokes sign-in access.`)) {
      db.removeFaculty(id);
      setFacultyList(db.getFacultyList());
      showNotification(`Faculty member "${name}" removed.`, 'danger');
    }
  };

  const handleSaveUserPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !editPasswordValue) return;
    if (editPasswordValue.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    if (passwordModalUser.type === 'student') {
      db.updateStudentPassword(passwordModalUser.id, editPasswordValue);
      setStudents(db.getStudents());
      showNotification(`Password successfully updated for student "${passwordModalUser.name}".`);
    } else {
      db.updateFacultyPassword(passwordModalUser.id, editPasswordValue);
      setFacultyList(db.getFacultyList());
      showNotification(`Password successfully updated for faculty member "${passwordModalUser.name}".`);
    }
    setPasswordModalUser(null);
    setEditPasswordValue('');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all institutional database records to default state?')) {
      db.resetDatabase();
      setStudents(db.getStudents());
      setFacultyList(db.getFacultyList());
      showNotification('Database successfully reset to clean institutional state!');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFaculty = facultyList.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Institutional Security Ops
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
              ADMIN CONTROL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global attendance telemetry, anti-fraud risk queue, and institutional identity management
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Enrol Student
          </button>
          <button
            onClick={() => setShowAddFacultyModal(true)}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" /> Add Faculty
          </button>
          <button
            onClick={handleResetData}
            title="Reset Database to clean state"
            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" /> Reset Data
          </button>
        </div>
      </div>

      {/* Status Notification Toast */}
      {statusMsg && (
        <div className={`p-3 rounded-lg text-xs font-medium border flex items-center gap-2 ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Top Metric Cards (Live dynamic counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab('students')}
          className="bg-white border border-slate-200 hover:border-blue-300 p-4 rounded-xl space-y-2 shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900">{students.length}</div>
          <div className="text-[11px] text-blue-600 font-mono font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Click to Manage Roster
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('faculty')}
          className="bg-white border border-slate-200 hover:border-indigo-300 p-4 rounded-xl space-y-2 shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Active Faculty</span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900">{facultyList.length}</div>
          <div className="text-[11px] text-indigo-600 font-mono font-semibold">Click to Manage Faculty</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Active Live Sessions</span>
            <Activity className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900">{mockSessions.length}</div>
          <div className="text-[11px] text-green-700 font-mono font-semibold">Dynamic QR active</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Security Trust Level</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-700">97.4%</div>
          <div className="text-[11px] text-slate-500 font-mono">Biometric multi-layer</div>
        </div>
      </div>

      {/* Management Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" /> Telemetry & Risk Queue
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'students'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Student Management ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('faculty')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'faculty'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Faculty Management ({facultyList.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & RISK QUEUE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <TrustPulse />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Events Needing Review */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-slate-900 text-base">Unresolved Risk Events Queue</h3>
                </div>
                <button
                  onClick={() => setActiveScreen('investigation-center')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-mono font-semibold flex items-center gap-1"
                >
                  Open Security Center <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {mockRiskEvents.map((risk) => (
                  <div
                    key={risk.id}
                    className="bg-slate-50 border border-slate-200 hover:border-amber-400 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-blue-700 font-bold">{risk.studentRoll}</span>
                        <span className="text-slate-900 font-semibold">{risk.studentName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 font-bold">
                          RISK SCORE: {risk.riskScore}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">{risk.primaryFlag}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{risk.subjectName} • {risk.timestamp}</p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedAttemptId(risk.attemptId);
                        setActiveScreen('investigation-center');
                      }}
                      className="px-3 py-1.5 rounded bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 text-xs font-mono font-bold self-start sm:self-center transition-all"
                    >
                      Investigate
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Active Sessions List */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">Active Class Sessions</h3>
                </div>
              </div>

              <div className="space-y-3">
                {mockSessions.map((sess) => (
                  <div key={sess.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-blue-700 font-bold">{sess.subjectCode}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-green-100 text-green-800 border border-green-200 font-mono font-bold">
                        LIVE NOW
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{sess.subjectName}</h4>
                    <p className="text-[11px] text-slate-500">{sess.classroomName} • {sess.facultyName}</p>
                    
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
                      <span>Present: <strong className="text-green-700">{sess.stats.presentCount}</strong>/{sess.stats.totalEnrolled}</span>
                      <span>Review: <strong className="text-amber-700">{sess.stats.pendingReviewCount}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT MANAGEMENT (ADD / REMOVE STUDENTS) */}
      {activeTab === 'students' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Enrolled Students Roster</h3>
              <p className="text-xs text-slate-500">Manage institutional biometric profiles, enroll new students, or purge records</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student name or roll..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-900 pl-9 pr-3 py-2 rounded-lg outline-none focus:border-blue-600 focus:bg-white w-64"
                />
              </div>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Enrol New Student
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Biometric Status</th>
                  <th className="py-3 px-4">Trust Score</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img src={st.avatarUrl} alt={st.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                      <div>
                        <div className="font-bold text-slate-900">{st.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{st.email}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-700">{st.rollNumber}</td>
                    <td className="py-3.5 px-4 text-slate-600">{st.department}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-green-100 text-green-800 border border-green-200">
                        128-D ENROLLED
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{st.trustScore}/100</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setFaceModalStudent(st)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium text-xs transition-colors inline-flex items-center gap-1"
                          title="Register or update facial biometrics"
                        >
                          <Camera className="w-3.5 h-3.5" /> Face
                        </button>
                        <button
                          onClick={() => {
                            setPasswordModalUser({ type: 'student', id: st.id, name: st.name, email: st.email });
                            setEditPasswordValue(st.password || 'Student@Vertex2026');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium text-xs transition-colors inline-flex items-center gap-1"
                          title="Change or reset student password"
                        >
                          <Key className="w-3.5 h-3.5" /> Password
                        </button>
                        <button
                          onClick={() => handleRemoveStudent(st.id, st.name)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-medium text-xs transition-colors inline-flex items-center gap-1"
                          title="Remove student from institution"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No students found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FACULTY MANAGEMENT (ADD / REMOVE FACULTY) */}
      {activeTab === 'faculty' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Institutional Faculty Directory</h3>
              <p className="text-xs text-slate-500">Add or revoke instructors with session creation and QR verification permissions</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search faculty name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-900 pl-9 pr-3 py-2 rounded-lg outline-none focus:border-blue-600 focus:bg-white w-64"
                />
              </div>
              <button
                onClick={() => setShowAddFacultyModal(true)}
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> Add Faculty Member
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFaculty.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center font-mono">
                        {fac.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{fac.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{fac.email}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-indigo-700">{fac.employeeId}</td>
                    <td className="py-3.5 px-4 text-slate-600">{fac.department}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">{fac.designation}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setPasswordModalUser({ type: 'faculty', id: fac.id, name: fac.name, email: fac.email });
                            setEditPasswordValue(fac.password || 'Faculty@Vertex2026');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium text-xs transition-colors inline-flex items-center gap-1"
                          title="Change or reset faculty password"
                        >
                          <Key className="w-3.5 h-3.5" /> Password
                        </button>
                        <button
                          onClick={() => handleRemoveFaculty(fac.id, fac.name)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-medium text-xs transition-colors inline-flex items-center gap-1"
                          title="Remove faculty from institution"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredFaculty.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">
                      No faculty found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Enrol Student */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Enrol New Student</h3>
            <p className="text-xs text-slate-500">Register student details to generate 128-D biometric enrollment record</p>
            
            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Student Name</label>
                <input 
                  type="text" 
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Rahul Verma" 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-slate-900 outline-none focus:border-blue-600 focus:bg-white" 
                  required 
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Roll Number</label>
                <input 
                  type="text" 
                  value={newStudentRoll}
                  onChange={(e) => setNewStudentRoll(e.target.value)}
                  placeholder="e.g. 2026-CS-205" 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-slate-900 outline-none focus:border-blue-600 focus:bg-white font-mono" 
                  required 
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Institutional Email</label>
                <input 
                  type="email" 
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="e.g. rahul.v@vertex.edu" 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-slate-900 outline-none focus:border-blue-600 focus:bg-white" 
                  required 
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Initial Password</label>
                <input 
                  type="text" 
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  placeholder="Student@Vertex2026" 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-slate-900 outline-none focus:border-blue-600 focus:bg-white font-mono" 
                  required 
                />
                <p className="text-[10px] text-slate-500 mt-0.5">Required for student to authenticate into VERITY Mobile portal</p>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department</label>
                <input 
                  type="text" 
                  value={newStudentDept}
                  onChange={(e) => setNewStudentDept(e.target.value)}
                  placeholder="Department" 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-slate-900 outline-none focus:border-blue-600 focus:bg-white" 
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddStudentModal(false)} 
                  className="px-4 py-2 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700"
                >
                  Confirm Enrolment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Faculty */}
      {showAddFacultyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Add Faculty Member</h3>
            <p className="text-xs text-slate-500">Authorize academic staff member with session creation credentials</p>
            
            <form onSubmit={handleAddFaculty} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Faculty Name</label>
                <input 
                  type="text" 
                  value={newFacultyName}
                  onChange={(e) => setNewFacultyName(e.target.value)}
                  placeholder="e.g. Dr. Preeti Deshmukh" 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-slate-900 outline-none focus:border-indigo-600 focus:bg-white" 
                  required 
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Employee ID</label>
                <input 
                  type="text" 
                  value={newFacultyEmpId}
                  onChange={(e) => setNewFacultyEmpId(e.target.value)}
                  placeholder="e.g. EMP-FAC-940" 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-slate-900 outline-none focus:border-indigo-600 focus:bg-white font-mono" 
                  required 
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Institutional Email</label>
                <input 
                  type="email" 
                  value={newFacultyEmail}
                  onChange={(e) => setNewFacultyEmail(e.target.value)}
                  placeholder="e.g. preeti.d@vertex.edu" 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-slate-900 outline-none focus:border-indigo-600 focus:bg-white" 
                  required 
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Initial Password</label>
                <input 
                  type="text" 
                  value={newFacultyPassword}
                  onChange={(e) => setNewFacultyPassword(e.target.value)}
                  placeholder="Faculty@Vertex2026" 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-slate-900 outline-none focus:border-indigo-600 focus:bg-white font-mono" 
                  required 
                />
                <p className="text-[10px] text-slate-500 mt-0.5">Required for instructor to authenticate into Faculty portal</p>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Designation</label>
                <input 
                  type="text" 
                  value={newFacultyDesignation}
                  onChange={(e) => setNewFacultyDesignation(e.target.value)}
                  placeholder="e.g. Associate Professor" 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-slate-900 outline-none focus:border-indigo-600 focus:bg-white" 
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddFacultyModal(false)} 
                  className="px-4 py-2 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded bg-indigo-600 text-white font-bold text-xs shadow-sm hover:bg-indigo-700"
                >
                  Register Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Change / Reset Password */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Manage Password Credentials</h3>
                <p className="text-[11px] text-slate-500">
                  {passwordModalUser.type === 'student' ? 'Student' : 'Faculty'}: <span className="font-semibold text-slate-800">{passwordModalUser.name}</span> ({passwordModalUser.email})
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveUserPassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">New Access Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input 
                    type="text" 
                    value={editPasswordValue}
                    onChange={(e) => setEditPasswordValue(e.target.value)}
                    placeholder="Enter new password" 
                    className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 rounded text-slate-900 outline-none focus:border-blue-600 focus:bg-white font-mono" 
                    required 
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Once saved in database, only this new password will permit sign in to VERITY.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button 
                  type="button" 
                  onClick={() => setPasswordModalUser(null)} 
                  className="px-4 py-2 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" /> Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Face Biometric Registration Modal */}
      {faceModalStudent && (
        <FaceRegistrationModal
          student={faceModalStudent}
          onClose={() => setFaceModalStudent(null)}
          onSuccess={(updated) => {
            setStudents(db.getStudents());
            setFaceModalStudent(null);
            setStatusMsg({ text: `Biometric face template registered for ${updated.name}`, type: 'success' });
          }}
        />
      )}
    </div>
  );
};
