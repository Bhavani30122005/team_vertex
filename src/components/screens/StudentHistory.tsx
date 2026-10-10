import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Send, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockSubjects } from '../../data/mockData';

export const StudentHistory: React.FC = () => {
  const { currentStudent } = useAuth();
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [appealSubmitted, setAppealSubmitted] = useState(false);

  const handleAppealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealReason) return;
    setAppealSubmitted(true);
    setTimeout(() => {
      setShowAppealForm(false);
    }, 1500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Personal Attendance History & Appeals
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-green-100 text-green-800 border border-green-200 font-bold">
              STUDENT RECORD
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Student: <strong className="text-slate-900">{currentStudent.name}</strong> ({currentStudent.rollNumber})
          </p>
        </div>

        <button
          onClick={() => setShowAppealForm(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
        >
          <FileText className="w-4 h-4" /> Submit Correction Appeal
        </button>
      </div>

      {/* Subject-Wise Percentage Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockSubjects.map((subj, idx) => (
          <div key={subj.id} className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-blue-700 font-bold">{subj.code}</span>
              <span className="text-green-700 font-mono font-extrabold">{idx === 1 ? '92.5%' : '96.8%'}</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">{subj.name}</h4>
            <p className="text-[11px] text-slate-500">Faculty: {subj.facultyName}</p>
          </div>
        ))}
      </div>

      {/* Attendance Calendar & Logs */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" /> Attendance Check-In History
        </h3>

        <div className="space-y-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-slate-900 font-bold">CS401: Advanced AI & Biometric Security</p>
                <p className="text-[11px] text-slate-500 font-mono">Sat, Oct 10 • 10:04 AM • Lab 302</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-200 font-mono text-[10px] font-bold">
              VERIFIED
            </span>
          </div>

          <div className="bg-slate-50 border border-amber-200 p-3.5 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-600" />
              <div>
                <p className="text-slate-900 font-bold">CS408: Distributed Systems & Cryptography</p>
                <p className="text-[11px] text-slate-500 font-mono">Thu, Oct 08 • 02:12 PM (Late 12 mins)</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold">
              LATE ARRIVAL
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-slate-900 font-bold">CS412: Network Threat Intelligence</p>
                <p className="text-[11px] text-slate-500 font-mono">Tue, Oct 06 • 11:30 AM • Auditorium 401</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-200 font-mono text-[10px] font-bold">
              VERIFIED
            </span>
          </div>
        </div>
      </div>

      {/* Appeal Modal */}
      {showAppealForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Submit Attendance Correction Appeal</h3>
            <p className="text-xs text-slate-500">If you encountered a sensor or GPS drift anomaly, submit an appeal for faculty review.</p>

            {appealSubmitted ? (
              <div className="bg-green-100 border border-green-300 text-green-900 text-xs p-3 rounded-lg flex items-center gap-2 font-mono font-bold">
                <CheckCircle className="w-4 h-4 text-green-600" /> Appeal submitted! Faculty notified.
              </div>
            ) : (
              <form onSubmit={handleAppealSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Session</label>
                  <select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-slate-900 outline-none focus:border-blue-600">
                    <option>CS408: Oct 08 - Late Arrival Appeal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Detailed Explanation</label>
                  <textarea
                    rows={3}
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="Describe reason..."
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-slate-900 outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAppealForm(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded hover:bg-slate-200">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded shadow-sm hover:bg-blue-700">Submit Appeal</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
