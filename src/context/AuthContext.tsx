import React, { createContext, useContext, useState } from 'react';
import { UserRole, Student, Faculty } from '../types';
import { mockStudents, mockFaculty } from '../data/mockData';

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  logout: () => void;
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  currentStudent: Student;
  setCurrentStudent: (s: Student) => void;
  currentFaculty: Faculty;
  setCurrentFaculty: (f: Faculty) => void;
  notificationsCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSessionId: string | null;
  setSelectedSessionId: (id: string | null) => void;
  selectedAttemptId: string | null;
  setSelectedAttemptId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { db } from '../services/db';

const SESSION_KEY = 'verity_session_state';

interface SavedSession {
  role: UserRole;
  activeScreen: string;
  studentId?: string;
  facultyId?: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read initial saved session if available
  const initialSession = ((): SavedSession | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(SESSION_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch {}
    return null;
  })();

  const initialStudents = db.getStudents();
  const initialFacultyList = db.getFacultyList();

  const restoredRole: UserRole = initialSession?.role || 'public';
  const restoredScreen = initialSession?.activeScreen || (restoredRole === 'admin' ? 'admin-dashboard' : restoredRole === 'faculty' ? 'faculty-dashboard' : restoredRole === 'student' ? 'student-dashboard' : 'landing');
  
  const restoredStudent = initialSession?.studentId 
    ? (initialStudents.find(s => s.id === initialSession.studentId) || initialStudents[0]) 
    : initialStudents[0];

  const restoredFaculty = initialSession?.facultyId 
    ? (initialFacultyList.find(f => f.id === initialSession.facultyId) || initialFacultyList[0]) 
    : initialFacultyList[0];

  const [role, setRoleState] = useState<UserRole>(restoredRole);
  const [activeScreen, setActiveScreenState] = useState<string>(restoredScreen);
  const [currentStudent, setCurrentStudentState] = useState<Student>(restoredStudent || mockStudents[0]);
  const [currentFaculty, setCurrentFacultyState] = useState<Faculty>(restoredFaculty || mockFaculty);
  const [notificationsCount] = useState<number>(3);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>('sess_1001');
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>('VATT-2026-981');

  const saveSession = (
    updatedRole: UserRole, 
    updatedScreen: string, 
    stdId?: string, 
    facId?: string
  ) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (updatedRole === 'public') {
          window.localStorage.removeItem(SESSION_KEY);
        } else {
          const payload: SavedSession = {
            role: updatedRole,
            activeScreen: updatedScreen,
            studentId: stdId || currentStudent?.id,
            facultyId: facId || currentFaculty?.id
          };
          window.localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
        }
      }
    } catch {}
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    let targetScreen = 'landing';
    if (newRole === 'student') targetScreen = 'student-dashboard';
    else if (newRole === 'faculty') targetScreen = 'faculty-dashboard';
    else if (newRole === 'admin') targetScreen = 'admin-dashboard';
    
    setActiveScreenState(targetScreen);
    saveSession(newRole, targetScreen);
  };

  const setActiveScreen = (screen: string) => {
    setActiveScreenState(screen);
    saveSession(role, screen);
  };

  const setCurrentStudent = (s: Student) => {
    setCurrentStudentState(s);
    saveSession(role, activeScreen, s.id, currentFaculty?.id);
  };

  const setCurrentFaculty = (f: Faculty) => {
    setCurrentFacultyState(f);
    saveSession(role, activeScreen, currentStudent?.id, f.id);
  };

  const logout = () => {
    setRoleState('public');
    setActiveScreenState('landing');
    saveSession('public', 'landing');
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        logout,
        activeScreen,
        setActiveScreen,
        currentStudent,
        setCurrentStudent,
        currentFaculty,
        setCurrentFaculty,
        notificationsCount,
        searchQuery,
        setSearchQuery,
        selectedSessionId,
        setSelectedSessionId,
        selectedAttemptId,
        setSelectedAttemptId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
