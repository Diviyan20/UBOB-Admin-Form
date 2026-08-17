from models.media_library import sync_media_library, get_all_media

def refresh_media_library():
    """
    Synchronize the media_library table with S3,
    then return the current media list.
    """
    sync_media_library()
    
    return get_all_media()