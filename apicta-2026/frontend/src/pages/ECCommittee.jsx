import React, { useState } from 'react';
import { registrationService } from '../services/api';
import { useApp } from '../context/AppContext';

const ECCommittee = () => {
  const { addNotification } = useApp();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    division: '',
    task_responsibility: '',
    access_level: 'Standard',
  });
  const [loading, setLoading] = useState(false);

  const divisions = ['Secretariat', 'Technical', 'Competition', 'Protocol', 'Hospitality', 'Media', 'Security', 'Venue', 'Transportation'];
  const accessLevels = ['Standard', 'Restricted Ops', 'Full Admin'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.division) {
      addNotification('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await registrationService.registerCommittee(formData);
      addNotification('Committee registration successful!', 'success');
      setFormData({
        full_name: '',
        email: '',
        division: '',
        task_responsibility: '',
        access_level: 'Standard',
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Email*</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Division*</label>
            <select name="division" value={formData.division} onChange={handleChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
              <option value="">Select Division</option>
              {divisions.map(div => <option key={div} value={div}>{div}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
            <select name="access_level" value={formData.access_level} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
              {accessLevels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Task Responsibility</label>
          <textarea name="task_responsibility" value={formData.task_responsibility} onChange={handleChange} rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            placeholder="Describe your responsibilities..." />
        </div>

        <button type="submit" disabled={loading}
          className={`w-full py-3 px-6 rounded-lg text-white font-medium ${loading ? 'bg-gray-400' : 'bg-accent hover:bg-accent-dark'}`}>
          {loading ? 'Registering...' : 'Register Committee'}
        </button>
      </form>
    </div>
  );
};

export default ECCommittee;
