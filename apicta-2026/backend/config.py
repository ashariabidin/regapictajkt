import os

# Database configuration - Using SQLite for simplicity
DB_CONFIG = {
    'database': os.path.join(os.path.dirname(__file__), 'apicta_2026.db')
}

# Flask configuration
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
DEBUG = True

# Upload configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'mp4', 'mov'}

# Create uploads folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
