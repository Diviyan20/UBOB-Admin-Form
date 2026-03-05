import logging
from dotenv import load_dotenv

# FLASK SERVER
from flask import Flask, jsonify, make_response, request
from flask_cors import CORS

# CONTROLLERS
from controllers.admin_controller import validate_admin_login
from controllers.outlet_controller import (fetch_all_outlets_from_odoo, add_outlet)

# UTILITIES
from utils.auth import generate_admin_token
from utils.decorators import admin_required

# BACKGROUND JOBS
from werkzeug.middleware.proxy_fix import ProxyFix


# FLASK SETUP
app = Flask(__name__, static_folder="static")

CORS(
    app,
    origins=["https://ubob-admin-form.vercel.app"],
    supports_credentials=True
)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1)

# CONFIGURATION
load_dotenv()



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
@app.route("/admin/login", methods=["POST", "OPTIONS"])
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
        token = generate_admin_token(admin_id="1")
        
        response = make_response(jsonify({"message" :"Login Successful"}))
        
        response.set_cookie(
            "admin_token",
            token,
            httponly=True,
            secure=True,
            samesite="None",
            max_age=1800
        )
        return response

@app.route("/admin/check-auth", methods=["GET"])
@admin_required
def check_auth():
    return jsonify({"authenticated": True})

@app.route("/admin/logout", methods=["POST"])
def admin_logout():
    response = make_response(jsonify({"message": "Logged out"}))
    response.delete_cookie("admin_token")
    return response

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
@admin_required
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