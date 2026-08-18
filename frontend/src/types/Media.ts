import type { UUID } from "crypto";

export interface MediaLibraryItem {
    media_id: UUID;
    file_name: string;
    object_key: string;
    created_at: string | null;
}