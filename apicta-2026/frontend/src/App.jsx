import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import ExcoRegistration from './pages/ExcoRegistration';
import JuryRegistration from './pages/JuryRegistration';
import OfficialRegistration from './pages/OfficialRegistration';
import ParticipantRegistration from './pages/ParticipantRegistration';
import ECCommittee from './pages/ECCommittee';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import OperationalDashboard from './pages/OperationalDashboard';
import Registrations from './pages/Registrations';
import Accreditation from './pages/Accreditation';

const App = () => {
  const { currentPage, notifications, removeNotification } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'exco-registration':
        return <ExcoRegistration />;
      case 'jury-registration':
        return <JuryRegistration />;
      case 'official-registration':
        return <OfficialRegistration />;
      case 'participant-registration':
        return <ParticipantRegistration />;
      case 'ec-committee':
        return <ECCommittee />;
      case 'executive-dashboard':
        return <ExecutiveDashboard />;
      case 'operational-dashboard':
        return <OperationalDashboard />;
      case 'registrations':
        return <Registrations />;
      case 'accreditation':
        return <Accreditation />;
      default:
        return <ExcoRegistration />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-primary capitalize">
            {currentPage.replace(/-/g, ' ')}
          </h2>
          <p className="text-gray-600 mt-2">
            APICTA 2026 Jakarta Smart Registration Platform
          </p>
        </header>

        {/* Page Content */}
        {renderPage()}
      </main>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-6 py-4 rounded-lg shadow-lg text-white cursor-pointer transition-all duration-300 ${
              notification.type === 'success' ? 'bg-green-600' :
              notification.type === 'error' ? 'bg-red-600' :
              'bg-blue-600'
            }`}
            onClick={() => removeNotification(notification.id)}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
