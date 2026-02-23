import logging
import os
import requests
from dotenv import load_dotenv


load_dotenv()

# ENVIRONMENT VARIABLE CONFIGURATION
ODOO_DATABASE_URL = os.getenv("ODOO_DATABASE_URL")
ODOO_API_TOKEN = os.getenv("ODOO_API_TOKEN")

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

def fetch_all_users():
    """
    Fetch all users from the Odoo res.users model
    
    Returns:
        list: List of user dictionaries with id, name, login, password fields 
    """
    try:
        log.info("Fetching all users from Odoo res.users...")
        
        response = requests.post(
            f"{ODOO_DATABASE_URL}/api/users",
            json={},
            headers=odoo_headers(),
            timeout=15
        )
        
        response.raise_for_status()
        
        data = response.json()
        users = data.get("data",[])
        
        log.info(f"Fetched {len(users)} users from Odoo.")
        return users

    except Exception as e:
        log.error(f"Error fetching data: {e}")
        return []

def validate_admin_login(email:str, passwrod: str)-> dict:
    """
    Validate admin credentials against Odoo res.users (brute force method).
    
    This fetches all users and checks if email and password match.
    Note: This is temporary until a secure authentication endpoint is available.
    
    Args:
        email: Admin email/login
        password: Admin password
    
    Returns:
        dict: {"is_valid": bool, "user_id": int, "name": str} or {"is_valid": False, "error": str}
    """
    try:
        log.info(f"Validating email for {email}")
        
        users = fetch_all_users()
        
        if not users:
            return{
                "is_valid": False,
                "error": "Could not fetch users from Odoo."
            }
        
        # Searching for matching user
        for user in users:
            user_login = user.get("login", "")
            user_password = user.get("password", "")
            
            # Check if login matches
            if user_login.lower() == email.lower():
                # Check for password
                if user_password == passwrod:
                    log.info(f"Login successful for {email}")
                    return {
                        "is_valid": True,
                        "user_id": user.get("id"),
                        "name": user.get("name", "Admin"),
                        "email": user_login
                    }
                
        log.warning(f"❌ Invalid credentials for {email}")
        return {
            "is_valid": False,
            "error": "Invalid email or password"
        }
    
    except Exception as e:
        log.error(f"Error validating email: {e}")
        return{
            "is_valid": False,
            "error":"Authentication Failed"
        }