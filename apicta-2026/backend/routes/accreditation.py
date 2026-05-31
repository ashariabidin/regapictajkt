from flask import Blueprint, request, jsonify
import sqlite3

from config import DB_CONFIG
from services.qr_service import QRService
from services.ai_service import AIService

accreditation_bp = Blueprint('accreditation', __name__)

def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = sqlite3.connect(DB_CONFIG['database'])
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as err:
        print(f"Error connecting to database: {err}")
        return None

@accreditation_bp.route('/api/accreditation/generate-qr', methods=['POST'])
def generate_qr():
    """Generate QR code for a registration"""
    try:
        data = request.get_json()
        registration_id = data.get('registration_id')
        
        if not registration_id:
            return jsonify({'error': 'registration_id is required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Get registration details
        query = "SELECT id, email, registration_type, reference FROM registrations WHERE id = ?"
        cursor.execute(query, (registration_id,))
        row = cursor.fetchone()
        
        if not row:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Registration not found'}), 404
        
        registration = dict(row)
        
        # Generate QR code
        qr_data = f"APICTA2026|{registration['reference']}|{registration['email']}|{registration['registration_type']}"
        qr_base64 = QRService.generate_qr(qr_data)
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'qr_code': qr_base64,
            'registration': {
                'id': registration['id'],
                'reference': registration['reference'],
                'type': registration['registration_type'],
                'email': registration['email']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@accreditation_bp.route('/api/accreditation/qr/<int:reg_id>', methods=['GET'])
def get_qr_code(reg_id):
    """Get QR code for a specific registration"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Get registration details
        query = "SELECT id, email, registration_type, reference FROM registrations WHERE id = ?"
        cursor.execute(query, (reg_id,))
        row = cursor.fetchone()
        
        if not row:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Registration not found'}), 404
        
        registration = dict(row)
        
        # Generate QR code
        qr_data = f"APICTA2026|{registration['reference']}|{registration['email']}|{registration['registration_type']}"
        qr_base64 = QRService.generate_qr(qr_data)
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'qr_code': qr_base64,
            'registration': {
                'id': registration['id'],
                'reference': registration['reference'],
                'type': registration['registration_type'],
                'email': registration['email']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@accreditation_bp.route('/api/ai/sync-verification', methods=['POST'])
def ai_sync_verification():
    """AI-powered document verification sync"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Get all registrations
        query = "SELECT * FROM registrations"
        cursor.execute(query)
        rows = cursor.fetchall()
        
        # Convert to list of dictionaries
        registrations = [dict(row) for row in rows]
        
        cursor.close()
        conn.close()
        
        # Run AI verification
        result = AIService.verify_documents(registrations)
        
        return jsonify({
            'success': True,
            'message': result['message'],
            'details': {
                'total_registrations': result['total'],
                'complete_documents': result['complete'],
                'incomplete_documents': result['incomplete']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@accreditation_bp.route('/api/accreditation/info', methods=['GET'])
def get_accreditation_info():
    """Get accreditation system information"""
    return jsonify({
        'description': 'Digital Accreditation & Smart Ecosystem — every registered user receives a unique QR identity for venue access, meal validation, and session check-in. Role-based color coding integrated with APICTA 2026 security.',
        'features': [
            'Unique QR identity for each registrant',
            'Venue access control',
            'Meal validation',
            'Session check-in',
            'Role-based color coding',
            'Integrated security system'
        ],
        'role_colors': {
            'exco': '#e91e63',  # Pink
            'jury': '#9c27b0',  # Purple
            'official': '#2196f3',  # Blue
            'participant': '#4caf50',  # Green
            'committee': '#ff9800'  # Orange
        }
    }), 200
