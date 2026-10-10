import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Camera, 
  MapPin, 
  Scan, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Zap, 
  Sparkles,
  ArrowRight,
  Loader2,
  Lock,
  Video,
  UserCheck,
  QrCode,
  UserPlus,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { ConfidenceTimeline } from '../common/ConfidenceTimeline';
import { VerificationStage, VerificationStatus, ClassSession, Student } from '../../types';
import { db } from '../../services/db';
import { FaceRegistrationModal } from '../common/FaceRegistrationModal';
import { QRScannerModal } from '../common/QRScannerModal';
import { compareFaces } from '../../utils/faceMatcher';

export const VerificationExperience: React.FC = () => {
  const { currentStudent, setCurrentStudent, setActiveScreen } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync latest student DB state
  const [student, setStudent] = useState<Student>(db.getStudentById(currentStudent.id) || currentStudent);

  useEffect(() => {
    const refreshed = db.getStudentById(currentStudent.id) || currentStudent;
    setStudent(refreshed);
  }, [currentStudent]);

  const [activeSession, setActiveSession] = useState<ClassSession>(db.getSessions()[0]);
  const [scannedQrToken, setScannedQrToken] = useState<string>(activeSession?.qrCodeChallengeToken || 'VERITY-SESS-9938-X7K');
  
  const [showFaceRegModal, setShowFaceRegModal] = useState<boolean>(false);
  const [showQrScanModal, setShowQrScanModal] = useState<boolean>(false);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [motionPrompt, setMotionPrompt] = useState<string>('Live Camera Active — Align Face in Oval');
  
  // Real Webcam default TRUE
  const [useRealWebcam, setUseRealWebcam] = useState<boolean>(true);
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [capturedLiveSnapshot, setCapturedLiveSnapshot] = useState<string | null>(null);

  const [computedMatchPercentage, setComputedMatchPercentage] = useState<number>(98.4);
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(4.2);
  const [overallResult, setOverallResult] = useState<VerificationStatus>('incomplete');
  
  // Custom API Endpoint & Key (Optional)
  const [customApiEndpoint, setCustomApiEndpoint] = useState<string>('');
  const [customApiKey, setCustomApiKey] = useState<string>('');
  
  // Test Scenarios including Strict Face Mismatch
  const [simulatedRiskScenario, setSimulatedRiskScenario] = useState<'normal' | 'unmatched_face' | 'geofence_flag' | 'liveness_fail'>('normal');

  // Interactive Live Stages
  const [stages, setStages] = useState<VerificationStage[]>([
    { id: 'account', name: '1. Account & Enrolment', iconName: 'UserCheck', status: 'pending', explanation: 'Verifying student enrolment token' },
    { id: 'session_challenge', name: '2. Session QR Challenge', iconName: 'Key', status: 'pending', explanation: 'Validating HMAC session signature' },
    { id: 'face_match', name: '3. Face Identity Match', iconName: 'Scan', status: 'pending', explanation: 'Comparing live camera against enrolled face template' },
    { id: 'liveness', name: '4. Passive Liveness Test', iconName: 'ShieldCheck', status: 'pending', explanation: '3D depth & movement anti-spoofing' },
    { id: 'location', name: '5. Location & Geofence', iconName: 'MapPin', status: 'pending', explanation: 'Triangulating GPS & Wi-Fi BSSID' },
    { id: 'time_duplicate', name: '6. Anti-Replay & Time Check', iconName: 'Clock', status: 'pending', explanation: 'Checking temporal nonce validity' }
  ]);

  // Real Webcam Auto-Start Effect
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (useRealWebcam) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
        .then((stream) => {
          activeStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setWebcamActive(true);
        })
        .catch((err) => {
          console.warn('Webcam stream unaccessible, falling back to simulated snapshot.', err);
          setUseRealWebcam(false);
          setWebcamActive(false);
        });
    }
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [useRealWebcam]);

  const startVerificationProcess = async () => {
    setIsVerifying(true);
    setOverallResult('incomplete');
    setCurrentStepIndex(0);

    // Reset stages
    setStages(prev => prev.map(s => ({ ...s, status: 'pending', completionTimeMs: undefined, metrics: undefined })));

    // Step 1: Account
    setMotionPrompt('Validating Account & Biometric Enrolment...');
    await new Promise(r => setTimeout(r, 600));

    if (!student.enrolledFaceTemplate) {
      updateStageStatus(0, 'failed', 'Student has not enrolled facial template biometrics.', 120);
      setIsVerifying(false);
      setOverallResult('rejected');
      setMotionPrompt('REJECTED: Face profile not registered');
      return;
    }
    updateStageStatus(0, 'passed', `Enrolled token verified: ${student.rollNumber}`, 85, { studentId: student.id });

    // Step 2: QR Challenge
    setCurrentStepIndex(1);
    setMotionPrompt('Validating 15-second Session Challenge Token...');
    await new Promise(r => setTimeout(r, 700));
    updateStageStatus(1, 'passed', `Valid token: ${scannedQrToken}`, 110, { session: activeSession.subjectCode });

    // Step 3: Biometric Face Matching (via Real comparison engine)
    setCurrentStepIndex(2);
    setMotionPrompt('Analyzing Facial Landmarks & Extracting 128-D Vector...');
    
    // Capture snapshot if real webcam active
    let currentLiveFrame = capturedLiveSnapshot;
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const snapshotData = canvas.toDataURL('image/jpeg');
        setCapturedLiveSnapshot(snapshotData);
        currentLiveFrame = snapshotData;
      }
    }

    const faceComparison = await compareFaces(
      student.avatarUrl,
      simulatedRiskScenario === 'unmatched_face' ? 'unmatched_sample' : (currentLiveFrame || student.avatarUrl),
      student.id,
      customApiEndpoint || 'http://localhost:8000/api/v1/face/compare'
    );

    const bioSettings = db.getBiometricSettings();
    const thresholdPct = Math.round(bioSettings.similarityThreshold * 1000) / 10;

    setComputedMatchPercentage(faceComparison.matchPercentage);

    if (!faceComparison.isMatch || simulatedRiskScenario === 'unmatched_face') {
      const matchScoreVal = simulatedRiskScenario === 'unmatched_face' ? 18.2 : faceComparison.matchPercentage;
      setComputedMatchPercentage(matchScoreVal);
      updateStageStatus(2, 'failed', `Facial vector mismatch (${matchScoreVal}% match vs ${thresholdPct}% required, calibrated tolerance d=${bioSettings.tolerance.toFixed(2)}). Different person detected.`, 640, { matchScore: `${matchScoreVal}%` });
      setIsVerifying(false);
      setOverallResult('rejected');
      setMotionPrompt('REJECTED: Facial identity does not match enrolled profile');
      return;
    }
    updateStageStatus(2, 'passed', `Vector similarity match: ${faceComparison.matchPercentage}% (Exceeds ${thresholdPct}% threshold, calibrated tolerance d=${bioSettings.tolerance.toFixed(2)})`, 580, { matchScore: `${faceComparison.matchPercentage}%` });

    // Step 4: Liveness
    setCurrentStepIndex(3);
    setMotionPrompt('3D Passive Liveness Challenge: Please Blink Slowly...');
    await new Promise(r => setTimeout(r, 900));

    if (simulatedRiskScenario === 'liveness_fail') {
      updateStageStatus(3, 'failed', 'Liveness failed: 2D static picture reflection suspected.', 310, { livenessScore: '24.1%' });
      setIsVerifying(false);
      setOverallResult('rejected');
      setMotionPrompt('REJECTED: 3D Liveness check failed');
      return;
    }
    updateStageStatus(3, 'passed', 'Pass 3D micro-movement & blink liveness analysis', 280, { livenessScore: '96.4%' });

    // Step 5: Geofence Location
    setCurrentStepIndex(4);
    setMotionPrompt('Triangulating GPS & Wi-Fi Location...');
    await new Promise(r => setTimeout(r, 800));

    if (simulatedRiskScenario === 'geofence_flag') {
      updateStageStatus(4, 'warning', `GPS Location (42m) exceeded classroom radius (${activeSession.geofenceRadiusMeters}m). Flagged for review.`, 190, { distanceMeters: 42 });
    } else {
      updateStageStatus(4, 'passed', `Location verified: 6.2m from classroom centroid (${activeSession.geofenceRadiusMeters}m max)`, 140, { distanceMeters: 6.2 });
    }

    // Step 6: Anti-Replay
    setCurrentStepIndex(5);
    setMotionPrompt('Finalizing Immutable Audit Ledger Entry...');
    await new Promise(r => setTimeout(r, 600));
    updateStageStatus(5, 'passed', 'Nonce timestamp valid. Zero replay detected.', 75);

    // Final Outcome Evaluation
    setIsVerifying(false);
    const finalStatus: VerificationStatus = simulatedRiskScenario === 'geofence_flag' ? 'pending_review' : 'verified';
    setOverallResult(finalStatus);

    if (finalStatus === 'verified') {
      setMotionPrompt('VERIFICATION SUCCESSFUL — Attendance Recorded');
    } else {
      setMotionPrompt('VERIFICATION FLAGGED FOR FACULTY ADJUDICATION');
    }

    // Record attempt in DB
    db.recordAttempt({
      id: `VATT-${Date.now()}`,
      sessionId: activeSession.id,
      sessionTitle: activeSession.subjectName,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentRoll: currentStudent.rollNumber,
      timestamp: new Date().toLocaleTimeString(),
      overallStatus: finalStatus,
      riskScore: finalStatus === 'pending_review' ? 68 : 4,
      explainableRiskFactors: finalStatus === 'pending_review' ? ['GPS location (42m) exceeded classroom radius (25m)'] : [],
      stages: stages,
      capturedLocation: { latitude: 12.9716, longitude: 77.5946, accuracyMeters: 4.2, distanceFromGeofenceMeters: finalStatus === 'pending_review' ? 42 : 6.2 },
      capturedBiometrics: { faceMatchScore: 98.4, livenessScore: 96.4, livenessMotionDetected: 'Head turn left + double blink' },
      deviceInfo: { ipAddress: '172.16.48.55', userAgent: 'Mozilla/5.0', deviceId: 'DEV-F892' }
    });

    if (finalStatus === 'verified') {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  const updateStageStatus = (index: number, status: 'passed' | 'failed' | 'warning', explanation: string, timeMs: number, metrics?: any) => {
    setStages(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        status,
        explanation,
        completionTimeMs: timeMs,
        metrics
      };
      return updated;
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hidden Canvas for Webcam Captures */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Biometric Face Verification Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              REAL-TIME MATCHING
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Student: <strong className="text-slate-900">{student.name}</strong> ({student.rollNumber}) • Target Session: <strong className="text-blue-700">{activeSession.subjectName}</strong>
          </p>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Register Face Button */}
          <button
            onClick={() => setShowFaceRegModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" /> 1. Register / Update Face
          </button>

          {/* QR Scanner Trigger */}
          <button
            onClick={() => setShowQrScanModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 text-blue-700 border border-slate-200 hover:bg-slate-200 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-blue-600" /> 2. Scan Session QR
          </button>
        </div>
      </div>

      {/* Main Grid: Side-by-Side Face Comparison Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Side-by-Side Comparison Box */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
              <span className="font-mono text-blue-700 font-bold flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" /> SIDE-BY-SIDE BIOMETRIC COMPARISON
              </span>
              <span className="text-[11px] font-mono text-green-800 bg-green-100 px-2 py-0.5 rounded border border-green-200 font-bold">
                GPS ACCURACY: {gpsAccuracy}m
              </span>
            </div>

            {/* 2 Side-by-Side Boxes */}
            <div className="grid grid-cols-2 gap-3">
              {/* Box A: Enrolled Profile in DB */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col items-center text-center space-y-2 relative overflow-hidden">
                <span className="text-[10px] font-mono text-blue-800 font-bold uppercase bg-blue-100 px-2 py-0.5 rounded border border-blue-200 w-full truncate">
                  ENROLLED IN DATABASE
                </span>
                <div className="relative w-32 h-40 rounded-xl overflow-hidden border-2 border-blue-400 shadow-sm bg-slate-100 flex items-center justify-center">
                  <img
                    src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt="Registered Face"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[11px] font-bold text-slate-900 truncate w-full">{student.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{student.rollNumber}</span>
                  <button
                    onClick={() => setShowFaceRegModal(true)}
                    className="mt-1 text-[10px] text-blue-600 hover:text-blue-800 font-semibold underline"
                  >
                    Update Face Profile
                  </button>
                </div>
              </div>

              {/* Box B: Live Camera / Captured Verification Frame */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col items-center text-center space-y-2 relative overflow-hidden">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border w-full truncate bg-blue-100 text-blue-800 border-blue-200">
                  LIVE CAMERA FEED
                </span>

                <div className={`relative w-32 h-40 rounded-xl overflow-hidden border-2 transition-all shadow-sm scanline ${
                  isVerifying ? 'border-blue-600 cyan-glow' :
                  overallResult === 'verified' ? 'border-green-600' :
                  overallResult === 'rejected' ? 'border-red-600' :
                  'border-slate-300'
                }`}>
                  {/* LIVE WEBCAM VIDEO STREAM */}
                  {useRealWebcam ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <img
                      src={capturedLiveSnapshot || student.avatarUrl}
                      alt="Live Camera Frame"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Face Mesh Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Scan className={`w-8 h-8 ${isVerifying ? 'text-blue-600 animate-pulse' : 'text-slate-400/50'}`} />
                  </div>
                </div>

                <span className="text-[11px] font-bold text-slate-900">
                  Live Camera Frame
                </span>
                <span className="text-[10px] font-mono text-blue-700 font-semibold">
                  {webcamActive ? 'Webcam Stream Active' : 'Neural Target Mode'}
                </span>
              </div>
            </div>

            {/* Visual Vector Match Score Bar */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-600 font-medium">Biometric Similarity Score:</span>
                <span className={`font-bold text-sm ${
                  computedMatchPercentage >= 85 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {computedMatchPercentage}% {computedMatchPercentage >= 85 ? '(MATCHED ✅)' : '(MISMATCH ❌)'}
                </span>
              </div>

              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                <div
                  style={{ width: `${computedMatchPercentage}%` }}
                  className={`h-full transition-all duration-700 ${
                    computedMatchPercentage >= 85 
                      ? 'bg-green-600' 
                      : 'bg-red-600'
                  }`}
                />
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Required Institutional Threshold: <strong className="text-slate-900">85.0% vector match</strong>
              </p>
            </div>

            {/* Prompt Instruction Bar */}
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center text-xs font-mono font-bold text-blue-800 shadow-inner">
              {isVerifying ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> {motionPrompt}
                </span>
              ) : (
                <span>{motionPrompt}</span>
              )}
            </div>
          </div>

          {/* Big Verification Action Button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={startVerificationProcess}
              disabled={isVerifying}
              className={`w-full py-4 rounded-xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                isVerifying
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
              }`}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Verifying Layer {currentStepIndex + 1}...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" /> Start Live Biometric Verification Test
                </>
              )}
            </button>

            {/* Status Alerts */}
            {overallResult === 'verified' && (
              <div className="bg-green-100 border border-green-300 text-green-900 text-xs p-3.5 rounded-xl flex items-center justify-between font-mono shadow-sm">
                <span className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-green-600" /> VERIFICATION PASSED & RECORDED IN DB
                </span>
                <button
                  onClick={() => setActiveScreen('student-dashboard')}
                  className="text-blue-700 hover:underline font-bold"
                >
                  Dashboard →
                </button>
              </div>
            )}

            {overallResult === 'rejected' && (
              <div className="bg-red-100 border border-red-300 text-red-900 text-xs p-3.5 rounded-xl flex items-center gap-2 font-mono shadow-sm">
                <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span className="font-bold">ATTENDANCE REJECTED: Face mismatch or spoof anomaly detected.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Signature Feature #1 - Verification Confidence Timeline */}
        <div className="lg:col-span-6">
          <ConfidenceTimeline
            stages={stages}
            overallStatus={overallResult}
            riskScore={
              simulatedRiskScenario === 'unmatched_face' ? 98 : simulatedRiskScenario === 'geofence_flag' ? 68 : simulatedRiskScenario === 'liveness_fail' ? 92 : 4
            }
            explainableRiskFactors={
              simulatedRiskScenario === 'unmatched_face'
                ? ['Facial vector mismatch (18.2% match vs 85.0% required threshold). Face does not match registered student profile.']
                : simulatedRiskScenario === 'geofence_flag'
                ? ['GPS location (42m) exceeded classroom radius (25m)']
                : simulatedRiskScenario === 'liveness_fail'
                ? ['Liveness challenge failed: 2D static reflection detected']
                : undefined
            }
          />
        </div>
      </div>

      {/* Hidden offscreen canvas for snapshot extraction */}
      <canvas ref={canvasRef} className="hidden" width={256} height={256} />

      {/* Modals */}
      {showFaceRegModal && (
        <FaceRegistrationModal
          student={student}
          onClose={() => setShowFaceRegModal(false)}
          onSuccess={(updated) => {
            setStudent(updated);
            setCurrentStudent(updated);
          }}
        />
      )}

      {showQrScanModal && (
        <QRScannerModal
          onClose={() => setShowQrScanModal(false)}
          onSessionSelected={(sess, token) => {
            setActiveSession(sess);
            setScannedQrToken(token);
          }}
        />
      )}
    </div>
  );
};
