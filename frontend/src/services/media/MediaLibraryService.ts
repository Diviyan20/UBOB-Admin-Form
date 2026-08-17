import { api } from "../../api/client";
import type { Media } from "../../types/Media";

interface MediaLibraryResponse{
    success: boolean[];
    data: Media[];
}

export async function refreshMediaLibrary(): Promise<Media[]>{
    const response = await fetch(api.media_library,{
        method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
    });

    if(!response.ok) throw new Error(`Failed to fetch media library: ${response.status}`);

    const result: MediaLibraryResponse = await response.json();

    if(!result.success) throw new Error("Failed to fetch media library");

    if(!Array.isArray(result.data)){
        throw new Error("Invalid media data received from server");
    }

    return result.data;

}