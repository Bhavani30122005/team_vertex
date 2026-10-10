import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  UserCheck, 
  MapPin, 
  Clock, 
  Lock, 
  Activity,
  History
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockVerificationAttempts, mockAuditLogs } from '../../data/mockData';
import { ConfidenceTimeline } from '../common/ConfidenceTimeline';

export const InvestigationCenter: React.FC = () => {
  const { selectedAttemptId, setSelectedAttemptId, currentFaculty } = useAuth();
  const [selectedAttempt, setSelectedAttempt] = useState(
    mockVerificationAttempts.find(a => a.id === selectedAttemptId) || mockVerificationAttempts[0]
  );
  const [facultyReason, setFacultyReason] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  const handleOverride = (action: 'approved' | 'rejected') => {
    if (!facultyReason || facultyReason.length < 5) {
      alert('Mandatory faculty override reason required (minimum 5 characters).');
      return;
    }

    setActionSuccessMessage(`Attempt ${selectedAttempt.id} has been manually ${action.toUpperCase()} by ${currentFaculty.name}. Audit log entry logged.`);
    
    // Update local attempt status
    setSelectedAttempt(prev => ({
      ...prev,
      overallStatus: action === 'approved' ? 'verified' : 'rejected',
      facultyReview: {
        reviewedBy: currentFaculty.name,
        reviewedAt: new Date().toLocaleTimeString(),
        action,
        mandatoryReason: facultyReason
      }
    }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Verification Investigation Center
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              SECURITY OPERATIONS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Forensic analysis, explainable risk breakdown, and faculty override audit controls
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-600">
          <span>Active Investigation ID:</span>
          <span className="text-blue-700 font-bold bg-white px-3 py-1 rounded border border-slate-200 shadow-sm">
            {selectedAttempt.id}
          </span>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="bg-green-100 border border-green-300 text-green-900 text-xs p-4 rounded-xl flex items-center gap-2 font-mono font-bold shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Main Grid: Attempt Details + Confidence Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Attempt Metadata & Faculty Override Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Attempt Summary Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Attempt Case Overview</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                selectedAttempt.overallStatus === 'verified' ? 'bg-green-100 text-green-800 border border-green-200' :
                selectedAttempt.overallStatus === 'pending_review' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {selectedAttempt.overallStatus.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Student Name:</span>
                <span className="text-slate-900 font-bold">{selectedAttempt.studentName} ({selectedAttempt.studentRoll})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Course & Session:</span>
                <span className="text-blue-700 font-mono font-bold">{selectedAttempt.sessionTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Timestamp:</span>
                <span className="text-slate-700 font-mono font-medium">{selectedAttempt.timestamp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Device Fingerprint:</span>
                <span className="text-slate-700 font-mono font-medium">{selectedAttempt.deviceInfo.deviceId}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">IP Address:</span>
                <span className="text-slate-700 font-mono font-medium">{selectedAttempt.deviceInfo.ipAddress}</span>
              </div>
            </div>
          </div>

          {/* Faculty Override Controls */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" /> Faculty Adjudication Control
            </h3>
            <p className="text-xs text-slate-500">
              Review flagged evidence and issue an official attendance decision. All actions are logged into immutable audit history.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mandatory Reason for Override <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={3}
                value={facultyReason}
                onChange={(e) => setFacultyReason(e.target.value)}
                placeholder="e.g. Student present in adjacent Lab 301 due to seating overflow. Identity and liveness verified."
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white p-2.5 rounded-lg text-xs text-slate-900 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleOverride('approved')}
                className="py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Attendance
              </button>
              <button
                onClick={() => handleOverride('rejected')}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <XCircle className="w-4 h-4" /> Reject Attendance
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Layer-by-Layer Confidence Timeline & Audit Trail */}
        <div className="lg:col-span-7 space-y-6">
          <ConfidenceTimeline
            stages={selectedAttempt.stages}
            overallStatus={selectedAttempt.overallStatus}
            riskScore={selectedAttempt.riskScore}
            explainableRiskFactors={selectedAttempt.explainableRiskFactors}
          />

          {/* Audit History Log */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
            <h4 className="text-xs font-mono font-bold text-slate-700 flex items-center gap-2 uppercase">
              <History className="w-4 h-4 text-blue-600" /> SYSTEM AUDIT LOG TRAIL
            </h4>
            <div className="space-y-2 text-xs">
              {mockAuditLogs.map((log) => (
                <div key={log.id} className="bg-slate-50 p-2.5 rounded border border-slate-200 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-500">
                    <span className="font-bold text-slate-700">{log.actor} ({log.role})</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className="text-slate-800 mt-1">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
