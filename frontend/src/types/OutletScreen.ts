import type { UUID } from "crypto";

export type ScreenType = "Signage" | "Media Player";
export type Tier = "Tier A" | "Tier B";
export type Orientation = "Portrait" | "Landscape";

export interface OutletScreen {
    screen_id: UUID;
    outlet_uid: UUID;
    outlet_name: string | null;
    screen_type: ScreenType;
    batch_num: number | null;
    tier: Tier | null;
    orientation: Orientation;
    video_uuid: UUID | null;
    video_name: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface CreateOutletScreenPayload {
    outlet_uid: string;
    screen_type: ScreenType;
    orientation: Orientation;
    batch_num?: number | null;
    tier?: Tier | null;
    video_uuid?: string | null;
}

export type UpdateOutletScreenPayload = Partial<CreateOutletScreenPayload>;