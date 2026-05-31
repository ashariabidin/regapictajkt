import sqlite3
import os
from config import DB_CONFIG

def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = sqlite3.connect(DB_CONFIG['database'])
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as err:
        print(f"Error connecting to database: {err}")
        return None

def init_database():
    """Initialize the database with required tables"""
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to database")
        return
    
    cursor = conn.cursor()
    
    # Create registrations table
    create_registrations_table = """
    CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT UNIQUE NOT NULL,
        registration_type TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        country TEXT,
        organization TEXT,
        position TEXT,
        phone TEXT,
        passport_id TEXT,
        arrival_date TEXT,
        role TEXT,
        category TEXT,
        team_name TEXT,
        project_title TEXT,
        division TEXT,
        task_responsibility TEXT,
        access_level TEXT,
        expertise TEXT,
        conflict_of_interest INTEGER DEFAULT 0,
        nda_agreed INTEGER DEFAULT 0,
        availability_window TEXT,
        delegation_name TEXT,
        team_members TEXT,
        executive_summary_path TEXT,
        pitch_deck_path TEXT,
        demo_video_url TEXT,
        ip_declaration INTEGER DEFAULT 0,
        special_requests TEXT,
        notes TEXT,
        qr_code_path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        raw_payload TEXT
    )
    """
    
    # Create dashboard_metrics table for seed data
    create_metrics_table = """
    CREATE TABLE IF NOT EXISTS dashboard_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_name TEXT NOT NULL,
        metric_value INTEGER NOT NULL,
        metric_type TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    
    cursor.execute(create_registrations_table)
    cursor.execute(create_metrics_table)
    
    # Seed initial metrics data
    seed_metrics = """
    INSERT INTO dashboard_metrics (metric_name, metric_value, metric_type) VALUES
    ('participating_countries', 21, 'executive'),
    ('total_participants', 487, 'executive'),
    ('project_submissions', 124, 'executive'),
    ('international_judges', 48, 'executive'),
    ('pending_approvals', 23, 'operational'),
    ('missing_documents', 11, 'operational'),
    ('arrivals_confirmed', 189, 'operational'),
    ('venue_utilization', 84, 'operational')
    """
    
    cursor.execute(seed_metrics)
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_database()
