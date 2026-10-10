import React, { useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Download, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  FileSpreadsheet,
  PieChart
} from 'lucide-react';
import { mockSubjects, mockStudents } from '../../data/mockData';

export const AnalyticsReports: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState('30d');
  const [selectedDepartment, setSelectedDepartment] = useState('cs');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Institutional Security & Attendance Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              ANALYTICS ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Verification telemetry, failure mode distributions, and exportable compliance ledgers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="bg-white border border-slate-200 text-xs text-slate-900 p-2 rounded-lg outline-none font-mono font-semibold shadow-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">This Semester</option>
          </select>

          <button
            onClick={() => alert('Generating CSV Attendance Ledger export...')}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Bar Chart SVG Preview */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" /> Daily Verification Attendance Trend
            </h3>
            <span className="text-xs font-mono text-green-800 bg-green-100 px-2 py-0.5 rounded border border-green-200 font-bold">
              Avg: 94.8%
            </span>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="h-56 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-200">
            {[92, 95, 88, 96, 94, 98, 97, 93, 95, 96, 98, 94, 95, 97].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[10px] font-mono text-blue-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  {val}%
                </div>
                <div
                  style={{ height: `${val}%` }}
                  className="w-full bg-blue-600 rounded-t-sm group-hover:bg-blue-700 transition-all"
                />
                <span className="text-[9px] font-mono text-slate-500 font-medium">Day {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Failure Cause Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <PieChart className="w-5 h-5 text-amber-600" /> Verification Failure Cause Distribution
          </h3>
          <p className="text-xs text-slate-500">Breakdown of non-passing check-in attempts</p>

          <div className="space-y-3 pt-2">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-slate-700 font-medium">Geofence Boundary Mismatch</span>
                <span className="text-amber-700 font-bold">45%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-600 w-[45%]" />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-slate-700 font-medium">3D Liveness Gesture Timeout</span>
                <span className="text-indigo-700 font-bold">30%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 w-[30%]" />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-slate-700 font-medium">Expired Dynamic QR Token</span>
                <span className="text-blue-700 font-bold">15%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-[15%]" />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-slate-700 font-medium">Late Arrival Cutoff</span>
                <span className="text-red-700 font-bold">10%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 w-[10%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course & Subject Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base">Subject & Course Comparison Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 text-blue-800 uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Course Code</th>
                <th className="p-3">Subject Title</th>
                <th className="p-3">Faculty</th>
                <th className="p-3">Total Classes</th>
                <th className="p-3">Attendance Rate</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mockSubjects.map((subj) => (
                <tr key={subj.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{subj.code}</td>
                  <td className="p-3 text-slate-800 font-medium">{subj.name}</td>
                  <td className="p-3 text-slate-600">{subj.facultyName}</td>
                  <td className="p-3 text-slate-700">{subj.totalClasses}</td>
                  <td className="p-3 font-bold text-green-700">95.4%</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-green-100 text-green-800 border border-green-200 font-bold">
                      OPTIMAL
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
