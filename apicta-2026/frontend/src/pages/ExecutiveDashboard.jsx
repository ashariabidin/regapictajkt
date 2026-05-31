import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ExecutiveDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await dashboardService.getExecutiveDashboard();
      setData(result);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!data) return <div className="text-center py-12 text-red-600">Failed to load data</div>;

  const barData = {
    labels: data.heatmap.countries.slice(0, 10).map(c => c.country),
    datasets: [{
      label: 'Delegates',
      data: data.heatmap.countries.slice(0, 10).map(c => c.delegates),
      backgroundColor: '#e91e63',
    }],
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm font-medium">Participating Countries</h3>
          <p className="text-3xl font-bold text-primary mt-2">{data.metrics.participating_countries}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm font-medium">Total Participants</h3>
          <p className="text-3xl font-bold text-primary mt-2">{data.metrics.total_participants}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm font-medium">Project Submissions</h3>
          <p className="text-3xl font-bold text-primary mt-2">{data.metrics.project_submissions}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm font-medium">International Judges</h3>
          <p className="text-3xl font-bold text-primary mt-2">{data.metrics.international_judges}</p>
        </div>
      </div>

      {/* AI Prediction Card */}
      <div className="bg-gradient-to-r from-accent to-purple-600 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-lg font-semibold">AI Prediction</h3>
        <p className="text-4xl font-bold mt-2">{data.ai_prediction.attendance_rate}%</p>
        <p className="mt-2 opacity-90">{data.ai_prediction.message}</p>
      </div>

      {/* Heatmap/Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">{data.heatmap.title}</h3>
        <div className="h-80">
          <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Country List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Active Delegations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.heatmap.countries.filter(c => c.active).map((country) => (
            <div key={country.country} className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">{country.country}</span>
              <span className="text-gray-500 text-sm">({country.delegates})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
