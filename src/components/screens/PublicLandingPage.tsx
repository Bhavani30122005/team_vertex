import React from 'react';
import { 
  ShieldCheck, 
  Scan, 
  MapPin, 
  Clock, 
  Key, 
  UserCheck, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  Database, 
  Cpu, 
  Sparkles,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TrustPulse } from '../common/TrustPulse';

export const PublicLandingPage: React.FC = () => {
  const { setActiveScreen, setRole } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-slate-200">
        {/* Glow Effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono text-blue-700 mb-6 shadow-sm font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Hackathon 2026 Innovation Flagship</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Presence, <span className="text-blue-600">Proven.</span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Trust every check-in. Verify every layer. Next-generation smart multi-layer attendance verification platform built for high-security academic environments.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setActiveScreen('verification-experience')}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Try Live Verification Check <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveScreen('auth')}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm transition-all flex items-center gap-2 shadow-sm"
            >
              <Lock className="w-4 h-4 text-blue-600" /> Sign In to Portal
            </button>
          </div>

          {/* Trust Pulse Telemetry Summary */}
          <div className="mt-14 max-w-5xl mx-auto text-left">
            <TrustPulse />
          </div>
        </div>
      </section>

      {/* Product Dashboard Interactive Preview */}
      <section className="py-16 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold text-blue-700 tracking-wider uppercase bg-blue-100 px-3 py-1 rounded border border-blue-200">
              6-LAYER ZERO-TRUST VERIFICATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Multi-Layer Defense Architecture
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Combining 3D liveness detection, cryptographically signed dynamic QR challenges, precision GPS geofencing, and temporal anti-replay logic.
            </p>
          </div>

          {/* 6 Verification Layers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 hover:border-blue-300 p-6 rounded-xl transition-all space-y-3 group shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="font-mono text-xs text-blue-700 font-bold">LAYER 01</div>
              <h3 className="text-lg font-bold text-slate-900">Account & Biometric Enrolment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verifies registered student ID against 128-dimensional facial vector embeddings stored securely in institutional enclave.
              </p>
            </div>

            <div className="bg-white border border-slate-200 hover:border-blue-300 p-6 rounded-xl transition-all space-y-3 group shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Key className="w-6 h-6" />
              </div>
              <div className="font-mono text-xs text-blue-700 font-bold">LAYER 02</div>
              <h3 className="text-lg font-bold text-slate-900">Dynamic Session QR Challenge</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Short-lived HMAC-SHA256 signed QR codes rotating every 15 seconds to prevent static screenshot sharing.
              </p>
            </div>

            <div className="bg-white border border-slate-200 hover:border-blue-300 p-6 rounded-xl transition-all space-y-3 group shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Scan className="w-6 h-6" />
              </div>
              <div className="font-mono text-xs text-blue-700 font-bold">LAYER 03</div>
              <h3 className="text-lg font-bold text-slate-900">Real-Time Facial Identity Match</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                On-device neural inference comparing live camera frame against enrolled biometric signature with high precision threshold.
              </p>
            </div>

            <div className="bg-white border border-slate-200 hover:border-blue-300 p-6 rounded-xl transition-all space-y-3 group shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="font-mono text-xs text-indigo-700 font-bold">LAYER 04</div>
              <h3 className="text-lg font-bold text-slate-900">3D Passive Liveness Challenge</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Randomized micro-gesture requests (blink twice, turn head) and depth analysis to detect screen video spoofing attempts.
              </p>
            </div>

            <div className="bg-white border border-slate-200 hover:border-blue-300 p-6 rounded-xl transition-all space-y-3 group shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 border border-green-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="font-mono text-xs text-green-700 font-bold">LAYER 05</div>
              <h3 className="text-lg font-bold text-slate-900">Classroom Geofence Validation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                GPS satellite accuracy combined with Wi-Fi BSSID RSSI triangulation ensuring student is physically inside the designated lab.
              </p>
            </div>

            <div className="bg-white border border-slate-200 hover:border-blue-300 p-6 rounded-xl transition-all space-y-3 group shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <div className="font-mono text-xs text-amber-700 font-bold">LAYER 06</div>
              <h3 className="text-lg font-bold text-slate-900">Temporal Anti-Replay & Lock</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Single-use nonce validation preventing double check-in and enforcing late-arrival cutoff rules set by faculty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy Guarantee Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-mono font-bold text-green-700 tracking-wider uppercase bg-green-100 px-3 py-1 rounded border border-green-200">
              PRIVACY & GOVERNANCE BY DESIGN
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Biometric Protection Without Compromise
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              VERITY never stores raw facial photos or video recordings on external servers. All biometric processing converts imagery into irreversible mathematical embeddings.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 font-mono font-medium">
              <li className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Zero raw image retention policy
              </li>
              <li className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> AES-256 encrypted vector templates
              </li>
              <li className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Explainable risk scoring with human faculty review path
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl max-w-md w-full shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <ShieldAlert className="w-6 h-6 text-blue-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Explainable Governance Model</h4>
                <p className="text-xs text-slate-500">No automated rejection without faculty review</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              If location accuracy drifts due to indoor signal interference, VERITY routes the attempt to <span className="text-amber-700 font-bold">Pending Review</span> rather than marking the student absent, keeping faculty in complete control.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <footer className="py-12 bg-white text-xs text-slate-500 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="font-mono font-bold text-slate-900">VERITY</span> — Smart Multi-Layer Attendance Platform 2026
          </div>
          <div className="flex items-center gap-6 font-mono text-slate-600">
            <button onClick={() => setActiveScreen('landing')} className="hover:text-blue-600">Documentation</button>
            <button onClick={() => setActiveScreen('auth')} className="hover:text-blue-600">Faculty Login</button>
            <button onClick={() => setActiveScreen('verification-experience')} className="hover:text-blue-600">Student Check-In</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
