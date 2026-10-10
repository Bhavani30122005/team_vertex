import React from 'react';
import { 
  UserCheck, 
  Key, 
  Scan, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2 
} from 'lucide-react';
import { VerificationStage, VerificationStatus } from '../../types';

interface ConfidenceTimelineProps {
  stages: VerificationStage[];
  overallStatus: VerificationStatus;
  riskScore?: number;
  explainableRiskFactors?: string[];
}

const getIcon = (iconName: string, className: string) => {
  switch (iconName) {
    case 'UserCheck': return <UserCheck className={className} />;
    case 'Key': return <Key className={className} />;
    case 'Scan': return <Scan className={className} />;
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    case 'MapPin': return <MapPin className={className} />;
    case 'Clock': return <Clock className={className} />;
    default: return <CheckCircle className={className} />;
  }
};

export const ConfidenceTimeline: React.FC<ConfidenceTimelineProps> = ({
  stages,
  overallStatus,
  riskScore,
  explainableRiskFactors
}) => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
      {/* Header with Overall Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-wide">
              Verification Confidence Timeline™
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-bold">
              LAYER-BY-LAYER AUDIT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent multi-layer verification telemetry and decision rationale
          </p>
        </div>

        <div className="flex items-center gap-3">
          {riskScore !== undefined && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Risk Score:</span>
              <span className={`font-mono text-xs font-bold ${
                riskScore < 30 ? 'text-green-700' : riskScore < 70 ? 'text-amber-700' : 'text-red-700'
              }`}>
                {riskScore}/100
              </span>
            </div>
          )}

          {/* Overall Status Badge */}
          <div className="flex items-center gap-2">
            {overallStatus === 'verified' && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                <CheckCircle className="w-4 h-4 text-green-600" /> VERIFIED
              </span>
            )}
            {overallStatus === 'pending_review' && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> PENDING REVIEW
              </span>
            )}
            {overallStatus === 'rejected' && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                <XCircle className="w-4 h-4 text-red-600" /> REJECTED
              </span>
            )}
            {overallStatus === 'incomplete' && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> IN PROGRESS
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Explainable Risk Factors Warning (if present) */}
      {explainableRiskFactors && explainableRiskFactors.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3.5 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Explainable AI Telemetry Risk Factor Detected:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              {explainableRiskFactors.map((factor, idx) => (
                <li key={idx}>{factor}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Vertical Timeline Steps */}
      <div className="space-y-4 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {stages.map((stage, idx) => {
          const isPassed = stage.status === 'passed';
          const isFailed = stage.status === 'failed';
          const isWarning = stage.status === 'warning';
          const isPending = stage.status === 'pending';

          return (
            <div key={stage.id} className="relative flex items-start gap-4 group">
              {/* Node Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                  isPassed
                    ? 'bg-green-600 text-white shadow-sm ring-4 ring-green-100'
                    : isFailed
                    ? 'bg-red-600 text-white shadow-sm ring-4 ring-red-100'
                    : isWarning
                    ? 'bg-amber-600 text-white shadow-sm ring-4 ring-amber-100'
                    : 'bg-slate-100 text-slate-400 border border-slate-300'
                }`}
              >
                {getIcon(stage.iconName, 'w-4 h-4')}
              </div>

              {/* Card Container */}
              <div className="flex-1 bg-slate-50 border border-slate-200 p-3.5 rounded-lg space-y-1 hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{stage.name}</h4>
                  <div className="flex items-center gap-2">
                    {stage.completionTimeMs && (
                      <span className="text-[10px] font-mono text-slate-500">
                        {stage.completionTimeMs}ms
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        isPassed
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : isFailed
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {stage.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600">{stage.explanation}</p>

                {/* Optional Metric Detail Pill */}
                {stage.metrics && (
                  <div className="pt-2 mt-2 border-t border-slate-200 flex flex-wrap gap-2 text-[10px] font-mono text-slate-600">
                    {Object.entries(stage.metrics).map(([key, val]) => (
                      <span key={key} className="bg-white px-2 py-0.5 rounded border border-slate-200">
                        {key}: <strong className="text-slate-900">{String(val)}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
