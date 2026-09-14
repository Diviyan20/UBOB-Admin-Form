import { api } from "../../api/client";
import type { Outlet } from "../../types/Outlet";

interface GetAllOutletsResponse{
    success: boolean;
    data: Outlet[];
}

interface RefreshOutletStatusResponse{
    success: boolean;
    data: Outlet[];
    marked_offline: number[];
    count: number;
    error?: string;
}

export async function getAllOutlets(): Promise<Outlet[]>{
    const token = localStorage.getItem("admin_token");
    const response = await fetch(api.outlets, {
        method:"GET",
        headers:{
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });

    if(!response.ok){
        throw new Error(`Failed to fetch outlets. Server returned ${response.status}`);
    }

    const result: GetAllOutletsResponse = await response.json();
    
    if (!result.success) {
        throw new Error("Failed to fetch outlet information");
    }

    return result.data;
}

export async function refreshOutletStatus(): Promise<Outlet[]> {
    const response = await fetch(api.refresh_outlet_status, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const result: RefreshOutletStatusResponse = await response.json();

    if (!response.ok) {
        console.error("Refresh outlet status API error:", result);
        throw new Error(
            result.error || `Failed to refresh outlet status. Server returned ${response.status}`
        );
    }

    if (!result.success) {
        throw new Error(result.error || "Failed to refresh outlet status");
    }

    return result.data;
}