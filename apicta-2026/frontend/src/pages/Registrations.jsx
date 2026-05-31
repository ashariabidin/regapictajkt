import React, { useState, useEffect } from 'react';
import { registrationService, accreditationService } from '../services/api';
import { useApp } from '../context/AppContext';
import QRCode from 'qrcode.react';

const Registrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [selectedReg, setSelectedReg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const { addNotification } = useApp();

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const data = await registrationService.getAllRegistrations();
      setRegistrations(data);
    } catch (error) {
      addNotification('Failed to load registrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (reg) => {
    setSelectedReg(reg);
    try {
      const qrResult = await accreditationService.getQRCode(reg.id);
      setQrData(qrResult.qr_code);
    } catch (error) {
      setQrData(null);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await registrationService.updateStatus(id, status);
      addNotification(`Status updated to ${status}`, 'success');
      loadRegistrations();
      if (selectedReg && selectedReg.id === id) {
        setSelectedReg({ ...selectedReg, status });
      }
    } catch (error) {
      addNotification('Failed to update status', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      exco: 'EXCO',
      jury: 'Jury',
      official: 'Official',
      participant: 'Participant',
      committee: 'Committee'
    };
    return labels[type] || type;
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-primary">Recent Registrations</h3>
          <button onClick={loadRegistrations} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-800">
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {registrations.map((reg) => (
                <tr 
                  key={reg.id} 
                  onClick={() => handleRowClick(reg)}
                  className={`cursor-pointer hover:bg-gray-50 ${selectedReg?.id === reg.id ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4 text-sm text-gray-900">{reg.reference}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{reg.full_name || reg.team_name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{getTypeLabel(reg.registration_type)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(reg.status)}`}>{reg.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(reg.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Detail */}
      {selectedReg && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Registration Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Reference</p>
              <p className="font-medium">{selectedReg.reference}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{getTypeLabel(selectedReg.registration_type)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <select 
                value={selectedReg.status} 
                onChange={(e) => handleStatusUpdate(selectedReg.id, e.target.value)}
                className="mt-1 px-3 py-1 border rounded"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium">{new Date(selectedReg.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Full Name / Team</p>
              <p className="font-medium">{selectedReg.full_name || selectedReg.team_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{selectedReg.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Country</p>
              <p className="font-medium">{selectedReg.country || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Organization/Role</p>
              <p className="font-medium">{selectedReg.organization || selectedReg.role || selectedReg.category || 'N/A'}</p>
            </div>
          </div>
          
          {selectedReg.special_requests && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Notes / Special Requests</p>
              <p className="font-medium">{selectedReg.special_requests}</p>
            </div>
          )}

          {/* Attachments */}
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Attachments</p>
            <div className="flex space-x-4">
              {selectedReg.executive_summary_path && (
                <span className="px-3 py-1 bg-gray-100 rounded text-sm">Executive Summary</span>
              )}
              {selectedReg.pitch_deck_path && (
                <span className="px-3 py-1 bg-gray-100 rounded text-sm">Pitch Deck</span>
              )}
              {!selectedReg.executive_summary_path && !selectedReg.pitch_deck_path && (
                <span className="text-gray-400 text-sm">No attachments</span>
              )}
            </div>
          </div>

          {/* Raw Payload */}
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Raw Payload (JSON)</p>
            <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto max-h-48">
              {JSON.stringify(JSON.parse(selectedReg.raw_payload || '{}'), null, 2)}
            </pre>
          </div>

          {/* QR Code */}
          {qrData && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-500 mb-2">QR Code</p>
              <div className="inline-block p-2 bg-white rounded">
                <img src={qrData} alt="QR Code" className="w-32 h-32" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Registrations;
