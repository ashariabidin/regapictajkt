import React, { useState, useEffect } from 'react';
import { dashboardService, accreditationService } from '../services/api';
import { useApp } from '../context/AppContext';

const OperationalDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const { addNotification } = useApp();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await dashboardService.getOperationalDashboard();
      setData(result);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncVerification = async () => {
    setVerifying(true);
    try {
      const result = await accreditationService.syncVerification();
      addNotification(result.message, 'success');
    } catch (error) {
      addNotification('Verification failed', 'error');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!data) return <div className="text-center py-12 text-red-600">Failed to load data</div>;

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <h3 className="text-gray-600 text-sm font-medium">Pending Approvals</h3>
          <p className="text-3xl font-bold text-primary mt-2">{data.metrics.pending_approvals}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <h3 className="text-gray-600 text-sm font-medium">Missing Documents</h3>
          <p className="text-3xl font-bold text-primary mt-2">{data.metrics.missing_documents}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-gray-600 text-sm font-medium">Arrivals Confirmed</h3>
          <p className="text-3xl font-bold text-primary mt-2">{data.metrics.arrivals_confirmed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-600 text-sm font-medium">Venue Utilization</h3>
          <p className="text-3xl font-bold text-primary mt-2">{data.metrics.venue_utilization}%</p>
        </div>
      </div>

      {/* Operational Workflow */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-primary">Operational Workflow & Session Tracker</h3>
          <button
            onClick={handleSyncVerification}
            disabled={verifying}
            className={`px-6 py-2 rounded-lg text-white font-medium ${
              verifying ? 'bg-gray-400' : 'bg-accent hover:bg-accent-dark'
            }`}
          >
            {verifying ? 'Verifying...' : 'Sync Verification (AI)'}
          </button>
        </div>
        
        <div className="space-y-4">
          {data.workflow.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  item.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="font-medium text-gray-800">{item.task}</span>
              </div>
              <span className="text-gray-600">{item.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bars */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Progress Overview</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Registration Completion</span>
              <span className="text-gray-600">78%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-accent h-3 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Document Verification</span>
              <span className="text-gray-600">65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-500 h-3 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Accreditation Ready</span>
              <span className="text-gray-600">92%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalDashboard;
