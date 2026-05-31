from flask import Flask, send_from_directory
from flask_cors import CORS
import os

from config import SECRET_KEY, DEBUG, UPLOAD_FOLDER
from routes.registrations import registrations_bp
from routes.dashboard import dashboard_bp
from routes.accreditation import accreditation_bp

def create_app():
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
    
    # Configuration
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['DEBUG'] = DEBUG
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
    
    # Enable CORS for frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    app.register_blueprint(registrations_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(accreditation_bp)
    
    # Serve frontend
    @app.route('/')
    def serve_frontend():
        return send_from_directory(app.static_folder, 'index.html')
    
    @app.route('/<path:path>')
    def serve_static(path):
        if os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')
    
    # Serve uploaded files
    @app.route('/uploads/<filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
