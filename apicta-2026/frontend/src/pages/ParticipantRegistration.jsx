import React, { useState } from 'react';
import { registrationService } from '../services/api';
import { useApp } from '../context/AppContext';

const ParticipantRegistration = () => {
  const { addNotification } = useApp();
  const [formData, setFormData] = useState({
    team_name: '',
    project_title: '',
    country: '',
    category: '',
    team_members: '',
    executive_summary: null,
    pitch_deck: null,
    demo_video_url: '',
    ip_declaration: false,
  });
  const [loading, setLoading] = useState(false);

  const categories = ['Business Services', 'Consumer Solutions', 'Industrial', 'Startup', 'AI & Data Science'];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.team_name || !formData.project_title || !formData.category) {
      addNotification('Please fill in all required fields', 'error');
      return;
    }

    if (!formData.ip_declaration) {
      addNotification('You must agree to IP Declaration', 'error');
      return;
    }

    setLoading(true);
    try {
      await registrationService.registerParticipant(formData);
      addNotification('Project submission successful!', 'success');
      setFormData({
        team_name: '',
        project_title: '',
        country: '',
        category: '',
        team_members: '',
        executive_summary: null,
        pitch_deck: null,
        demo_video_url: '',
        ip_declaration: false,
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Name*</label>
            <input type="text" name="team_name" value={formData.team_name} onChange={handleChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Title*</label>
            <input type="text" name="project_title" value={formData.project_title} onChange={handleChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <input type="text" name="country" value={formData.country} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category*</label>
            <select name="category" value={formData.category} onChange={handleChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Team Members (names & emails)</label>
          <textarea name="team_members" value={formData.team_members} onChange={handleChange} rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            placeholder="John Doe (john@example.com), Jane Smith (jane@example.com)" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Executive Summary (PDF)</label>
            <input type="file" name="executive_summary" accept=".pdf" onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pitch Deck</label>
            <input type="file" name="pitch_deck" accept=".pdf,.ppt,.pptx" onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Demo Video URL</label>
          <input type="url" name="demo_video_url" value={formData.demo_video_url} onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            placeholder="https://youtube.com/..." />
        </div>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input type="checkbox" name="ip_declaration" checked={formData.ip_declaration} onChange={handleChange}
            className="w-5 h-5 text-accent rounded focus:ring-accent" />
          <span className="text-gray-700">IP Declaration & ownership*</span>
        </label>

        <button type="submit" disabled={loading}
          className={`w-full py-3 px-6 rounded-lg text-white font-medium ${loading ? 'bg-gray-400' : 'bg-accent hover:bg-accent-dark'}`}>
          {loading ? 'Submitting...' : 'Submit Project'}
        </button>
      </form>
    </div>
  );
};

export default ParticipantRegistration;
