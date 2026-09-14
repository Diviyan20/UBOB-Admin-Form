import json
import os
import logging

import boto3
import psycopg2
from psycopg2 import sql
from psycopg2.extras import RealDictCursor

log = logging.getLogger(__name__)

# ENVIRONMENT VARIABLES
DB_NAME = os.getenv("OUTLET_DATABASE")
DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOSTNAME = os.getenv("DB_HOSTNAME")
DB_PORT = os.getenv("DB_PORT")

# DATABASE CONNECTION
def get_db_connection():
    return psycopg2.connect(
        database=DB_NAME,
        user=DB_USERNAME,
        password=DB_PASSWORD,
        host=DB_HOSTNAME,
        port=DB_PORT,
        cursor_factory=RealDictCursor
    )

# RETRIEVE SYSTEM CONFIGURATION VALUES
def get_system_config():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            query = "SELECT * FROM system_config LIMIT 1"
            
            cur.execute(query)
            result = cur.fetchone()
            
            log.info("[CONFIG] Database result: %s", result)
            
            return result


# UPDATE FIELD VALUE
def update_system_config_field(field_name: str, value):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                query = sql.SQL("""
                    UPDATE system_config
                    SET {field} = %s
                    """    
                ).format(field=sql.Identifier(field_name))
                
                cur.execute(query, (value,),)
                
                if cur.rowcount == 0:
                    return{
                        "success": False,
                        "error": "No system configuration row found",
                    }
            
            conn.commit()
        
        return{
            "success": True,
            "message": f"Field '{field_name}' updated successfully",
        }
    
    except Exception as e:
        log.error(f"Failed to update system config field {field_name}: {e}")
        
        return{
            "success": False,
            "error": str(e),
        }

# CREATE / ADD FIELD
def add_system_config_field(field_name: str, default_value=0):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:

                # Check whether the column already exists
                cur.execute(
                    """
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'system_config'
                    AND column_name = %s
                    """,
                    (field_name,),
                )

                if cur.fetchone():
                    return {
                        "success": False,
                        "error": (
                            f"Field '{field_name}' already exists"
                        ),
                    }

                query = sql.SQL("""
                    ALTER TABLE system_config
                    ADD COLUMN {field} BIGINT DEFAULT %s
                """).format(
                    field=sql.Identifier(field_name)
                )

                cur.execute(
                    query,
                    (default_value,),
                )

            conn.commit()

        return {
            "success": True,
            "message": (
                f"Field '{field_name}' created successfully"
            ),
        }

    except Exception as e:
        log.error(
            "Failed to add system config field %s: %s",
            field_name,
            e,
        )

        return {
            "success": False,
            "error": str(e),
        }

# DELETE FIELD
def delete_system_config_field(field_name: str):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:

                # Prevent deletion of PostgreSQL table-critical
                # or application-required fields.
                protected_fields = {
                    "image_display_duration",
                    "fade_duration",
                    "state_interval",
                    "outlet_image_flip_interval",
                    "version_check",
                    "refresh_status",
                }

                if field_name in protected_fields:
                    return {
                        "success": False,
                        "error": (
                            f"Field '{field_name}' cannot be deleted"
                        ),
                    }

                # Check whether the column exists
                cur.execute(
                    """
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'system_config'
                    AND column_name = %s
                    """,
                    (field_name,),
                )

                if not cur.fetchone():
                    return {
                        "success": False,
                        "error": (
                            f"Field '{field_name}' does not exist"
                        ),
                    }

                query = sql.SQL("""
                    ALTER TABLE system_config
                    DROP COLUMN {field}
                """).format(
                    field=sql.Identifier(field_name)
                )

                cur.execute(query)

            conn.commit()

        return {
            "success": True,
            "message": (
                f"Field '{field_name}' deleted successfully"
            ),
        }

    except Exception as e:
        log.error(
            "Failed to delete system config field %s: %s",
            field_name,
            e,
        )

        return {
            "success": False,
            "error": str(e),
        }