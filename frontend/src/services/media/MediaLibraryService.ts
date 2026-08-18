import { api } from "../../api/client";
import type { MediaLibraryItem } from "../../types/Media";

interface GetAllMediaResponse {
    success: boolean;
    data: MediaLibraryItem[];
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

    if (!response.ok) {
        throw new Error(`Failed to fetch media library. Server returned ${response.status}`);
    }

    const result: GetAllMediaResponse = await response.json();

    if (!result.success) {
        throw new Error("Failed to fetch media library information");
    }

    return result.data;
}