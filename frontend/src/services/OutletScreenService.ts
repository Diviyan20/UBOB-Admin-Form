import { api } from "../api/client";
import type { CreateOutletScreenPayload, OutletScreen, UpdateOutletScreenPayload } from "../types/OutletScreen";

interface GetAllOutletScreensResponse{
    success: boolean;
    data: OutletScreen[];
}

interface MutationResponse{
    success: boolean;
    error?: string;
}

function authHeaders(): HeadersInit{
    const token = localStorage.getItem("admin_token");
    return{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };
}

export async function getAllOutletScreens(): Promise<OutletScreen[]>{
    const response = await fetch(api.outlet_screens, {
        method: "GET",
        headers: authHeaders(),
    });

    if(!response.ok) throw new Error(`Failed to fetch outlet screens. Server returned ${response.status}`);

    const result: GetAllOutletScreensResponse = await response.json();

    if(!result.success) throw new Error("Failed to fetch outlet screen information");

    return result.data;
}

export async function createOutletScreen(payload: CreateOutletScreenPayload): Promise<void> {
    const response = await fetch(api.outlet_screens, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
 
    const result: MutationResponse = await response.json();
 
    if (!response.ok || !result.success) {
        throw new Error(result.error ?? `Failed to create outlet screen. Server returned ${response.status}`);
    }
}

export async function updateOutletScreen(screenId: string, payload: UpdateOutletScreenPayload): Promise<void> {
    const response = await fetch(api.outlet_screen(screenId), {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
 
    const result: MutationResponse = await response.json();
 
    if (!response.ok || !result.success) {
        throw new Error(result.error ?? `Failed to update outlet screen. Server returned ${response.status}`);
    }
}

export async function deleteOutletScreen(screenId: string): Promise<void> {
    const response = await fetch(api.outlet_screen(screenId), {
        method: "DELETE",
        headers: authHeaders(),
    });
 
    const result: MutationResponse = await response.json();
 
    if (!response.ok || !result.success) {
        throw new Error(result.error ?? `Failed to delete outlet screen. Server returned ${response.status}`);
    }
}