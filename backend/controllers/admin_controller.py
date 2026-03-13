import logging
import os
from dotenv import load_dotenv
from models.admin_credentials import retrieve_credentials


load_dotenv()

# ENVIRONMENT VARIABLE CONFIGURATION
ODOO_DATABASE_URL = os.getenv("ODOO_DATABASE_URL")
ODOO_API_TOKEN = os.getenv("ODOO_API_TOKEN")
ODOO_DATABASE_NAME = os.getenv("ODOO_DATABASE_NAME")

# LOGGING
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

def validate_admin_login(email:str, password: str)-> dict:
    """
    Validate admin credentials using Odoo XML-RPC.
    
    This fetches all users and checks if email and password match.
    Note: This is temporary until a secure authentication endpoint is available.
    """
    try:
        log.info(f"Validating email for {email}")
        
        result = retrieve_credentials(email, password)
        
        return result
    except Exception as e:
        log.error(f"Error: {e}")