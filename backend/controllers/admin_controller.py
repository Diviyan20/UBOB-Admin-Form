import logging
import os
import xmlrpc.client
from dotenv import load_dotenv


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
        
        # Connect to Odoo XML-RPC client endpoint
        common = common = xmlrpc.client.ServerProxy(f"{ODOO_DATABASE_URL}/xmlrpc/2/common")
        common.version()
        
        # Try to authenticate
        uid = common.authenticate(ODOO_DATABASE_NAME, email, password,{})
        
        if uid:
            # Authentication successful, get user details
            models = xmlrpc.client.ServerProxy(f"{ODOO_DATABASE_URL}/xmlrpc/2/object")
            
            # Read user data
            user_data = models.execute_kw(
                ODOO_DATABASE_NAME, uid, password,
                'res.users', 'read',
                [uid],
                {'fields':['name', 'login', 'email']}
            )
            
            if user_data:
                user = user_data[0]
                log.info(f"Login successful for {email}")
                return{
                    "is_valid": True,
                    "user_id": uid,
                    "name": user.get("name", "Admin"),
                    "email": user.get("login", email)
                }
        else:
            log.error(f"Invalid credentials for {email}")
            return{
                "is_valid": False,
                "error": "Invalid email or password."
            }
    
    except xmlrpc.client.Fault as e:
        log.error(f"XML-RPC Fault: {e}")
        return{
            "is_valid": False,
            "error": "Invalid credentials"
        }
    
    except Exception as e:
        log.error(f"Error: {e}")
        return{
            "is_valid": False,
            "error": "Authentication Failed."
        }