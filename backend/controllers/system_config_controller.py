from flask import Blueprint, jsonify, request
from services.system_config_service import (
    fetch_system_config,
    edit_system_config_field,
    create_system_config_field,
    remove_system_config_field,
)

system_config_bp = Blueprint(
    "system_config_bp",
    __name__
)

# ===========================
# READ SYSTEM CONFIG VALUES
# ===========================
@system_config_bp.route("/config", methods=["GET"])
def fetch_system_config_route():
    try:
        result = fetch_system_config()
        
        if not result["success"]:
            return jsonify(result), 404
    
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ==================
# UPDATE FIELD
# ==================
@system_config_bp.route("/config/<field_name>",methods=["PUT"],)
def update_config_field(field_name):
    data = request.get_json(silent=True, force=True)
    
    if not data or "value" not in data:
        return jsonify({
            "success": False,
            "error": "value is required",
        }), 400
    
    result = edit_system_config_field(
        field_name=field_name,
        value=data["value"],
    )
    
    if not result["success"]:
        return jsonify(result), 400
    
    return jsonify(result), 200

# ================
# CREATE FIELD
# ================
@system_config_bp.route("/config/field", methods=["POST"])
def create_config_field():
    data = request.get_json(silent=True, force=True)
    
    if not data:
        return jsonify({
            "success": False,
            "error": "Invalid or missing JSON",
        }), 400
    
    field_name = data.get("field_name")
    default_value = data.get("default_value", 0)
    
    if not field_name:
        return jsonify({
            "success": False,
            "error": "field_name is required",
        }), 400
    
    result = create_system_config_field(
        field_name=field_name,
        default_value=default_value,
    )
    
    if not result["success"]:
        return jsonify(result), 400
    
    return jsonify(result), 201

# ===============
# DELETE FIELD
# ===============
@system_config_bp.route("/config/<field_name>", methods=["DELETE"])
def delete_config_field(field_name):
    result = remove_system_config_field(field_name)
    
    if not result["success"]:
        return jsonify(result), 400

    return jsonify(result), 200