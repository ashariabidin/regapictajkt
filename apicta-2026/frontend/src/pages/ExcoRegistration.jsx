import React, { useState } from 'react';
import { registrationService } from '../services/api';
import { useApp } from '../context/AppContext';

const ExcoRegistration = () => {
  const { addNotification } = useApp();
  const [formData, setFormData] = useState({
    full_name: '',
    country: '',
    organization: '',
    position: '',
    email: '',
    passport_id: '',
    arrival_date: '',
    special_requests: '',
  });
  const [loading, setLoading] = useState(false);

  const countries = ['Indonesia', 'Malaysia', 'Singapore', 'Thailand', 'Vietnam', 'Australia', 'Japan', 'Others'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.full_name || !formData.country || !formData.email) {
      addNotification('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await registrationService.registerExco(formData);
      addNotification('EXCO registration successful!', 'success');
      setFormData({
        full_name: '',
        country: '',
        organization: '',
        position: '',
        email: '',
        passport_id: '',
        arrival_date: '',
        special_requests: '',
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
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name*
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Enter full name"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country*
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Organization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization
            </label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Enter organization"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Enter position"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email*
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          {/* Passport/ID Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passport/ID Number
            </label>
            <input
              type="text"
              name="passport_id"
              value={formData.passport_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Enter passport or ID number"
            />
          </div>

          {/* Arrival Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arrival Date
            </label>
            <input
              type="date"
              name="arrival_date"
              value={formData.arrival_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requests
          </label>
          <textarea
            name="special_requests"
            value={formData.special_requests}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Diet requirements, accessibility needs, etc."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-colors ${
            loading ? 'bg-gray-400' : 'bg-accent hover:bg-accent-dark'
          }`}
        >
          {loading ? 'Registering...' : 'Register EXCO Delegate'}
        </button>
      </form>
    </div>
  );
};

export default ExcoRegistration;
