from __future__ import annotations

import json
import os
import uuid
from datetime import date
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from mysql.connector import Error as MySQLError
from werkzeug.utils import secure_filename

from db import get_connection
from init_db import ensure_database

load_dotenv()
ensure_database()

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / os.getenv('UPLOAD_FOLDER', 'uploads')
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_UPLOAD_SIZE', str(50 * 1024 * 1024)))


@app.get('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')


@app.get('/style.css')
def style_css():
    return send_from_directory(BASE_DIR, 'style.css')


@app.get('/script.js')
def script_js():
    return send_from_directory(BASE_DIR, 'script.js')


@app.get('/uploads/<path:filename>')
def uploaded_file(filename: str):
    return send_from_directory(UPLOAD_DIR, filename)


@app.get('/api/health')
def health():
    return jsonify({'status': 'ok'})


def flatten_form_data() -> dict:
    payload: dict[str, object] = {}
    for key in request.form.keys():
        values = request.form.getlist(key)
        payload[key] = values if len(values) > 1 else values[0]
    return payload


def as_text(value) -> str | None:
    if value is None:
        return None
    if isinstance(value, list):
        cleaned = [item for item in value if item not in (None, '')]
        return ', '.join(cleaned) if cleaned else None
    text = str(value).strip()
    return text or None


def build_notes(payload: dict) -> str | None:
    parts: list[str] = []
    expertise = payload.get('expertise')
    if isinstance(expertise, list) and expertise:
        parts.append('expertise=' + ', '.join(expertise))
    for key in ('special_requests', 'availability_window', 'task_responsibility', 'demo_video_url', 'team_members'):
        value = as_text(payload.get(key))
        if value:
            parts.append(f'{key}={value}')
    flags = []
    for key in ('conflict_of_interest', 'nda_agreement', 'ip_declaration'):
        if payload.get(key):
            flags.append(key)
    if flags:
        parts.append('flags=' + ', '.join(flags))
    return ' | '.join(parts) if parts else None


def extract_common_fields(payload: dict) -> dict:
    return {
        'registration_type': as_text(payload.get('registration_type')) or 'unknown',
        'full_name': as_text(payload.get('full_name') or payload.get('fullname')) or '',
        'email': as_text(payload.get('email')) or '',
        'country': as_text(payload.get('country')),
        'organization': as_text(payload.get('organization')),
        'position': as_text(payload.get('position')),
        'phone_whatsapp': as_text(payload.get('phone_whatsapp') or payload.get('phone')),
        'passport_or_id': as_text(payload.get('passport_or_id') or payload.get('passport')),
        'arrival_date': as_text(payload.get('arrival_date') or payload.get('arrival')),
        'role_name': as_text(payload.get('role')),
        'division': as_text(payload.get('division')),
        'team_name': as_text(payload.get('team_name')),
        'project_title': as_text(payload.get('project_title')),
        'category': as_text(payload.get('category')),
        'notes': build_notes(payload),
    }


def save_uploads(reference_code: str) -> list[dict]:
    saved_files: list[dict] = []
    for field_name in request.files.keys():
        for file_storage in request.files.getlist(field_name):
            if not file_storage or not file_storage.filename:
                continue

            original_name = secure_filename(file_storage.filename)
            stored_name = f'{reference_code}_{field_name}_{uuid.uuid4().hex[:8]}_{original_name}'
            stored_path = UPLOAD_DIR / stored_name
            file_storage.save(stored_path)

            saved_files.append({
                'field_name': field_name,
                'original_name': file_storage.filename,
                'stored_name': stored_name,
                'url': f'/uploads/{stored_name}',
                'size_bytes': stored_path.stat().st_size,
            })
    return saved_files


@app.post('/api/registrations')
def create_registration():
    try:
        payload = flatten_form_data()
        if request.is_json and not payload:
            json_payload = request.get_json(silent=True) or {}
            payload = json_payload if isinstance(json_payload, dict) else {}

        common = extract_common_fields(payload)
        if not common['full_name'] or not common['email']:
            return jsonify({'error': 'full_name and email are required'}), 400

        reference_code = f"REG-{uuid.uuid4().hex[:10].upper()}"
        qr_token = uuid.uuid4().hex
        attachments = save_uploads(reference_code)

        if common['arrival_date']:
            try:
                parsed = date.fromisoformat(common['arrival_date'])
                common['arrival_date'] = parsed.isoformat()
            except ValueError:
                return jsonify({'error': 'arrival_date must use YYYY-MM-DD format'}), 400

        raw_payload = json.dumps(payload, ensure_ascii=False)
        attachments_json = json.dumps(attachments, ensure_ascii=False) if attachments else None

        insert_sql = '''
            INSERT INTO registrations (
                reference_code, registration_type, full_name, email, country,
                organization, position, phone_whatsapp, passport_or_id, arrival_date,
                role_name, division, team_name, project_title, category,
                notes, attachments_json, raw_payload, qr_token, status
            ) VALUES (
                %(reference_code)s, %(registration_type)s, %(full_name)s, %(email)s, %(country)s,
                %(organization)s, %(position)s, %(phone_whatsapp)s, %(passport_or_id)s, %(arrival_date)s,
                %(role_name)s, %(division)s, %(team_name)s, %(project_title)s, %(category)s,
                %(notes)s, %(attachments_json)s, %(raw_payload)s, %(qr_token)s, 'pending'
            )
        '''

        params = {
            'reference_code': reference_code,
            'registration_type': common['registration_type'],
            'full_name': common['full_name'],
            'email': common['email'],
            'country': common['country'],
            'organization': common['organization'],
            'position': common['position'],
            'phone_whatsapp': common['phone_whatsapp'],
            'passport_or_id': common['passport_or_id'],
            'arrival_date': common['arrival_date'],
            'role_name': common['role_name'],
            'division': common['division'],
            'team_name': common['team_name'],
            'project_title': common['project_title'],
            'category': common['category'],
            'notes': common['notes'],
            'attachments_json': attachments_json,
            'raw_payload': raw_payload,
            'qr_token': qr_token,
        }

        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(insert_sql, params)
            connection.commit()

        return jsonify({
            'success': True,
            'reference': reference_code,
            'registration_type': common['registration_type'],
            'qr_token': qr_token,
            'attachments': attachments,
        }), 201
    except MySQLError as exc:
        return jsonify({'error': f'Database error: {exc.msg}'}), 500
    except Exception as exc:
        return jsonify({'error': str(exc)}), 500


@app.get('/api/registrations')
def list_registrations():
    try:
        limit = min(int(request.args.get('limit', 50)), 200)
        with get_connection() as connection:
            with connection.cursor(dictionary=True) as cursor:
                cursor.execute(
                    '''
                    SELECT reference_code, registration_type, full_name, email, country,
                           organization, project_title, category, status, created_at
                    FROM registrations
                    ORDER BY created_at DESC
                    LIMIT %s
                    ''',
                    (limit,),
                )
                rows = cursor.fetchall()
        return jsonify({'items': rows})
    except MySQLError as exc:
        return jsonify({'error': f'Database error: {exc.msg}'}), 500


@app.get('/api/registrations/<reference_code>')
def get_registration(reference_code: str):
    try:
        with get_connection() as connection:
            with connection.cursor(dictionary=True) as cursor:
                cursor.execute(
                    'SELECT * FROM registrations WHERE reference_code = %s LIMIT 1',
                    (reference_code,),
                )
                row = cursor.fetchone()
        if not row:
            return jsonify({'error': 'Registration not found'}), 404

        for key in ('attachments_json', 'raw_payload'):
            value = row.get(key)
            if isinstance(value, str):
                try:
                    row[key] = json.loads(value)
                except json.JSONDecodeError:
                    pass

        return jsonify(row)
    except MySQLError as exc:
        return jsonify({'error': f'Database error: {exc.msg}'}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', '5000'))
    app.run(host='0.0.0.0', port=port, debug=True)
