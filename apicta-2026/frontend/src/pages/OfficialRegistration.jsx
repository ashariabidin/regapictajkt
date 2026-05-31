import React, { useState } from 'react';
import { registrationService } from '../services/api';
import { useApp } from '../context/AppContext';

const OfficialRegistration = () => {
  const { addNotification } = useApp();
  const [formData, setFormData] = useState({
    full_name: '',
    country: '',
    delegation_name: '',
    role: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const roles = ['Country Official', 'Liaison Officer', 'Media Official', 'Technical Official'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.country || !formData.role || !formData.email) {
      addNotification('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await registrationService.registerOfficial(formData);
      addNotification('Official registration successful!', 'success');
      setFormData({
        full_name: '',
        country: '',
        delegation_name: '',
        role: '',
        email: '',
        phone: '',
      });
    } catch (error) {
      addNotification(error.response?.data?.error || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name*</label>
            <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country*</label>
            <input type="text" name="country" value={formData.country} onChange={handleChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delegation Name</label>
            <input type="text" name="delegation_name" value={formData.delegation_name} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role*</label>
            <select name="role" value={formData.role} onChange={handleChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
              <option value="">Select Role</option>
              {roles.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email*</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone (WhatsApp)</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className={`w-full py-3 px-6 rounded-lg text-white font-medium ${loading ? 'bg-gray-400' : 'bg-accent hover:bg-accent-dark'}`}>
          {loading ? 'Registering...' : 'Register Official'}
        </button>
      </form>
    </div>
  );
};

export default OfficialRegistration;
