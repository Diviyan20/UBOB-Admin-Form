import logging

# FLASK SERVER
from flask import Flask, jsonify, request
from flask_cors import CORS

# CONTROLLERS
from controllers.admin_controller import validate_admin_login
from controllers.outlet_controller import (fetch_all_outlets_from_odoo, add_outlet)

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

@app.route("/api/register_outlet", methods=["POST"])
def register_outlet():
    """ Register a new outlet into the database """
    data = request.get_json(force=True)
    
    outlet_id = data.get("outlet_id")
    outlet_name = data.get("outlet_name")
    region_name = data.get("region_name")
    order_api_url = data.get("order_api_url")
    order_api_key = data.get("order_api_key")
    
    # Basic validation: Make sure all required fields are present
    missing_fields = [
        name for name, value in[
            ("outlet_id", outlet_id),
            ("outlet_name", outlet_name),
            ("region_name", region_name),
            ("order_api_url", order_api_url),
            ("order_api_key", order_api_key),
        ]
        if not value
    ]
    
    if missing_fields:
        return jsonify({
            "success": False,
            "error": f"Missing fields:{', '.join(missing_fields)}",
        }), 400
    
    # Call the controller, which will in turn, call the model
    result = add_outlet(
        outlet_id=outlet_id,
        outlet_name=outlet_name,
        region_name=region_name,
        order_api_url=order_api_url,
        order_api_key= order_api_key
    )
    
    if result:
        return jsonify({
            "success": result
        }), 200
    else:
        return jsonify({
            "success": False,
            "error": "Failed to register to database."
        }), 400


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')