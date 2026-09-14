import { api } from "../../api/client";

export interface SystemConfig{
    [key: string]: number | string | null;
}

interface SystemConfigResponse{
    success: boolean;
    data: SystemConfig;
    error?: string;
    message?: string;
}

interface SystemConfigMutationResponse{
    success: boolean;
    message?: string;
    error?: string;
}

// ----------------------
// Field label mapping
// ----------------------
export const SYSTEM_CONFIG_LABELS: Record<string, string> = {
    image_display_duration: "Image Display Duration",
    fade_duration: "Fade Duration",
    state_interval: "State Interval",
    outlet_image_flip_interval: "Outlet Image Flip Interval",
    version_check: "Version Check",
    refresh_status: "Refresh Status",
};

// --------------
// READ
// --------------
export async function getSystemConfig(): Promise<SystemConfig>{
    const response = await fetch(api.system_config, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const result: SystemConfigResponse = await response.json();

    console.log("[SYSTEM CONFIG] API response:", result);

    if (!response.ok || !result.success) {
        throw new Error(
            result.error ||
            result.message ||
            "Failed to fetch system configuration"
        );
    }

    if (!result.data) {
        throw new Error(
            "System configuration response does not contain config"
        );
    }

    return result.data;
}

// -----------------------
// Milliseconds → HH:MM:SS
// -----------------------
export function milliSecondsToTime(
    milliSeconds: number,
): string {
    const totalSeconds = Math.floor(milliSeconds / 1000);

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor(
        (totalSeconds % 3600) / 60,
    );

    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(
        minutes,
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


// -------------------------
// HH:MM:SS → Milliseconds
// -------------------------
export function timetoMilliseconds(
    time: string,
): number {
    const cleaned = time.trim();

    const parts = cleaned.split(":");

    if (parts.length !== 3) {
        throw new Error(
            "Invalid time format. Use HH:MM:SS",
        );
    }

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    const seconds = Number(parts[2]);

    if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        !Number.isInteger(seconds) ||
        hours < 0 ||
        minutes < 0 ||
        seconds < 0 ||
        minutes >= 60 ||
        seconds >= 60
    ) {
        throw new Error("Invalid time value");
    }

    return (
        hours * 60 * 60 * 1000 +
        minutes * 60 * 1000 +
        seconds * 1000
    );
}

// ---------------
// UPDATE
// ---------------
export async function updateSystemConfigField(
    fieldName: string,
    value: number,
): Promise<void>{
    const response = await fetch(
        `${api.system_config}/${encodeURIComponent(fieldName)}`,
        {
            method: "PUT",
            headers:{
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                value,
            }),
        },
    );

    const result: SystemConfigMutationResponse = await response.json();

    if(!response.ok || !result.success){
        throw new Error(result.error || "Failed to update system configuration");
    }
}

// ----------------
// CREATE FIELD
// ----------------
export async function createSystemConfigField(
    fieldName: string,
    defaultValue = 0,
): Promise<void>{
    const response = await fetch(
        `${api.system_config}/field`,
        {
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                field_name: fieldName,
                default_value: defaultValue,
            }),
        },
    );

    const result: SystemConfigMutationResponse = await response.json();

    if(!response.ok || !result.success){
        throw new Error(result.error ||  "Failed to create configuration field");
    }
}

// -----------------
// DELETE FIELD
// -----------------
export async function deleteSystemConfigField(
  fieldName: string,
): Promise<void> {
  const response = await fetch(
    `${api.system_config}/${encodeURIComponent(fieldName)}`,
    {
      method: "DELETE",
    },
  );

  const result: SystemConfigMutationResponse =
    await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.error ||
        "Failed to delete configuration field",
    );
  }
}