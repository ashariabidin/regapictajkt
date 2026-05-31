from flask import Blueprint, jsonify
import sqlite3

from config import DB_CONFIG
from services.ai_service import AIService

dashboard_bp = Blueprint('dashboard', __name__)

def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = sqlite3.connect(DB_CONFIG['database'])
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as err:
        print(f"Error connecting to database: {err}")
        return None

@dashboard_bp.route('/api/dashboard/executive', methods=['GET'])
def get_executive_dashboard():
    """Get executive dashboard metrics"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Get metrics from database
        query = "SELECT metric_name, metric_value FROM dashboard_metrics WHERE metric_type = 'executive'"
        cursor.execute(query)
        rows = cursor.fetchall()
        
        # Convert to dictionary
        metrics_dict = {row[0]: row[1] for row in rows}
        
        # Get country participation count from registrations
        cursor.execute("""
            SELECT COUNT(DISTINCT country) as country_count 
            FROM registrations 
            WHERE country IS NOT NULL AND country != ''
        """)
        result = cursor.fetchone()
        if result and result[0]:
            metrics_dict['participating_countries'] = max(metrics_dict.get('participating_countries', 0), result[0])
        
        # Get total participants
        cursor.execute("SELECT COUNT(*) as total FROM registrations")
        result = cursor.fetchone()
        if result:
            metrics_dict['total_participants'] = max(metrics_dict.get('total_participants', 0), result[0])
        
        # Get project submissions (participant registrations)
        cursor.execute("""
            SELECT COUNT(*) as total FROM registrations 
            WHERE registration_type = 'participant'
        """)
        result = cursor.fetchone()
        if result:
            metrics_dict['project_submissions'] = max(metrics_dict.get('project_submissions', 0), result[0])
        
        # Get international judges
        cursor.execute("""
            SELECT COUNT(*) as total FROM registrations 
            WHERE registration_type = 'jury'
        """)
        result = cursor.fetchone()
        if result:
            metrics_dict['international_judges'] = max(metrics_dict.get('international_judges', 0), result[0])
        
        cursor.close()
        conn.close()
        
        # Get AI prediction
        attendance_rate = AIService.get_attendance_prediction()
        
        # Get heatmap data
        heatmap_data = AIService.get_country_heatmap_data()
        active_countries = [c for c in heatmap_data if c['active']]
        
        return jsonify({
            'metrics': {
                'participating_countries': metrics_dict.get('participating_countries', 21),
                'total_participants': metrics_dict.get('total_participants', 487),
                'project_submissions': metrics_dict.get('project_submissions', 124),
                'international_judges': metrics_dict.get('international_judges', 48)
            },
            'ai_prediction': {
                'attendance_rate': attendance_rate,
                'message': f"{attendance_rate}% predicted attendance rate"
            },
            'heatmap': {
                'title': 'APICTA 2026 Heatmap — active delegations: {} countries live'.format(len(active_countries)),
                'countries': heatmap_data
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/api/dashboard/operational', methods=['GET'])
def get_operational_dashboard():
    """Get operational dashboard metrics"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Get metrics from database
        query = "SELECT metric_name, metric_value FROM dashboard_metrics WHERE metric_type = 'operational'"
        cursor.execute(query)
        rows = cursor.fetchall()
        
        # Convert to dictionary
        metrics_dict = {row[0]: row[1] for row in rows}
        
        # Calculate pending approvals
        cursor.execute("""
            SELECT COUNT(*) as total FROM registrations 
            WHERE status = 'pending'
        """)
        result = cursor.fetchone()
        if result:
            metrics_dict['pending_approvals'] = max(metrics_dict.get('pending_approvals', 0), result[0])
        
        # Calculate missing documents (participants without required files)
        cursor.execute("""
            SELECT COUNT(*) as total FROM registrations 
            WHERE registration_type = 'participant' 
            AND (executive_summary_path IS NULL OR pitch_deck_path IS NULL)
        """)
        result = cursor.fetchone()
        if result:
            metrics_dict['missing_documents'] = max(metrics_dict.get('missing_documents', 0), result[0])
        
        # Calculate arrivals confirmed (registrations with arrival_date)
        cursor.execute("""
            SELECT COUNT(*) as total FROM registrations 
            WHERE arrival_date IS NOT NULL
        """)
        result = cursor.fetchone()
        if result:
            metrics_dict['arrivals_confirmed'] = max(metrics_dict.get('arrivals_confirmed', 0), result[0])
        
        cursor.close()
        conn.close()
        
        # Operational workflow items
        workflow_items = [
            {'task': 'Main hall setup', 'status': 'Sessions 1-3 complete', 'priority': 'high'},
            {'task': 'Judge orientation', 'status': 'NDA missing', 'priority': 'high'},
            {'task': 'QR batch generation', 'status': 'In progress', 'priority': 'medium'},
            {'task': 'Transportation schedule', 'status': 'Gala night', 'priority': 'medium'}
        ]
        
        return jsonify({
            'metrics': {
                'pending_approvals': metrics_dict.get('pending_approvals', 23),
                'missing_documents': metrics_dict.get('missing_documents', 11),
                'arrivals_confirmed': metrics_dict.get('arrivals_confirmed', 189),
                'venue_utilization': metrics_dict.get('venue_utilization', 84)
            },
            'workflow': workflow_items
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
