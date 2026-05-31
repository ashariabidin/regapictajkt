import React, { useState, useEffect } from 'react';
import { accreditationService } from '../services/api';
import QRCode from 'qrcode.react';

const Accreditation = () => {
  const [info, setInfo] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    try {
      const data = await accreditationService.getInfo();
      setInfo(data);
    } catch (error) {
      console.error('Failed to load info:', error);
    }
  };

  const handleGenerateQR = () => {
    // Generate sample QR code
    const sampleData = 'APICTA2026|SAMPLE-12345|demo@apicta.org|participant';
    setQrCode(sampleData);
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-gradient-to-r from-primary to-blue-800 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Digital Accreditation & Smart Ecosystem</h3>
        <p className="text-lg opacity-90">
          Every registered user receives a unique QR identity for venue access, meal validation, and session check-in. 
          Role-based color coding integrated with APICTA 2026 security.
        </p>
      </div>

      {/* Features */}
      {info && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Features</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {info.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Role Colors */}
      {info && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Role-Based Color Coding</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(info.role_colors).map(([role, color]) => (
              <div key={role} className="text-center">
                <div 
                  className="w-16 h-16 mx-auto rounded-lg mb-2"
                  style={{ backgroundColor: color }}
                ></div>
                <p className="text-sm font-medium text-gray-700 capitalize">{role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sample QR Generation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Sample QR Pass</h3>
        <button
          onClick={handleGenerateQR}
          className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
        >
          Generate Sample QR Pass
        </button>

        {qrCode && (
          <div className="mt-6 p-6 bg-gray-50 rounded-lg flex flex-col items-center">
            <div className="p-4 bg-white rounded-lg shadow-md">
              <QRCode value={qrCode} size={200} level="H" />
            </div>
            <p className="mt-4 text-sm text-gray-600">Sample QR Code for Demo Registration</p>
            <p className="text-xs text-gray-500 mt-1">ID: SAMPLE-12345 | Type: Participant</p>
          </div>
        )}
      </div>

      {/* Security Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Security Integration</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Venue Access Control</h4>
              <p className="text-sm text-gray-600">QR codes are scanned at entry points for secure venue access</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Meal Validation</h4>
              <p className="text-sm text-gray-600">Track and validate meal allocations for registered attendees</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Session Check-in</h4>
              <p className="text-sm text-gray-600">Monitor attendance at various sessions and workshops</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accreditation;
