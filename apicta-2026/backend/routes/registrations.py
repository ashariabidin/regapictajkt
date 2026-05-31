from flask import Blueprint, request, jsonify
import sqlite3
from datetime import datetime
import uuid
import os
import json

from config import DB_CONFIG, UPLOAD_FOLDER, ALLOWED_EXTENSIONS

registrations_bp = Blueprint('registrations', __name__)

def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = sqlite3.connect(DB_CONFIG['database'])
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as err:
        print(f"Error connecting to database: {err}")
        return None

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_reference(reg_type):
    """Generate unique reference ID"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    unique_id = str(uuid.uuid4())[:8].upper()
    prefix = reg_type.upper()[:3]
    return f"{prefix}-{timestamp}-{unique_id}"

def save_file(file, reg_type):
    """Save uploaded file and return path"""
    if file and allowed_file(file.filename):
        filename = f"{reg_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        return filename
    return None

@registrations_bp.route('/api/register/exco', methods=['POST'])
def register_exco():
    """Register EXCO delegate"""
    try:
        # Handle both JSON and form data
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        
        # Validate required fields
        required_fields = ['full_name', 'country', 'email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Handle file uploads if any
        executive_summary = request.files.get('executive_summary')
        executive_summary_path = save_file(executive_summary, 'exco') if executive_summary else None
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        reference = generate_reference('exco')
        
        query = """
        INSERT INTO registrations (
            reference, registration_type, full_name, country, organization, position,
            email, passport_id, arrival_date, special_requests, raw_payload
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        params = (
            reference, 'exco', data.get('full_name'), data.get('country'),
            data.get('organization'), data.get('position'), data.get('email'),
            data.get('passport_id'), data.get('arrival_date'),
            data.get('special_requests'), json.dumps(data)
        )
        
        cursor.execute(query, params)
        conn.commit()
        
        registration_id = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'EXCO registration successful',
            'reference': reference,
            'registration_id': registration_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@registrations_bp.route('/api/register/jury', methods=['POST'])
def register_jury():
    """Register jury member"""
    try:
        # Handle both JSON and form data
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        
        # Validate required fields
        required_fields = ['full_name', 'email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Parse expertise array
        expertise = data.get('expertise', [])
        if isinstance(expertise, str):
            expertise = [expertise]
        expertise_str = ','.join(expertise) if expertise else ''
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        reference = generate_reference('jury')
        
        query = """
        INSERT INTO registrations (
            reference, registration_type, full_name, email, country, expertise,
            conflict_of_interest, nda_agreed, availability_window, raw_payload
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        params = (
            reference, 'jury', data.get('full_name'), data.get('email'),
            data.get('country'), expertise_str,
            1 if data.get('conflict_of_interest') == 'true' else 0,
            1 if data.get('nda_agreed') == 'true' else 0,
            data.get('availability_window'), json.dumps(data)
        )
        
        cursor.execute(query, params)
        conn.commit()
        
        registration_id = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Jury registration successful',
            'reference': reference,
            'registration_id': registration_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@registrations_bp.route('/api/register/official', methods=['POST'])
def register_official():
    """Register official delegate"""
    try:
        # Handle both JSON and form data
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        
        # Validate required fields
        required_fields = ['full_name', 'country', 'role', 'email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        reference = generate_reference('official')
        
        query = """
        INSERT INTO registrations (
            reference, registration_type, full_name, country, delegation_name,
            role, email, phone, raw_payload
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        params = (
            reference, 'official', data.get('full_name'), data.get('country'),
            data.get('delegation_name'), data.get('role'), data.get('email'),
            data.get('phone'), json.dumps(data)
        )
        
        cursor.execute(query, params)
        conn.commit()
        
        registration_id = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Official registration successful',
            'reference': reference,
            'registration_id': registration_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@registrations_bp.route('/api/register/participant', methods=['POST'])
def register_participant():
    """Register participant/team"""
    try:
        # Handle both JSON and form data
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        
        # Validate required fields
        required_fields = ['team_name', 'project_title', 'category']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Handle file uploads
        executive_summary = request.files.get('executive_summary')
        pitch_deck = request.files.get('pitch_deck')
        
        executive_summary_path = save_file(executive_summary, 'participant') if executive_summary else None
        pitch_deck_path = save_file(pitch_deck, 'participant') if pitch_deck else None
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        reference = generate_reference('participant')
        
        query = """
        INSERT INTO registrations (
            reference, registration_type, team_name, project_title, country,
            category, team_members, executive_summary_path, pitch_deck_path,
            demo_video_url, ip_declaration, raw_payload
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        params = (
            reference, 'participant', data.get('team_name'), data.get('project_title'),
            data.get('country'), data.get('category'), data.get('team_members'),
            executive_summary_path, pitch_deck_path, data.get('demo_video_url'),
            1 if data.get('ip_declaration') == 'true' else 0, json.dumps(data)
        )
        
        cursor.execute(query, params)
        conn.commit()
        
        registration_id = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Participant registration successful',
            'reference': reference,
            'registration_id': registration_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@registrations_bp.route('/api/register/committee', methods=['POST'])
def register_committee():
    """Register committee member"""
    try:
        # Handle both JSON and form data
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        
        # Validate required fields
        required_fields = ['full_name', 'email', 'division']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        reference = generate_reference('committee')
        
        query = """
        INSERT INTO registrations (
            reference, registration_type, full_name, email, division,
            task_responsibility, access_level, raw_payload
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        params = (
            reference, 'committee', data.get('full_name'), data.get('email'),
            data.get('division'), data.get('task_responsibility'),
            data.get('access_level'), json.dumps(data)
        )
        
        cursor.execute(query, params)
        conn.commit()
        
        registration_id = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Committee registration successful',
            'reference': reference,
            'registration_id': registration_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@registrations_bp.route('/api/registrations', methods=['GET'])
def get_registrations():
    """Get all registrations"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        query = "SELECT * FROM registrations ORDER BY created_at DESC"
        cursor.execute(query)
        
        rows = cursor.fetchall()
        
        # Convert to list of dictionaries
        registrations = []
        for row in rows:
            reg = dict(row)
            # Convert datetime objects to strings
            if reg.get('created_at'):
                reg['created_at'] = str(reg['created_at'])
            if reg.get('updated_at'):
                reg['updated_at'] = str(reg['updated_at'])
            if reg.get('arrival_date'):
                reg['arrival_date'] = str(reg['arrival_date'])
            registrations.append(reg)
        
        cursor.close()
        conn.close()
        
        return jsonify(registrations), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@registrations_bp.route('/api/registrations/<int:reg_id>', methods=['GET'])
def get_registration(reg_id):
    """Get single registration by ID"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        query = "SELECT * FROM registrations WHERE id = ?"
        cursor.execute(query, (reg_id,))
        
        row = cursor.fetchone()
        
        if not row:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Registration not found'}), 404
        
        # Convert row to dictionary
        registration = dict(row)
        
        # Convert datetime objects to strings
        if registration.get('created_at'):
            registration['created_at'] = str(registration['created_at'])
        if registration.get('updated_at'):
            registration['updated_at'] = str(registration['updated_at'])
        if registration.get('arrival_date'):
            registration['arrival_date'] = str(registration['arrival_date'])
        
        cursor.close()
        conn.close()
        
        return jsonify(registration), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@registrations_bp.route('/api/registrations/<int:reg_id>/status', methods=['PUT'])
def update_registration_status(reg_id):
    """Update registration status"""
    try:
        data = request.get_json()
        status = data.get('status')
        
        if status not in ['pending', 'approved', 'rejected']:
            return jsonify({'error': 'Invalid status'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        query = "UPDATE registrations SET status = ? WHERE id = ?"
        cursor.execute(query, (status, reg_id))
        conn.commit()
        
        affected_rows = cursor.rowcount
        cursor.close()
        conn.close()
        
        if affected_rows == 0:
            return jsonify({'error': 'Registration not found'}), 404
        
        return jsonify({'success': True, 'message': 'Status updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
