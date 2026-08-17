import type { UUID } from "crypto";

export interface Outlet {
    outlet_id: number;
    outlet_name: string | null;
    outlet_status: string | null;
    outlet_location: string | null;
    active: string | null;
    last_seen: string | null;
    order_api_url: string | null;
    order_api_key: string | null;
    tier: string | null;
    uuid: UUID | null;
}