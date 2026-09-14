import re
from models.system_config_model import (
    get_system_config,
    update_system_config_field,
    add_system_config_field,
    delete_system_config_field,
)

# VALIDATION
VALID_FIELD_NAME = re.compile(r"^[a-zA-Z_][a-zA-Z0-9_]*$")

def validate_field_name(field_name: str):
    """
    Validate a PostgreSQL column name before allowing
    dynamic SQL operations.
    """
    if not field_name:
        return{
            "success": False,
            "error": "Field name is required",
        }
    
    if not VALID_FIELD_NAME.match(field_name):
        return{
            "success": False,
            "error": (
                "Invalid field name. "
                "Only letters, numbers and underscores are allowed."
            ),
        }
    
    return None

# ===========
# READ
# ===========
def fetch_system_config():
    """
    Fetch the current system configuration.
    """
    config = get_system_config()
    
    if not config:
        return{
            "success": False,
            "error": "No system configuration found",
        }
    
    return{
        "success": True,
        "data": config,
    }

# ==========
# UPDATE
# ==========
def edit_system_config_field(field_name: str, value):
    """
    Update an existing system_config field.
    """
    validation_error = validate_field_name(field_name)
    
    if validation_error:
        return validation_error

    return update_system_config_field(
        field_name=field_name,
        value=value,
    )

# ==============
# CREATE FIELD
# ==============
def create_system_config_field(field_name: str, default_value = 0):
    """
    Add a new column to the system_config table.
    """
    validation_error = validate_field_name(field_name)
    
    if validation_error:
        return validation_error

    return add_system_config_field(
        field_name=field_name,
        default_value=default_value,
    )

# ==============
# DELETE FIELD
# ==============
def remove_system_config_field(field_name: str):
    """
    Delete a column from the system config table.
    """
    validation_error = validate_field_name(field_name)
    
    if validation_error:
        return validation_error

    return delete_system_config_field(
        field_name=field_name
    )