
import { useState, useEffect } from "react";
import { VkConnectionStatus } from "../types";
import { mapRegion } from "../utils/region";
import { tauriVk } from "../lib/tauri";

export const useVkConnection = (vkToken: string) => {
    const [vkStatus, setVkStatus] = useState<VkConnectionStatus>({
        connected: false,
        latencyMs: null,
        lastSync: localStorage.getItem("vk_last_sync_time"),
        region: null,
        regionAggregate: null,
    });

    useEffect(() => {
        if (!vkToken) {
            setVkStatus((prev) => ({
                ...prev,
                connected: false,
                latencyMs: null,
                error: null,
            }));
            return;
        }

        // One cheap call per session/token so the status reflects VK at launch
        // instead of staying red until the first manual sync.
        let cancelled = false;
        tauriVk
            .ping(vkToken)
            .then((latencyMs) => {
                if (cancelled) return;
                setVkStatus((prev) => ({ ...prev, connected: true, latencyMs, error: null }));
            })
            .catch((error) => {
                console.warn("VK ping failed:", error);
            });
        return () => {
            cancelled = true;
        };
    }, [vkToken]);

    useEffect(() => {
        if (vkStatus.lastSync) {
            localStorage.setItem("vk_last_sync_time", vkStatus.lastSync);
        }
    }, [vkStatus.lastSync]);

    useEffect(() => {
        // Initialise uniquement la région, sans appel API.
        const rawRegion =
            Intl?.DateTimeFormat?.().resolvedOptions().timeZone ||
            (typeof navigator !== "undefined" ? navigator.language : null) ||
            null;
        const regionAggregate = mapRegion(rawRegion);
        setVkStatus((prev) => ({ ...prev, region: rawRegion, regionAggregate }));
    }, []);

    return { vkStatus, setVkStatus };
};
