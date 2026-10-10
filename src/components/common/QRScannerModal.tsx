import React, { useState } from 'react';
import { QrCode, Scan, CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { db } from '../../services/db';
import { ClassSession } from '../../types';

interface QRScannerModalProps {
  onClose: () => void;
  onSessionSelected: (session: ClassSession, token: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  onClose,
  onSessionSelected
}) => {
  const sessions = db.getSessions().filter(s => s.status === 'active');
  const [manualToken, setManualToken] = useState(sessions[0]?.qrCodeChallengeToken || 'VERITY-SESS-9938-X7K');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleScanSubmit = (tokenToUse: string) => {
    setErrorMsg('');
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      const activeSess = sessions.find(s => s.qrCodeChallengeToken === tokenToUse || tokenToUse.startsWith('VERITY-SESS'));
      if (activeSess) {
        onSessionSelected(activeSess, tokenToUse);
        onClose();
      } else {
        setErrorMsg('Invalid or expired QR challenge token. Session is no longer active.');
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Scan Session QR Code</h3>
          </div>
          <p className="text-xs text-slate-500">
            Scan active QR code displayed on Faculty Screen to bind attendance
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-100 border border-red-300 text-red-900 text-xs p-3 rounded-lg flex items-center gap-2 font-mono font-medium">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Viewport QR Frame Simulator */}
        <div className="relative w-full aspect-square max-w-[220px] mx-auto bg-slate-50 rounded-xl border border-blue-300 p-4 flex flex-col items-center justify-center scanline shadow-sm">
          <Scan className={`w-12 h-12 text-blue-600 ${isScanning ? 'animate-ping' : 'animate-pulse'}`} />
          <span className="text-[10px] font-mono text-blue-800 font-bold mt-2">
            {isScanning ? 'Decoding HMAC token...' : 'Align QR inside box'}
          </span>
        </div>

        {/* Available Active Class Sessions Quick List */}
        <div className="space-y-2 text-xs">
          <label className="block text-slate-700 font-semibold">Select Active Faculty Session</label>
          {sessions.map((sess) => (
            <div
              key={sess.id}
              onClick={() => handleScanSubmit(sess.qrCodeChallengeToken)}
              className="bg-slate-50 border border-slate-200 hover:border-blue-400 p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all shadow-sm"
            >
              <div>
                <span className="font-mono text-blue-700 font-bold">{sess.subjectCode}</span>
                <p className="text-slate-900 font-bold">{sess.subjectName}</p>
                <span className="text-[10px] text-slate-500">{sess.classroomName}</span>
              </div>
              <span className="text-[11px] font-mono bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded font-bold">
                SCAN & CHECKIN
              </span>
            </div>
          ))}
        </div>

        {/* Manual Token Input */}
        <div className="pt-2 flex gap-2">
          <input
            type="text"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="Enter token manually..."
            className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs font-mono text-slate-900 outline-none focus:border-blue-600"
          />
          <button
            onClick={() => handleScanSubmit(manualToken)}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};
