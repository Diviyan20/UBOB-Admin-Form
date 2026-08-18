import { api } from "../../api/client";
import type { MediaLibraryItem } from "../../types/Media";

interface GetAllMediaResponse {
    success: boolean;
    data: MediaLibraryItem[];
    error?: string;
}

interface PreviewUrlResponse {
    success: boolean;
    url?: string;
    file_name?: string;
    error?: string;
}

function authHeaders(): HeadersInit {
    const token = localStorage.getItem("admin_token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };
}

export async function getAllMedia(): Promise<MediaLibraryItem[]> {
    const response = await fetch(api.media_library, {
        method: "GET",
        headers: authHeaders(),
    });
    const result: GetAllMediaResponse = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.error ?? `Failed to fetch media library. Server returned ${response.status}`);
    }

    return result.data;
}

export async function getMediaPreviewUrl(mediaId: string): Promise<string>{
    const response = await fetch(api.media_preview(mediaId),{
        method: "GET",
        headers: authHeaders(),
    });

    const result: PreviewUrlResponse = await response.json();

    if (!response.ok || !result.success || !result.url) {
        throw new Error(result.error ?? `Failed to get preview URL. Server returned ${response.status}`);
    }
    
    return result.url;
}