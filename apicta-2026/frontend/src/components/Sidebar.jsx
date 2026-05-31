import React from 'react';
import { 
  Users, 
  Shield, 
  UserCheck, 
  Trophy, 
  Briefcase, 
  BarChart3, 
  Settings, 
  FileText, 
  QrCode 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const menuItems = [
  { id: 'exco-registration', label: 'EXCO Registration', icon: Users },
  { id: 'jury-registration', label: 'Jury Registration', icon: Shield },
  { id: 'official-registration', label: 'Official Registration', icon: UserCheck },
  { id: 'participant-registration', label: 'Participant Registration', icon: Trophy },
  { id: 'ec-committee', label: 'EC Committee', icon: Briefcase },
  { id: 'executive-dashboard', label: 'Executive Dashboard', icon: BarChart3 },
  { id: 'operational-dashboard', label: 'Operational Dashboard', icon: Settings },
  { id: 'registrations', label: 'Registrations', icon: FileText },
  { id: 'accreditation', label: 'Accreditation & QR', icon: QrCode },
];

const Sidebar = () => {
  const { currentPage, setCurrentPage } = useApp();

  return (
    <aside className="w-64 bg-primary text-white min-h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">APICTA 2026</h1>
            <p className="text-xs text-blue-300">Jakarta</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800">
        <p className="text-xs text-blue-300 text-center">
          Smart EventTech Platform
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
