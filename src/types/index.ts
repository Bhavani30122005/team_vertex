export type UserRole = 'public' | 'student' | 'faculty' | 'admin';

export type VerificationStageId = 
  | 'account' 
  | 'session_challenge' 
  | 'face_match' 
  | 'liveness' 
  | 'location' 
  | 'time_duplicate' 
  | 'complete';

export type VerificationStatus = 'verified' | 'rejected' | 'pending_review' | 'incomplete';

export interface VerificationStage {
  id: VerificationStageId;
  name: string;
  iconName: string;
  status: 'passed' | 'failed' | 'processing' | 'pending' | 'warning';
  explanation: string;
  completionTimeMs?: number;
  failureReason?: string;
  metrics?: {
    confidenceScore?: number;
    gpsDistanceMeters?: number;
    livenessScore?: number;
    tokenAgeSeconds?: number;
  };
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  avatarUrl: string;
  department: string;
  semester: number;
  overallAttendancePct: number;
  enrolledFaceTemplate: boolean;
  trustScore: number; // 0 - 100
  registeredDevice: string;
  password?: string;
}

export interface Faculty {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  assignedSubjects: string[];
  password?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  totalClasses: number;
  facultyName: string;
}

export interface Classroom {
  id: string;
  code: string;
  name: string;
  building: string;
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
  wifiBssid?: string;
}

export interface ClassSession {
  id: string;
  subjectCode: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  classroomId: string;
  classroomName: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  lateThresholdMinutes: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  qrCodeChallengeToken: string;
  qrExpiresAt: string;
  geofenceRadiusMeters: number;
  stats: {
    totalEnrolled: number;
    presentCount: number;
    lateCount: number;
    pendingReviewCount: number;
    rejectedCount: number;
  };
}

export interface VerificationAttempt {
  id: string;
  sessionId: string;
  sessionTitle: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  timestamp: string;
  overallStatus: VerificationStatus;
  riskScore: number; // 0 - 100
  explainableRiskFactors: string[];
  stages: VerificationStage[];
  capturedLocation: {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    distanceFromGeofenceMeters: number;
  };
  capturedBiometrics: {
    faceMatchScore: number; // 0 - 100%
    livenessScore: number; // 0 - 100%
    livenessMotionDetected: string;
  };
  deviceInfo: {
    ipAddress: string;
    userAgent: string;
    deviceId: string;
  };
  facultyReview?: {
    reviewedBy: string;
    reviewedAt: string;
    action: 'approved' | 'rejected';
    mandatoryReason: string;
  };
}

export interface RiskEvent {
  id: string;
  attemptId: string;
  studentName: string;
  studentRoll: string;
  subjectName: string;
  timestamp: string;
  riskLevel: 'high' | 'medium' | 'low';
  riskScore: number;
  primaryFlag: string;
  status: 'unresolved' | 'approved' | 'rejected';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
}

export interface InstitutionTrustPulse {
  completedSessionsToday: number;
  totalCheckInsToday: number;
  overallSuccessRate: number; // percentage
  averageVerificationTimeSec: number;
  unresolvedRiskAlerts: number;
  activeSecurityNodes: number;
  systemHealth: {
    faceRecognitionService: 'operational' | 'degraded' | 'offline';
    geofenceEngine: 'operational' | 'degraded' | 'offline';
    tokenValidator: 'operational' | 'degraded' | 'offline';
    dbCluster: 'operational' | 'degraded' | 'offline';
  };
}
