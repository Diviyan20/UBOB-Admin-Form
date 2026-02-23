import logging

# FLASK SERVER
from flask import Flask, jsonify, request
from flask_cors import CORS

# CONTROLLERS
from controllers.admin_controller import validate_admin_login

# BACKGROUND JOBS
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__, static_folder="static")

CORS(
    app,
    resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
)

app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1)


# =======
# LOGGING
# =======
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ===================
# ADMIN ENDPOINTS
# ===================
@app.route("/admin/login", methods=["POST"])
def admin_login():
    """
    Validate admin credentials
    
    Request body:
    {
        "email": "admin@example.com",
        "password": "password123"
    }
    
    Response:
        Success (200): {"is_valid": true, "user_id": 1, "name": "Admin Name"}
        Failure (401): {"is_valid": false, "error": "Invalid credentials"}
    """
    data = request.get_json(force=True)
    email = data.get("email")
    password = data.get("password")
    
    # Validate input
    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400
    
    # Validate credentials
    result = validate_admin_login(email, password)
    
    if result.get("is_valid"):
        return jsonify(result), 200
    else:
        return jsonify(result), 401


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')