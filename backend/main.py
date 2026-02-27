import logging
import os
from dotenv import load_dotenv

# FLASK SERVER
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

# CONTROLLERS
from controllers.admin_controller import validate_admin_login
from controllers.outlet_controller import (fetch_all_outlets_from_odoo, add_outlet)

# BACKGROUND JOBS
from werkzeug.middleware.proxy_fix import ProxyFix


# FLASK SETUP
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

# CONFIGURATION
load_dotenv()
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)


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
    admin = validate_admin_login(email, password)
    
    if not admin.get("is_valid"):
        return jsonify({"Error": "Invalid Credentials"}), 401
    else:
        access_token = create_access_token(
            identity=admin["email"],
            expires_delta=timedelta(minutes=15)
        )
        
        return jsonify({
            "access_token": access_token,
            "admin_name":admin["name"]
        }), 200


# ==================
# OUTLET ENDPOINTS
# ==================
@app.route("/api/outlets", methods=["GET"])
@jwt_required()
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
@jwt_required()
def register_outlet():
    """ Register a new outlet into the database """
    
    # Authenthication for Admin using JWT Token
    admin_id = get_jwt_identity()
    log.info(f"Admin {admin_id} is registering an outlet.")
    
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