import logging
from datetime import datetime, timedelta, timezone

from models.active_outlets import mark_device_offline, search_online_devices

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

INACTIVE_THRESHOLD_MINUTES = 5

def check_for_inactive_devices():
    """
    Mark online outlets as offline when their last heartbeat
    is older than the configured threshold.
    """
    now = datetime.now(timezone.utc)
    threshold = now - timedelta(minutes=INACTIVE_THRESHOLD_MINUTES)
    
    marked_offline = []
    
    try:
        devices = search_online_devices()
        for outlet_id, last_seen in devices:
            if not last_seen:
                continue
            
            if last_seen < threshold:
                success = mark_device_offline(outlet_id)
                
                if success:
                    marked_offline.append(outlet_id)
                    log.info(
                        "Outlet %s marked offline. Last seen: %s",
                        outlet_id,
                        last_seen
                    )
        
        return {
            "success": True,
            "marked_offline": marked_offline,
            "count": len(marked_offline),
        }
    
    except Exception as e:
        log.info(f"Inactive Device job failed: {e}")
        raise