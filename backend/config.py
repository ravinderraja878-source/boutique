import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-key-change-me'
    # Handle Vercel/Heroku postgres:// vs postgresql:// compatibility
    # and use /tmp/boutique.db as fallback on Vercel to avoid read-only filesystem crash
    _db_url = os.environ.get('DATABASE_URL')
    if _db_url:
        if _db_url.startswith("postgres://"):
            _db_url = _db_url.replace("postgres://", "postgresql://", 1)
    else:
        if os.environ.get('VERCEL') or os.environ.get('AWS_LAMBDA_FUNCTION_NAME'):
            _db_url = 'sqlite:////tmp/boutique.db'
        else:
            _db_url = 'sqlite:///boutique.db'
    
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-super-secret-key-change-me'
    JWT_ACCESS_TOKEN_EXPIRES = False
    _upload_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    if os.environ.get('VERCEL') or os.environ.get('AWS_LAMBDA_FUNCTION_NAME'):
        _upload_folder = '/tmp/uploads'
    UPLOAD_FOLDER = _upload_folder
    MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500 MB max upload size
