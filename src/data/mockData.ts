import { 
  Student, 
  Faculty, 
  Subject, 
  Classroom, 
  ClassSession, 
  VerificationAttempt, 
  RiskEvent, 
  AuditLog, 
  InstitutionTrustPulse 
} from '../types';

export const mockTrustPulse: InstitutionTrustPulse = {
  completedSessionsToday: 42,
  totalCheckInsToday: 1845,
  overallSuccessRate: 97.4,
  averageVerificationTimeSec: 2.1,
  unresolvedRiskAlerts: 3,
  activeSecurityNodes: 18,
  systemHealth: {
    faceRecognitionService: 'operational',
    geofenceEngine: 'operational',
    tokenValidator: 'operational',
    dbCluster: 'operational'
  }
};

export const mockStudents: Student[] = [
  {
    id: 'std_1',
    rollNumber: '2026-CS-042',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@vertex.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & Security',
    semester: 6,
    overallAttendancePct: 94.2,
    enrolledFaceTemplate: true,
    trustScore: 98,
    registeredDevice: 'iPhone 15 Pro (iOS 18.1)',
    password: 'Student@Vertex2026'
  },
  {
    id: 'std_2',
    rollNumber: '2026-CS-088',
    name: 'Priya Patel',
    email: 'priya.patel@vertex.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & Security',
    semester: 6,
    overallAttendancePct: 88.5,
    enrolledFaceTemplate: true,
    trustScore: 95,
    registeredDevice: 'Samsung Galaxy S24 (Android 15)',
    password: 'Student@Vertex2026'
  },
  {
    id: 'std_3',
    rollNumber: '2026-CS-102',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@vertex.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Cybersecurity Engineering',
    semester: 6,
    overallAttendancePct: 71.0,
    enrolledFaceTemplate: true,
    trustScore: 82,
    registeredDevice: 'Google Pixel 9 (Android 15)',
    password: 'Student@Vertex2026'
  },
  {
    id: 'std_4',
    rollNumber: '2026-CS-119',
    name: 'Bhavani S.',
    email: 'bhavani.s@vertex.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & Security',
    semester: 6,
    overallAttendancePct: 96.8,
    enrolledFaceTemplate: true,
    trustScore: 99,
    registeredDevice: 'OnePlus 12 (Android 14)',
    password: 'Student@Vertex2026'
  }
];

export const mockFaculty: Faculty = {
  id: 'fac_101',
  employeeId: 'EMP-FAC-992',
  name: 'Dr. Rajesh Kumar',
  email: 'rajesh.kumar@vertex.edu',
  department: 'Computer Science & Engineering',
  designation: 'Professor & Head of Security Analytics',
  assignedSubjects: ['CS401', 'CS408'],
  password: 'Faculty@Vertex2026'
};

export const mockFacultyList: Faculty[] = [
  {
    id: 'fac_101',
    employeeId: 'EMP-FAC-992',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@vertex.edu',
    department: 'Computer Science & Engineering',
    designation: 'Professor & Head of Security Analytics',
    assignedSubjects: ['CS401', 'CS408'],
    password: 'Faculty@Vertex2026'
  },
  {
    id: 'fac_102',
    employeeId: 'EMP-FAC-881',
    name: 'Prof. Ananya Sen',
    email: 'ananya.sen@vertex.edu',
    department: 'Cybersecurity Engineering',
    designation: 'Associate Professor',
    assignedSubjects: ['CS412'],
    password: 'Faculty@Vertex2026'
  },
  {
    id: 'fac_103',
    employeeId: 'EMP-FAC-774',
    name: 'Dr. Vikram Reddy',
    email: 'vikram.reddy@vertex.edu',
    department: 'Artificial Intelligence',
    designation: 'Assistant Professor',
    assignedSubjects: ['CS405'],
    password: 'Faculty@Vertex2026'
  }
];

export const mockSubjects: Subject[] = [
  {
    id: 'subj_1',
    code: 'CS401',
    name: 'Advanced AI & Biometric Security',
    department: 'Computer Science',
    totalClasses: 36,
    facultyName: 'Dr. Rajesh Kumar'
  },
  {
    id: 'subj_2',
    code: 'CS408',
    name: 'Distributed Systems & Cryptography',
    department: 'Computer Science',
    totalClasses: 40,
    facultyName: 'Dr. Rajesh Kumar'
  },
  {
    id: 'subj_3',
    code: 'CS412',
    name: 'Network Threat Intelligence',
    department: 'Cybersecurity',
    totalClasses: 32,
    facultyName: 'Prof. Ananya Sen'
  }
];

export const mockClassrooms: Classroom[] = [
  {
    id: 'room_302',
    code: 'LAB-302',
    name: 'Cyber Security Research Lab 302',
    building: 'Alan Turing Science Block',
    latitude: 12.9716,
    longitude: 77.5946,
    allowedRadiusMeters: 25,
    wifiBssid: 'ac:8b:a9:44:12:ef'
  },
  {
    id: 'room_401',
    code: 'AUD-401',
    name: 'Turing Auditorium 401',
    building: 'Main Academic Complex',
    latitude: 12.9720,
    longitude: 77.5950,
    allowedRadiusMeters: 50
  }
];

export const mockSessions: ClassSession[] = [
  {
    id: 'sess_1001',
    subjectCode: 'CS401',
    subjectName: 'Advanced AI & Biometric Security',
    facultyId: 'fac_101',
    facultyName: 'Dr. Rajesh Kumar',
    classroomId: 'room_302',
    classroomName: 'Cyber Security Research Lab 302',
    startTime: '2026-10-10T10:00:00Z',
    endTime: '2026-10-10T11:30:00Z',
    lateThresholdMinutes: 10,
    status: 'active',
    qrCodeChallengeToken: 'VERITY-SESS-9938-X7K',
    qrExpiresAt: '2026-10-10T10:15:00Z',
    geofenceRadiusMeters: 25,
    stats: {
      totalEnrolled: 60,
      presentCount: 52,
      lateCount: 3,
      pendingReviewCount: 2,
      rejectedCount: 1
    }
  },
  {
    id: 'sess_1002',
    subjectCode: 'CS408',
    subjectName: 'Distributed Systems & Cryptography',
    facultyId: 'fac_101',
    facultyName: 'Dr. Rajesh Kumar',
    classroomId: 'room_401',
    classroomName: 'Turing Auditorium 401',
    startTime: '2026-10-10T14:00:00Z',
    endTime: '2026-10-10T15:30:00Z',
    lateThresholdMinutes: 15,
    status: 'upcoming',
    qrCodeChallengeToken: 'VERITY-SESS-7721-P9M',
    qrExpiresAt: '2026-10-10T14:15:00Z',
    geofenceRadiusMeters: 50,
    stats: {
      totalEnrolled: 120,
      presentCount: 0,
      lateCount: 0,
      pendingReviewCount: 0,
      rejectedCount: 0
    }
  }
];

export const mockVerificationAttempts: VerificationAttempt[] = [
  {
    id: 'VATT-2026-981',
    sessionId: 'sess_1001',
    sessionTitle: 'CS401: Advanced AI Security',
    studentId: 'std_3',
    studentName: 'Rohan Mehta',
    studentRoll: '2026-CS-102',
    timestamp: '2026-10-10T10:08:22Z',
    overallStatus: 'pending_review',
    riskScore: 68,
    explainableRiskFactors: [
      'GPS distance (42m) exceeded classroom radius boundary (25m)',
      'High face match confidence (97.4%) but geofence anomaly flagged'
    ],
    stages: [
      {
        id: 'account',
        name: 'Account & Enrolment',
        iconName: 'UserCheck',
        status: 'passed',
        explanation: 'Enrolled face template vector active and verified',
        completionTimeMs: 120
      },
      {
        id: 'session_challenge',
        name: 'Session Token Challenge',
        iconName: 'Key',
        status: 'passed',
        explanation: 'Signed QR challenge token valid (Age: 4.2s)',
        completionTimeMs: 180,
        metrics: { tokenAgeSeconds: 4.2 }
      },
      {
        id: 'face_match',
        name: 'Face Identity Match',
        iconName: 'Scan',
        status: 'passed',
        explanation: 'Vector similarity match 97.4% (Threshold 85%)',
        completionTimeMs: 420,
        metrics: { confidenceScore: 97.4 }
      },
      {
        id: 'liveness',
        name: 'Liveness Challenge',
        iconName: 'ShieldCheck',
        status: 'passed',
        explanation: 'Randomized 3D eye tracking and gesture completed',
        completionTimeMs: 650,
        metrics: { livenessScore: 94.1 }
      },
      {
        id: 'location',
        name: 'Location & Geofence Validation',
        iconName: 'MapPin',
        status: 'warning',
        explanation: 'User is 42 meters from Lab 302 center (Allowed: 25m)',
        completionTimeMs: 310,
        failureReason: 'Outside boundary polygon. May be in hallway or adjacent lab.',
        metrics: { gpsDistanceMeters: 42 }
      },
      {
        id: 'time_duplicate',
        name: 'Temporal & Anti-Replay Check',
        iconName: 'Clock',
        status: 'passed',
        explanation: 'Unique session nonce consumed. No duplicate device check-in.',
        completionTimeMs: 90
      }
    ],
    capturedLocation: {
      latitude: 12.9721,
      longitude: 77.5952,
      accuracyMeters: 4.8,
      distanceFromGeofenceMeters: 42
    },
    capturedBiometrics: {
      faceMatchScore: 97.4,
      livenessScore: 94.1,
      livenessMotionDetected: 'Head turn left + double blink'
    },
    deviceInfo: {
      ipAddress: '172.16.48.109',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X)',
      deviceId: 'DEV-F892-IPHONE'
    }
  },
  {
    id: 'VATT-2026-980',
    sessionId: 'sess_1001',
    sessionTitle: 'CS401: Advanced AI Security',
    studentId: 'std_1',
    studentName: 'Aarav Sharma',
    studentRoll: '2026-CS-042',
    timestamp: '2026-10-10T10:04:15Z',
    overallStatus: 'verified',
    riskScore: 2,
    explainableRiskFactors: [],
    stages: [
      { id: 'account', name: 'Account & Enrolment', iconName: 'UserCheck', status: 'passed', explanation: 'Active enrolment verified', completionTimeMs: 110 },
      { id: 'session_challenge', name: 'Session Token', iconName: 'Key', status: 'passed', explanation: 'Token fresh', completionTimeMs: 140 },
      { id: 'face_match', name: 'Face Identity Match', iconName: 'Scan', status: 'passed', explanation: 'Similarity 99.2%', completionTimeMs: 380, metrics: { confidenceScore: 99.2 } },
      { id: 'liveness', name: 'Liveness Challenge', iconName: 'ShieldCheck', status: 'passed', explanation: 'Passed 3D depth check', completionTimeMs: 510, metrics: { livenessScore: 98.0 } },
      { id: 'location', name: 'Location Validation', iconName: 'MapPin', status: 'passed', explanation: 'Inside Lab 302 (Distance: 6.2m)', completionTimeMs: 220, metrics: { gpsDistanceMeters: 6.2 } },
      { id: 'time_duplicate', name: 'Temporal Check', iconName: 'Clock', status: 'passed', explanation: 'Check-in on time', completionTimeMs: 80 }
    ],
    capturedLocation: { latitude: 12.9716, longitude: 77.5946, accuracyMeters: 2.1, distanceFromGeofenceMeters: 6.2 },
    capturedBiometrics: { faceMatchScore: 99.2, livenessScore: 98.0, livenessMotionDetected: 'Blink twice' },
    deviceInfo: { ipAddress: '172.16.48.55', userAgent: 'Mozilla/5.0 (iPhone)', deviceId: 'DEV-A991' }
  }
];

export const mockRiskEvents: RiskEvent[] = [
  {
    id: 'RISK-4091',
    attemptId: 'VATT-2026-981',
    studentName: 'Rohan Mehta',
    studentRoll: '2026-CS-102',
    subjectName: 'CS401: Advanced AI Security',
    timestamp: '2026-10-10 10:08 AM',
    riskLevel: 'medium',
    riskScore: 68,
    primaryFlag: 'Geofence Radius Mismatch (42m vs 25m limit)',
    status: 'unresolved'
  },
  {
    id: 'RISK-4089',
    attemptId: 'VATT-2026-972',
    studentName: 'Siddharth V.',
    studentRoll: '2026-CS-055',
    subjectName: 'CS401: Advanced AI Security',
    timestamp: '2026-10-10 10:02 AM',
    riskLevel: 'high',
    riskScore: 89,
    primaryFlag: 'Liveness Score Low (Screen playback anti-spoofing trigger)',
    status: 'unresolved'
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'LOG-8821',
    timestamp: '2026-10-10 10:08:22',
    actor: 'VERITY Core Engine',
    role: 'SYSTEM',
    action: 'FLAG_VERIFICATION_REVIEW',
    details: 'Attempt VATT-2026-981 flagged for manual faculty review due to location variance (42m).',
    ipAddress: '172.16.48.109'
  },
  {
    id: 'LOG-8820',
    timestamp: '2026-10-10 10:04:15',
    actor: 'Aarav Sharma',
    role: 'STUDENT',
    action: 'CHECKIN_VERIFIED',
    details: 'Verified check-in for CS401 in Lab 302. All 6 verification layers passed.',
    ipAddress: '172.16.48.55'
  },
  {
    id: 'LOG-8815',
    timestamp: '2026-10-10 10:00:00',
    actor: 'Dr. Rajesh Kumar',
    role: 'FACULTY',
    action: 'SESSION_STARTED',
    details: 'Initiated active session sess_1001 for CS401 with dynamic QR token VERITY-SESS-9938-X7K.',
    ipAddress: '172.16.40.12'
  }
];
