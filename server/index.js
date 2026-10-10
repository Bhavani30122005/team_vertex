const express = require('express');
const cors = require('cors');
const { 
  verifyMultiFrame, 
  checkEnrollmentUniqueness, 
  normalizeEmbedding, 
  SIMILARITY_THRESHOLD 
} = require('./biometricCore');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-Memory Database Store for Server-Side Biometric Enforcement
const enrolledTemplates = {}; // studentId -> 128 float array
const sessionFailedAttempts = {}; // `${sessionId}_${studentId}` -> count

// Pre-populate mock student templates with deterministic 128-D vectors
function initMockTemplates() {
  const seedVector = (seed) => {
    const vec = [];
    for (let i = 0; i < 128; i++) {
      vec.push(Math.sin(seed + i * 0.1));
    }
    return normalizeEmbedding(vec);
  };
  
  enrolledTemplates['usr_2026_01'] = seedVector(1.0); // Student A (Aarav Sharma)
  enrolledTemplates['STU-2026-089'] = seedVector(1.0);
  enrolledTemplates['usr_2026_02'] = seedVector(5.0); // Student B (Ananya Iyer)
  enrolledTemplates['STU-2026-090'] = seedVector(5.0);
}
initMockTemplates();

// API Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      faceRecognitionEngine: 'operational',
      similarityThreshold: SIMILARITY_THRESHOLD,
      failClosedProtection: true
    }
  });
});

// Authentication Routes
app.post('/api/v1/auth/login', (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  res.json({
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.verity_session_jwt_token',
    user: {
      id: 'usr_2026_01',
      name: role === 'faculty' ? 'Dr. Rajesh Kumar' : 'Aarav Sharma',
      email: email,
      role: role || 'student'
    }
  });
});

// Enrolment Endpoint: Store encrypted/averaged 128-D embedding with cross-student check
app.post('/api/v1/face/enroll', (req, res) => {
  try {
    const { studentId, enrollmentFrames } = req.body;
    if (!studentId || !enrollmentFrames || !Array.isArray(enrollmentFrames) || enrollmentFrames.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'REJECTED: 5 quality-checked enrollment frames are required.'
      });
    }

    // Check each frame
    const normVectors = [];
    for (let i = 0; i < 5; i++) {
      const frame = enrollmentFrames[i];
      if (!frame || frame.detectedFacesCount !== 1) {
        return res.status(422).json({
          success: false,
          error: `REJECTED: Enrollment frame ${i + 1} must contain exactly 1 face.`
        });
      }
      const norm = normalizeEmbedding(frame.embedding || frame.vector_embedding);
      if (!norm) {
        return res.status(422).json({
          success: false,
          error: `REJECTED: Enrollment frame ${i + 1} contains an invalid embedding vector.`
        });
      }
      normVectors.push(norm);
    }

    // Compute averaged embedding
    const avgVec = new Array(128).fill(0);
    for (let i = 0; i < 128; i++) {
      let sum = 0;
      for (let f = 0; f < 5; f++) {
        sum += normVectors[f][i];
      }
      avgVec[i] = sum / 5;
    }
    const finalNorm = normalizeEmbedding(avgVec);

    // Cross-student uniqueness check
    const uniqueness = checkEnrollmentUniqueness(finalNorm, enrolledTemplates);
    if (!uniqueness.valid) {
      return res.status(409).json({
        success: false,
        error: uniqueness.reason
      });
    }

    enrolledTemplates[studentId] = finalNorm;
    res.json({
      success: true,
      studentId,
      message: 'Facial template enrolled successfully with 128-D normalized embedding.'
    });

  } catch (err) {
    res.status(500).json({ success: false, error: `Fail closed exception: ${err.message}` });
  }
});

// Verification Endpoint (Strict Server-Only 5-Frame Verification)
app.post('/api/v1/verification/verify', (req, res) => {
  try {
    const { studentId, sessionId, frames, gpsDistanceMeters } = req.body;

    if (!studentId) {
      return res.status(400).json({
        attemptId: `VATT-${Date.now()}`,
        overallStatus: 'rejected',
        riskScore: 100,
        explainableRiskFactors: ['REJECTED: Student ID is required for verification.'],
        timestamp: new Date().toISOString()
      });
    }

    const sessionKey = `${sessionId || 'sess_default'}_${studentId}`;
    const currentFailures = sessionFailedAttempts[sessionKey] || 0;

    // Lockout Rule: 5 failed face attempts in one session -> pending_review
    if (currentFailures >= 5) {
      return res.json({
        attemptId: `VATT-${Date.now()}`,
        overallStatus: 'pending_review',
        riskScore: 85,
        explainableRiskFactors: ['REJECTED: Maximum 5 failed face verification attempts reached for this session. Status set to pending_review.'],
        timestamp: new Date().toISOString()
      });
    }

    // Strict Template Lookup by studentId ONLY (Rule 2)
    const enrolledTemplate = enrolledTemplates[studentId];
    if (!enrolledTemplate) {
      sessionFailedAttempts[sessionKey] = currentFailures + 1;
      return res.json({
        attemptId: `VATT-${Date.now()}`,
        overallStatus: 'rejected',
        riskScore: 99,
        explainableRiskFactors: ['REJECTED: No enrolled biometric template found for this student ID.'],
        timestamp: new Date().toISOString()
      });
    }

    // Server-Side Multi-Frame Biometric Evaluation
    const evalResult = verifyMultiFrame(enrolledTemplate, frames);

    if (!evalResult.passed) {
      sessionFailedAttempts[sessionKey] = currentFailures + 1;
      const newFailures = sessionFailedAttempts[sessionKey];

      const finalStatus = newFailures >= 5 ? 'pending_review' : 'rejected';
      return res.json({
        attemptId: `VATT-${Date.now()}`,
        overallStatus: finalStatus,
        riskScore: 98,
        explainableRiskFactors: [evalResult.reason],
        attemptsLeft: Math.max(0, 5 - newFailures),
        timestamp: new Date().toISOString()
      });
    }

    // Check Geofence if biometric check passed
    let overallStatus = 'verified';
    let riskScore = 4;
    const explainableRiskFactors = [];

    if (gpsDistanceMeters && gpsDistanceMeters > 25) {
      overallStatus = 'pending_review';
      riskScore = 68;
      explainableRiskFactors.push(`GPS location (${gpsDistanceMeters}m) exceeded classroom radius (25m)`);
    }

    res.json({
      attemptId: `VATT-${Date.now()}`,
      overallStatus,
      riskScore,
      biometricScore: evalResult.score,
      explainableRiskFactors,
      latencyMs: 120,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    // FAIL CLOSED
    res.json({
      attemptId: `VATT-${Date.now()}`,
      overallStatus: 'rejected',
      riskScore: 100,
      explainableRiskFactors: [`REJECTED: Fail closed exception on server: ${err.message}`],
      timestamp: new Date().toISOString()
    });
  }
});

// Helper getter for tests
app._getEnrolledTemplates = () => enrolledTemplates;
app._getSessionFailures = () => sessionFailedAttempts;

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`VERITY Express Backend API server running on port ${PORT}`);
  });
}

module.exports = app;
