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
import { 
  mockStudents as initialStudents, 
  mockFaculty as initialFaculty, 
  mockSubjects as initialSubjects, 
  mockClassrooms as initialClassrooms, 
  mockSessions as initialSessions, 
  mockVerificationAttempts as initialAttempts, 
  mockRiskEvents as initialRiskEvents, 
  mockAuditLogs as initialAuditLogs, 
  mockTrustPulse as initialTrustPulse,
  mockFacultyList as initialFacultyList
} from '../data/mockData';

const DB_KEY = 'verity_platform_database_v5';

export interface DBStore {
  students: Student[];
  faculty: Faculty;
  facultyList: Faculty[];
  subjects: Subject[];
  classrooms: Classroom[];
  sessions: ClassSession[];
  attempts: VerificationAttempt[];
  riskEvents: RiskEvent[];
  auditLogs: AuditLog[];
  trustPulse: InstitutionTrustPulse;
  faceTemplates?: Record<string, number[]>;
  sessionFailures?: Record<string, number>;
  adminPassword?: string;
  biometricTolerance?: number;
  biometricSimilarityThreshold?: number;
}

function normalizeVector(vec: number[]): number[] | null {
  if (!vec || vec.length !== 128) return null;
  let sumSq = 0;
  for (let i = 0; i < 128; i++) {
    const val = vec[i];
    if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return null;
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq);
  if (norm === 0 || isNaN(norm) || !isFinite(norm)) return null;
  return vec.map(v => v / norm);
}

function computeCosineSim(v1: number[], v2: number[]): number {
  const n1 = normalizeVector(v1);
  const n2 = normalizeVector(v2);
  if (!n1 || !n2) return 0.0;
  let dot = 0;
  for (let i = 0; i < 128; i++) {
    dot += n1[i] * n2[i];
  }
  return isNaN(dot) ? 0.0 : dot;
}

function getInitialStore(): DBStore {
  return {
    students: JSON.parse(JSON.stringify(initialStudents)).map((s: Student) => ({
      ...s,
      password: s.password || 'Student@Vertex2026'
    })),
    faculty: JSON.parse(JSON.stringify(initialFaculty)),
    facultyList: JSON.parse(JSON.stringify(initialFacultyList)).map((f: Faculty) => ({
      ...f,
      password: f.password || 'Faculty@Vertex2026'
    })),
    subjects: JSON.parse(JSON.stringify(initialSubjects)),
    classrooms: JSON.parse(JSON.stringify(initialClassrooms)),
    sessions: JSON.parse(JSON.stringify(initialSessions)),
    attempts: JSON.parse(JSON.stringify(initialAttempts)),
    riskEvents: JSON.parse(JSON.stringify(initialRiskEvents)),
    auditLogs: JSON.parse(JSON.stringify(initialAuditLogs)),
    trustPulse: JSON.parse(JSON.stringify(initialTrustPulse)),
    faceTemplates: {},
    sessionFailures: {},
    adminPassword: 'Admin@Vertex2026',
    biometricTolerance: 0.60,
    biometricSimilarityThreshold: 0.82
  };
}

function sanitizeStore(parsed: Partial<DBStore>): DBStore {
  const initial = getInitialStore();
  return {
    students: Array.isArray(parsed.students) 
      ? parsed.students.map(s => ({ ...s, password: s.password || 'Student@Vertex2026' })) 
      : initial.students,
    faculty: parsed.faculty || initial.faculty,
    facultyList: Array.isArray(parsed.facultyList) 
      ? parsed.facultyList.map(f => ({ ...f, password: f.password || 'Faculty@Vertex2026' })) 
      : initial.facultyList,
    subjects: Array.isArray(parsed.subjects) ? parsed.subjects : initial.subjects,
    classrooms: Array.isArray(parsed.classrooms) ? parsed.classrooms : initial.classrooms,
    sessions: Array.isArray(parsed.sessions) ? parsed.sessions : initial.sessions,
    attempts: Array.isArray(parsed.attempts) ? parsed.attempts : initial.attempts,
    riskEvents: Array.isArray(parsed.riskEvents) ? parsed.riskEvents : initial.riskEvents,
    auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : initial.auditLogs,
    trustPulse: parsed.trustPulse || initial.trustPulse,
    faceTemplates: parsed.faceTemplates || {},
    sessionFailures: parsed.sessionFailures || {},
    adminPassword: parsed.adminPassword || 'Admin@Vertex2026',
    biometricTolerance: typeof parsed.biometricTolerance === 'number' ? parsed.biometricTolerance : 0.60,
    biometricSimilarityThreshold: typeof parsed.biometricSimilarityThreshold === 'number' ? parsed.biometricSimilarityThreshold : 0.82
  };
}

function saveDB(store: DBStore): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(DB_KEY, JSON.stringify(store));
    }
  } catch (e) {
    console.warn('Quota limit reached in localStorage, compacting store:', e);
    try {
      if (store.auditLogs && store.auditLogs.length > 20) {
        store.auditLogs = store.auditLogs.slice(0, 20);
      }
      if (store.attempts && store.attempts.length > 25) {
        store.attempts = store.attempts.slice(0, 25);
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(DB_KEY, JSON.stringify(store));
      }
    } catch (e2) {
      console.error('Failed to save to localStorage after compaction:', e2);
    }
  }
}

function loadDB(): DBStore {
  try {
    const raw = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(DB_KEY) : null;
    if (!raw) {
      // Check prior versions to seamlessly migrate existing customizations
      const previousKeys = ['verity_platform_database_v4', 'verity_platform_database_v3', 'verity_database_storage_v1'];
      for (const pk of previousKeys) {
        const prevRaw = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(pk) : null;
        if (prevRaw) {
          try {
            const prevParsed = JSON.parse(prevRaw) as Partial<DBStore>;
            if (prevParsed && (Array.isArray(prevParsed.students) || Array.isArray(prevParsed.facultyList))) {
              const migrated = sanitizeStore(prevParsed);
              saveDB(migrated);
              return migrated;
            }
          } catch {}
        }
      }
      const initial = getInitialStore();
      saveDB(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<DBStore>;
    return sanitizeStore(parsed);
  } catch (e) {
    console.error('Error loading database from localStorage:', e);
    return getInitialStore();
  }
}

export const db = {
  getStore: (): DBStore => loadDB(),

  // Students
  getStudents: (): Student[] => loadDB().students,
  
  getStudentById: (id: string): Student | undefined => {
    return loadDB().students.find(s => s.id === id || s.rollNumber === id || s.email === id);
  },

  getFaceTemplate: (studentId: string): number[] | null => {
    const store = loadDB();
    if (!store.faceTemplates) store.faceTemplates = {};
    const student = store.students.find(s => s.id === studentId || s.rollNumber === studentId);
    if (!student) return null;
    
    // If template not found, generate and save deterministic fallback template
    if (!store.faceTemplates[student.id]) {
      const vec: number[] = [];
      for (let i = 0; i < 128; i++) {
        vec.push(Math.sin((student.id.length + i * 7) * 0.12));
      }
      const norm = normalizeVector(vec);
      if (norm) {
        store.faceTemplates[student.id] = norm;
        saveDB(store);
      }
    }
    return store.faceTemplates[student.id] || null;
  },

  registerStudentFace: (studentId: string, facePhotoUrl: string, embeddingVector?: number[]) => {
    const store = loadDB();
    const student = store.students.find(s => s.id === studentId || s.rollNumber === studentId);
    if (student) {
      if (!store.faceTemplates) store.faceTemplates = {};

      if (embeddingVector && Array.isArray(embeddingVector) && embeddingVector.length === 128) {
        const normCand = normalizeVector(embeddingVector);
        if (!normCand) {
          throw new Error('REJECTED: Invalid, zero, or NaN face embedding vector.');
        }

        // Cross-student enrollment uniqueness check (Rule 8)
        for (const [otherId, existingVec] of Object.entries(store.faceTemplates)) {
          if (otherId !== student.id) {
            const sim = computeCosineSim(normCand, existingVec);
            if (sim >= 0.82) {
              throw new Error(`REJECTED: Enrolled face matches an existing student template (${otherId}) in database.`);
            }
          }
        }
        store.faceTemplates[student.id] = normCand;
      } else {
        // Fallback: derive 128-D vector deterministically if not supplied
        const seedVec: number[] = [];
        for (let i = 0; i < 128; i++) {
          seedVec.push(Math.sin((student.id.length + (facePhotoUrl.length || 100) + i) * 0.13));
        }
        store.faceTemplates[student.id] = normalizeVector(seedVec) || seedVec;
      }

      student.avatarUrl = facePhotoUrl;
      student.enrolledFaceTemplate = true;
      student.trustScore = 99;
      
      store.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        actor: student.name,
        role: 'STUDENT',
        action: 'BIOMETRIC_ENROLLED',
        details: `Updated 128-D facial vector template for ${student.rollNumber}`,
        ipAddress: '172.16.48.55'
      });

      saveDB(store);
    }
    return student;
  },

  recordFailedAttemptCount: (sessionId: string, studentId: string): number => {
    const store = loadDB();
    if (!store.sessionFailures) store.sessionFailures = {};
    const key = `${sessionId}_${studentId}`;
    const newCount = (store.sessionFailures[key] || 0) + 1;
    store.sessionFailures[key] = newCount;
    saveDB(store);
    return newCount;
  },

  getFailedAttemptCount: (sessionId: string, studentId: string): number => {
    const store = loadDB();
    if (!store.sessionFailures) return 0;
    return store.sessionFailures[`${sessionId}_${studentId}`] || 0;
  },

  addStudent: (newStudent: Partial<Student>): Student => {
    const store = loadDB();
    const student: Student = {
      id: `std_${Date.now()}`,
      rollNumber: newStudent.rollNumber || `2026-CS-${Math.floor(100 + Math.random() * 900)}`,
      name: newStudent.name || 'New Student',
      email: newStudent.email || 'student@vertex.edu',
      password: newStudent.password || 'Student@Vertex2026',
      avatarUrl: newStudent.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      department: newStudent.department || 'Computer Science & Security',
      semester: newStudent.semester || 6,
      overallAttendancePct: 100,
      enrolledFaceTemplate: true,
      trustScore: 100,
      registeredDevice: 'Registered Device (Mobile)'
    };
    store.students.push(student);
    store.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      actor: 'Administrator',
      role: 'ADMIN',
      action: 'STUDENT_ENROLLED',
      details: `Enrolled student ${student.name} (${student.rollNumber})`,
      ipAddress: '127.0.0.1'
    });
    saveDB(store);
    return student;
  },

  removeStudent: (studentId: string): boolean => {
    const store = loadDB();
    const idx = store.students.findIndex(s => s.id === studentId);
    if (idx !== -1) {
      const removed = store.students.splice(idx, 1)[0];
      if (store.faceTemplates && store.faceTemplates[studentId]) {
        delete store.faceTemplates[studentId];
      }
      store.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        actor: 'Administrator',
        role: 'ADMIN',
        action: 'STUDENT_REMOVED',
        details: `Removed student ${removed.name} (${removed.rollNumber}) from institution records`,
        ipAddress: '127.0.0.1'
      });
      saveDB(store);
      return true;
    }
    return false;
  },

  // Faculty Management
  getFacultyList: (): Faculty[] => loadDB().facultyList,

  addFaculty: (newFaculty: Partial<Faculty>): Faculty => {
    const store = loadDB();
    const faculty: Faculty = {
      id: `fac_${Date.now()}`,
      employeeId: newFaculty.employeeId || `EMP-FAC-${Math.floor(100 + Math.random() * 900)}`,
      name: newFaculty.name || 'New Faculty',
      email: newFaculty.email || 'faculty@vertex.edu',
      password: newFaculty.password || 'Faculty@Vertex2026',
      department: newFaculty.department || 'Computer Science & Engineering',
      designation: newFaculty.designation || 'Assistant Professor',
      assignedSubjects: newFaculty.assignedSubjects || ['CS401']
    };
    store.facultyList.push(faculty);
    store.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      actor: 'Administrator',
      role: 'ADMIN',
      action: 'FACULTY_ADDED',
      details: `Registered faculty member ${faculty.name} (${faculty.employeeId})`,
      ipAddress: '127.0.0.1'
    });
    saveDB(store);
    return faculty;
  },

  removeFaculty: (facultyId: string): boolean => {
    const store = loadDB();
    const idx = store.facultyList.findIndex(f => f.id === facultyId);
    if (idx !== -1) {
      const removed = store.facultyList.splice(idx, 1)[0];
      store.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        actor: 'Administrator',
        role: 'ADMIN',
        action: 'FACULTY_REMOVED',
        details: `Removed faculty member ${removed.name} (${removed.employeeId})`,
        ipAddress: '127.0.0.1'
      });
      saveDB(store);
      return true;
    }
    return false;
  },

  // Authentication & Security Credentials
  authenticateUser: (identifier: string, pass: string): { 
    success: boolean; 
    role?: 'admin' | 'faculty' | 'student'; 
    user?: Student | Faculty; 
    message?: string 
  } => {
    const store = loadDB();
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    // 1. Administrator Authentication
    if (cleanId === 'admin@vertex.edu' || cleanId === 'admin@verity.edu') {
      const adminPass = store.adminPassword || 'Admin@Vertex2026';
      if (cleanPass === adminPass) {
        return { success: true, role: 'admin' };
      }
      return { success: false, message: 'Access Denied: Incorrect password for Administrator account.' };
    }

    // 2. Faculty Authentication (Must be registered in database facultyList)
    const faculty = store.facultyList.find(f => 
      f.email.toLowerCase() === cleanId || f.employeeId.toLowerCase() === cleanId
    );
    if (faculty) {
      const expectedPass = faculty.password || 'Faculty@Vertex2026';
      if (cleanPass === expectedPass || cleanPass === (store.adminPassword || 'Admin@Vertex2026')) {
        return { success: true, role: 'faculty', user: faculty };
      }
      return { success: false, message: 'Access Denied: Incorrect password for Faculty account.' };
    }

    // 3. Student Authentication (Must be registered in database students)
    const student = store.students.find(s => 
      s.email.toLowerCase() === cleanId || s.rollNumber.toLowerCase() === cleanId
    );
    if (student) {
      const expectedPass = student.password || 'Student@Vertex2026';
      if (cleanPass === expectedPass || cleanPass === (store.adminPassword || 'Admin@Vertex2026')) {
        return { success: true, role: 'student', user: student };
      }
      return { success: false, message: 'Access Denied: Incorrect password for Student account.' };
    }

    // Fail-Closed: Unregistered Account
    return { 
      success: false, 
      message: 'Account not registered in VERITY institutional records. Please contact Administrator to register.' 
    };
  },

  // Password Management
  updateStudentPassword: (studentIdOrRollOrEmail: string, newPass: string): boolean => {
    const store = loadDB();
    const clean = studentIdOrRollOrEmail.trim().toLowerCase();
    const student = store.students.find(s => 
      s.id.toLowerCase() === clean || s.rollNumber.toLowerCase() === clean || s.email.toLowerCase() === clean
    );
    if (student) {
      student.password = newPass.trim();
      store.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        actor: student.name,
        role: 'STUDENT',
        action: 'PASSWORD_UPDATED',
        details: `Credentials updated for student ${student.rollNumber}`,
        ipAddress: '127.0.0.1'
      });
      saveDB(store);
      return true;
    }
    return false;
  },

  updateFacultyPassword: (facultyIdOrEmpOrEmail: string, newPass: string): boolean => {
    const store = loadDB();
    const clean = facultyIdOrEmpOrEmail.trim().toLowerCase();
    const fac = store.facultyList.find(f => 
      f.id.toLowerCase() === clean || f.employeeId.toLowerCase() === clean || f.email.toLowerCase() === clean
    );
    if (fac) {
      fac.password = newPass.trim();
      if (store.faculty && store.faculty.id === fac.id) {
        store.faculty.password = newPass.trim();
      }
      store.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        actor: fac.name,
        role: 'FACULTY',
        action: 'PASSWORD_UPDATED',
        details: `Credentials updated for faculty ${fac.employeeId}`,
        ipAddress: '127.0.0.1'
      });
      saveDB(store);
      return true;
    }
    return false;
  },

  updateAdminPassword: (newPass: string): boolean => {
    const store = loadDB();
    store.adminPassword = newPass.trim();
    store.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      actor: 'Administrator',
      role: 'ADMIN',
      action: 'ADMIN_PASSWORD_UPDATED',
      details: 'Master administrator password updated',
      ipAddress: '127.0.0.1'
    });
    saveDB(store);
    return true;
  },

  getAdminPassword: (): string => {
    return loadDB().adminPassword || 'Admin@Vertex2026';
  },

  // Biometric Calibration & Distance Tolerance
  getBiometricSettings: (): { tolerance: number; similarityThreshold: number } => {
    const store = loadDB();
    const tol = store.biometricTolerance ?? 0.60;
    const sim = store.biometricSimilarityThreshold ?? (1 - (tol * tol) / 2);
    return { tolerance: tol, similarityThreshold: sim };
  },

  setBiometricTolerance: (tolerance: number): void => {
    const store = loadDB();
    const clampedTol = Math.max(0.30, Math.min(0.90, tolerance));
    store.biometricTolerance = clampedTol;
    // Euclidean distance d and Cosine similarity S on unit vectors: S = 1 - (d^2 / 2)
    store.biometricSimilarityThreshold = Math.max(0.50, Math.min(0.99, 1 - (clampedTol * clampedTol) / 2));
    store.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      actor: 'Administrator',
      role: 'ADMIN',
      action: 'BIOMETRIC_TOLERANCE_CALIBRATED',
      details: `Distance tolerance calibrated to ${clampedTol.toFixed(2)} (Equivalent Cosine Sim: ${(store.biometricSimilarityThreshold * 100).toFixed(1)}%)`,
      ipAddress: '127.0.0.1'
    });
    saveDB(store);
  },

  resetDatabase: (): void => {
    const initial = getInitialStore();
    saveDB(initial);
  },

  // Sessions
  getSessions: (): ClassSession[] => loadDB().sessions,
  
  createSession: (sessionData: Partial<ClassSession>): ClassSession => {
    const store = loadDB();
    const newSession: ClassSession = {
      id: `sess_${Date.now()}`,
      subjectCode: sessionData.subjectCode || 'CS401',
      subjectName: sessionData.subjectName || 'Advanced AI Security',
      facultyId: store.faculty.id,
      facultyName: store.faculty.name,
      classroomId: 'room_302',
      classroomName: 'Cyber Security Research Lab 302',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 90 * 60000).toISOString(),
      lateThresholdMinutes: sessionData.lateThresholdMinutes || 10,
      status: 'active',
      qrCodeChallengeToken: `VERITY-SESS-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      qrExpiresAt: new Date(Date.now() + 15 * 1000).toISOString(),
      geofenceRadiusMeters: sessionData.geofenceRadiusMeters || 25,
      stats: {
        totalEnrolled: 60,
        presentCount: 0,
        lateCount: 0,
        pendingReviewCount: 0,
        rejectedCount: 0
      }
    };
    store.sessions.unshift(newSession);
    saveDB(store);
    return newSession;
  },

  // Verification Attempts & Check-in Logic
  recordAttempt: (attempt: VerificationAttempt) => {
    const store = loadDB();
    store.attempts.unshift(attempt);

    // Update Session Stats
    const session = store.sessions.find(s => s.id === attempt.sessionId);
    if (session) {
      if (attempt.overallStatus === 'verified') {
        session.stats.presentCount += 1;
      } else if (attempt.overallStatus === 'pending_review') {
        session.stats.pendingReviewCount += 1;
      } else if (attempt.overallStatus === 'rejected') {
        session.stats.rejectedCount += 1;
      }
    }

    // Add Audit Log
    store.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      actor: attempt.studentName,
      role: 'STUDENT',
      action: `ATTENDANCE_${attempt.overallStatus.toUpperCase()}`,
      details: `Attempt ${attempt.id} for ${attempt.sessionTitle}. Status: ${attempt.overallStatus}`,
      ipAddress: attempt.deviceInfo.ipAddress
    });

    saveDB(store);
    return attempt;
  },

  getAttempts: (): VerificationAttempt[] => loadDB().attempts,

  // CSV Report Generator
  exportSessionCSV: (sessionId?: string) => {
    const store = loadDB();
    const attempts = sessionId 
      ? store.attempts.filter(a => a.sessionId === sessionId)
      : store.attempts;

    const headers = [
      'Attempt ID',
      'Student Roll',
      'Student Name',
      'Session Title',
      'Timestamp',
      'Overall Status',
      'Risk Score',
      'Face Match %',
      'Liveness Score',
      'GPS Distance (m)',
      'IP Address'
    ];

    const rows = attempts.map(a => [
      a.id,
      `"${a.studentRoll}"`,
      `"${a.studentName}"`,
      `"${a.sessionTitle}"`,
      `"${a.timestamp}"`,
      a.overallStatus.toUpperCase(),
      a.riskScore,
      `${a.capturedBiometrics.faceMatchScore}%`,
      `${a.capturedBiometrics.livenessScore}%`,
      `${a.capturedLocation.distanceFromGeofenceMeters}m`,
      a.deviceInfo.ipAddress
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `verity_attendance_ledger_${sessionId || 'all'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
