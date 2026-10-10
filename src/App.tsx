import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { PublicLandingPage } from './components/screens/PublicLandingPage';
import { AuthScreen } from './components/screens/AuthScreen';
import { AdminDashboard } from './components/screens/AdminDashboard';
import { FacultyDashboard } from './components/screens/FacultyDashboard';
import { StudentMobileDashboard } from './components/screens/StudentMobileDashboard';
import { VerificationExperience } from './components/screens/VerificationExperience';
import { InvestigationCenter } from './components/screens/InvestigationCenter';
import { AnalyticsReports } from './components/screens/AnalyticsReports';
import { StudentHistory } from './components/screens/StudentHistory';
import { AdminSecurity } from './components/screens/AdminSecurity';

const MainAppContent: React.FC = () => {
  const { role, activeScreen } = useAuth();

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'landing':
        return <PublicLandingPage />;
      case 'auth':
        return <AuthScreen />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'faculty-dashboard':
        return <FacultyDashboard />;
      case 'student-dashboard':
        return <StudentMobileDashboard />;
      case 'verification-experience':
        return <VerificationExperience />;
      case 'investigation-center':
        return <InvestigationCenter />;
      case 'analytics':
        return <AnalyticsReports />;
      case 'student-history':
        return <StudentHistory />;
      case 'admin-security':
        return <AdminSecurity />;
      default:
        return <PublicLandingPage />;
    }
  };

  const isFullBleedPage = activeScreen === 'landing' || activeScreen === 'auth' || (role === 'student' && activeScreen === 'student-dashboard');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      <div className="flex-1 flex w-full">
        {!isFullBleedPage && role !== 'public' && <Sidebar />}

        <main className="flex-1 w-full overflow-x-hidden">
          {renderActiveScreen()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
