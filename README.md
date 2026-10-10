# VERITY — Next-Generation Smart Multi-Layer Attendance Security Platform

> **Tagline**: *"Presence, Proven."*  
> **Supporting Message**: *"Trust every check-in. Verify every layer."*  
> **PS-05 Hackathon 2026 Flagship Prototype**

---

## 🌟 Executive Overview

VERITY is an intelligent academic security and attendance verification system developed for university environments. Unlike typical ERP templates or simple QR check-in apps, VERITY combines **6-Layer Zero-Trust Verification** (Account Authorization, Dynamic Rotating QR Tokens, Real-Time Facial Identity Matching, 3D Passive Liveness Detection, GPS Geofencing, and Temporal Anti-Replay Locks) to ensure that the correct student attends the correct class session at the correct location and time.

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Backend API**: Node.js & Express.js (`server/index.js`)
- **Biometric AI Microservice**: Python FastAPI & OpenCV (`ai_service/main.py`)
- **Database Schema**: Production MySQL 8.0+ Schema & Migrations (`database/schema.sql`)
- **Data Persistence**: Centralized LocalStorage Database Service (`src/services/db.ts`)
- **Testing**: Automated Verification Test & Latency Benchmark Suite (`tests/verification_latency_test.js`)

---

## 🚀 Quick Startup & Local Execution

### 1. Launch Frontend Application
```bash
# Install dependencies
npm install

# Start Vite Development Server
npm run dev -- --host --port 5173
```
Open **`http://localhost:5173/`** in your browser.

### 2. Run Automated Verification Test Suite
```bash
node tests/verification_latency_test.js
```
Runs 8 automated security scenarios and benchmarks end-to-end latency (P50: ~158ms).

---

## 📱 Key Features & User Roles

### 👨‍🎓 Student Mobile Dashboard
- **Personalized Attendance Gauge**: Overall attendance percentage and subject breakdowns.
- **Biometric Face Enrolment Modal**: Capture or upload facial photos to register 128-D vector templates.
- **Session QR Code Scanner**: Scan or enter dynamic 15-second rotating Faculty session tokens.
- **Verification Engine**: Interactive camera feed, 3D facial landmark mesh nodes, and live liveness challenges.

### 👨‍🏫 Faculty Console
- **Session Creator**: Configure classroom geofence radius (e.g. 25m) and late arrival thresholds.
- **Dynamic Rotating QR Generator**: Displays 15-second rotating HMAC-signed tokens (`VERITY-SESS-9938-X7K`).
- **Real-Time Telemetry Counter**: Monitors Present, Late, Pending Review, and Rejected counts live.
- **Export Report**: One-click download of real `.csv` attendance ledgers (`verity_attendance_ledger_CS401.csv`).

### 🛡️ Security Operations & Investigation Center
- **Explainable Risk Breakdown**: Inspect suspicious check-ins with clear telemetry rationale.
- **Faculty Adjudication Control**: Approve or reject flagged check-ins with mandatory reason logging and immutable audit history.

---

## 📂 Project Structure

```
TEAM VERTEX/
├── ai_service/
│   └── main.py                 # Python FastAPI Biometric AI Service
├── server/
│   └── index.js                # Express.js REST API Server
├── database/
│   └── schema.sql              # Production MySQL 8.0+ Schema
├── docs/
│   ├── ARCHITECTURE.md         # System Architecture & 6-Layer Specifications
│   ├── SECURITY_THREAT_MODEL.md# Security Threat Vector Matrix & GPS Limits
│   └── BIOMETRIC_PRIVACY_RETENTION.md # Biometric Privacy & Zero Photo Policy
├── tests/
│   └── verification_latency_test.js # Automated E2E Test & Latency Benchmark
├── src/
│   ├── components/
│   │   ├── common/             # TrustPulse, ConfidenceTimeline, Modals, Navbar, Sidebar
│   │   └── screens/            # 10 Core Application Screens
│   ├── context/                # AuthContext & Demo Persona Switcher
│   ├── services/               # db.ts (Persistent LocalStorage DB & CSV Exporter)
│   ├── types/                  # TypeScript Data Models
│   ├── App.tsx
│   └── index.css               # Verity Design Tokens & Cyber Styling
├── README.md
└── package.json
```

---

## 📄 License & Hackathon Compliance
Built for PS-05 Computer Vision / Security Hackathon 2026 by Team Vertex.
# TEAM-VERTEX
