import React, { useState } from 'react';
import { registrationService } from '../services/api';
import { useApp } from '../context/AppContext';

const JuryRegistration = () => {
  const { addNotification } = useApp();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    country: '',
    expertise: [],
    conflict_of_interest: false,
    nda_agreed: false,
    availability_window: '',
  });
  const [loading, setLoading] = useState(false);

  const expertiseOptions = [
    'AI/ML',
    'Software Engineering',
    'Hardware/IoT',
    'Cybersecurity',
    'Digital Media'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleExpertiseChange = (option) => {
    const currentExpertise = formData.expertise;
    if (currentExpertise.includes(option)) {
      setFormData({ 
        ...formData, 
        expertise: currentExpertise.filter(e => e !== option) 
      });
    } else {
      setFormData({ 
        ...formData, 
        expertise: [...currentExpertise, option] 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email) {
      addNotification('Please fill in all required fields', 'error');
      return;
    }

    if (!formData.nda_agreed) {
      addNotification('You must agree to NDA & Scoring Ethics', 'error');
      return;
    }

    setLoading(true);
    try {
      await registrationService.registerJury({
        ...formData,
        expertise: formData.expertise.join(','),
        conflict_of_interest: formData.conflict_of_interest.toString(),
        nda_agreed: formData.nda_agreed.toString()
      });
      addNotification('Jury registration successful!', 'success');
      setFormData({
        full_name: '',
        email: '',
        country: '',
        expertise: [],
        conflict_of_interest: false,
        nda_agreed: false,
        availability_window: '',
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

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Enter country"
            />
          </div>

          {/* Availability Window */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability Window
            </label>
            <input
              type="text"
              name="availability_window"
              value={formData.availability_window}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="e.g., Nov 10-15, 2026"
            />
          </div>
        </div>

        {/* Expertise */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expertise (Multi-select)
          </label>
          <div className="flex flex-wrap gap-3">
            {expertiseOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleExpertiseChange(option)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  formData.expertise.includes(option)
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-accent'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="conflict_of_interest"
              checked={formData.conflict_of_interest}
              onChange={handleChange}
              className="w-5 h-5 text-accent rounded focus:ring-accent"
            />
            <span className="text-gray-700">Conflict of Interest Declaration</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="nda_agreed"
              checked={formData.nda_agreed}
              onChange={handleChange}
              required
              className="w-5 h-5 text-accent rounded focus:ring-accent"
            />
            <span className="text-gray-700">Agree to NDA & Scoring Ethics*</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-colors ${
            loading ? 'bg-gray-400' : 'bg-accent hover:bg-accent-dark'
          }`}
        >
          {loading ? 'Registering...' : 'Register as Judge'}
        </button>
      </form>
    </div>
  );
};

export default JuryRegistration;
