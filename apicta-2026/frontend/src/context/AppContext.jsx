import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('exco-registration');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const refreshRegistrations = async () => {
    // This will be called from components
    // Implementation in the component that needs it
  };

  const value = {
    currentPage,
    setCurrentPage,
    selectedRegistration,
    setSelectedRegistration,
    registrations,
    setRegistrations,
    notifications,
    addNotification,
    removeNotification,
    refreshRegistrations,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
