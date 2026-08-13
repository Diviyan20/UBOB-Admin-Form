import { api } from "../api/client";
import type { Outlet } from "../types/Outlet";

interface GetAllOutletsResponse{
    success: boolean;
    data: Outlet[];
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