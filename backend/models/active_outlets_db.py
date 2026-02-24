import datetime
import logging
from time import timezone
import psycopg2
import os

from dotenv import load_dotenv

load_dotenv()

# ENVIRONMENT VARIABLES
OUTLET_DATABASE = os.getenv("OUTLET_DATABASE")
DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOSTNAME = os.getenv("DB_HOSTNAME")
DB_PORT = os.getenv("DB_PORT")

# ================
# LOGGING SETUP
# ================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

def get_db_connection():
    # Connect to the database with Environment Variables using psycopg2
    try:
        conn = psycopg2.connect(
            database = OUTLET_DATABASE,
            user = DB_USERNAME,
            password = DB_PASSWORD,
            host = DB_HOSTNAME,
            port = DB_PORT
        )
        
        cur = conn.cursor()
    
        yield conn, cur
    
    # Error handling for Connection Error
    except psycopg2.Error as e:
        log.error(f"Database connection Error: {e}")
        if conn:
            conn.rollback()
        raise

    finally:
        if cur and conn:
            cur.close()
            conn.close()

def get_outlet_info(outlet_id: str) -> dict:
    """
    Get outlet information from the Database based on 'outlet_id'.
    Returns None if no ID is found.
    """
    try:
        with get_db_connection as (conn, cur):
            query = "SELECT * FROM active_outlets WHERE outlet_id = %s"     # Query to select all fields based on outlet_id
            
            cur.execute(query, [outlet_id])     # Executes query with outlet_id as the parameter
            
            outlet = cur.fetchone()
            
            # If outlet does not exist
            if not outlet:
                return None
            else:
                return{
                "outlet_id": outlet[0],
                "outlet_name": outlet[1],
                "outlet_status": outlet[2],
                "outlet_location": outlet[3],
                "active": outlet[4],
                "last_seen": outlet[5],
                "order_api_url": outlet[6],
                "order_api_key": outlet[7]
            }
    
    except Exception as e:
        log.error(f"Database Error: {e}")

def register_outlet(outlet_id:str, outlet_name:str, region_name:str, 
                    order_api_url:str, order_api_key:str):
    """
    Register a new outlet into the Database.
    
    Utilizes the 'get_db_connection' function to connect to the database.
    """
    try:
        with get_db_connection as (conn, cur):
            now = datetime.now(timezone.utc)
            
            # Check if outlet exists
            existing = get_outlet_info(outlet_id)
            
            if not existing:
                # Register the outlet if it does not exist
                query = """
                    INSERT INTO active_outlets 
                    (outlet_id, outlet_name, outlet_status, outlet_location, 
                     active, last_seen, order_api_url, order_api_key)
                    VALUES (%s, %s, 'online', %s, %s, %s, %s, %s)
                    RETURNING *
                """
                cur.execute(query, [outlet_id, outlet_name, region_name, now, now, order_api_url, order_api_key])
                
                outlet = cur.fetchone()
                conn.commit()
                
            return{
                "success": True,
                "outlet_id": outlet[0],
                "outlet_name": outlet[1],
                "outlet_status": outlet[2],
                "outlet_location": outlet[3],
                "order_api_url": outlet[6],
                "order_api_key": outlet[7]
            }
    
    except Exception as e:
        log.error(f"Failed to register outlet: {e}")
        return {"success": False, "error":str(e)}