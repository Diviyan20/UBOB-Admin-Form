import os
import logging
import requests
from dotenv import load_dotenv
from models.active_outlets_db import (
    get_db_connection,
    register_outlet
)

load_dotenv()

# ======================
# ENVIRONMENT VARIABLES
# ======================
ODOO_DATABASE_URL = os.getenv("ODOO_DATABASE_URL")
ODOO_DATABASE_NAME = os.getenv("ODOO_DATABASE_NAME")
ODOO_API_TOKEN = os.getenv("ODOO_API_TOKEN")

# ==============
# LOGGING SETUP
# ==============
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

def odoo_headers():
    """Generate headers for the Odoo API requests"""
    return {
        "Authorization": f"Bearer {ODOO_API_TOKEN}",
        "Content-Type": "application/json"
    }
    

def fetch_all_outlets_from_odoo() -> list:
    """
    Fetch all outlets from Odoo using the API Endpoint.
    Returns list of outlets with id, name, and region
    """
    try:
        log.info("Fetching all outlets from Odoo...")
        
        response = requests.post(
            f"{ODOO_DATABASE_URL}/api/get/outlet/regions",
            json={"ids": []},
            headers=odoo_headers(),
            timeout=15
        )
        
        response.raise_for_status()
        data = response.json()
        
        # Extract outlets from all regions
        outlets = []
        for region in data.get("data", []):
            region_name = region.get("outlet_region_name")
            
            for outlet in region.get("pos_shops", []):
                outlets.append({
                    "outlet_id": str(outlet.get("id")),
                    "outlet_name": outlet.get("name"),
                    "region_name": region_name
                })
        
        log.info(f"Fetched {len(outlets)} outlets from Odoo")
        return outlets
    
    except Exception as e:
        log.error(f"Error fetching outlets from Odoo: {e}")
        return []