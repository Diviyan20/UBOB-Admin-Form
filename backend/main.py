import logging

# FLASK SERVER
from flask import Flask, jsonify, request
from flask_cors import CORS

# CONTROLLERS
from controllers.admin_controller import validate_admin_login
from controllers.outlet_controller import fetch_all_outlets_from_odoo

# BACKGROUND JOBS
from werkzeug.middleware.proxy_fix import ProxyFix


# Flask Setup
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
    Validate admin credentials via XML-RPC (Temporary)
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


# ==================
# OUTLET ENDPOINTS
# ==================
@app.route("/api/outlets", methods=["GET"])
def get_all_outlets():
    """Get all the outlets from Odoo for the Dropdown Component"""
    outlets = fetch_all_outlets_from_odoo()
    if outlets:
        
        return jsonify({"outlets": outlets}), 200
    else:
        return jsonify({
            "success": False,
            "error": "API did not call successfully"
        }), 405


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')