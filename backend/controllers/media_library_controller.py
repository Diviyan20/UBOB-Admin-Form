from flask import Blueprint, jsonify

from services.media_library_service import refresh_media_library

media_library_bp = Blueprint("media_library", __name__, url_prefix="/admin/media-library")

@media_library_bp.route("", methods=["GET"])
def refresh_media_library_endpoint():
    try:
        media = refresh_media_library()
        return jsonify({
            "success": True,
            "data": media
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500