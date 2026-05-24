from flask import Flask, request
from config import Config
from extensions import db, jwt, cors
from routes import api_bp
from models import User
import os

def create_app(config_class=Config):
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)

    app.register_blueprint(api_bp, url_prefix='/api')

    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    @app.errorhandler(404)
    def not_found(e):
        # Only serve index.html if the request isn't for the API
        if request.path.startswith('/api/'):
            return {"error": "Not found"}, 404
        return app.send_static_file('index.html')

    with app.app_context():
        db.create_all()
        # 1. Migrate old admin from admin@boutique.com to admin@niara.com if it exists
        old_admin = User.query.filter_by(email='admin@boutique.com').first()
        if old_admin:
            old_admin.email = 'admin@niara.com'
            old_admin.role = 'admin'
            old_admin.is_verified = True
            old_admin.set_password('admin123')
            db.session.commit()
            
        # 2. Ensure admin@niara.com exists and has the correct password/role
        admin = User.query.filter_by(email='admin@niara.com').first()
        if not admin:
            admin = User(email='admin@niara.com', role='admin', is_verified=True)
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
        else:
            # Force update role and password to match requests
            admin.role = 'admin'
            admin.is_verified = True
            admin.set_password('admin123')
            db.session.commit()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
