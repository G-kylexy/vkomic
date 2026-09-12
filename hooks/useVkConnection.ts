
import { useState, useEffect } from "react";
import { VkConnectionStatus } from "../types";
import { mapRegion } from "../utils/region";

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
            }));
        }
    }, [vkToken]);

    useEffect(() => {
        if (vkStatus.lastSync) {
            localStorage.setItem("vk_last_sync_time", vkStatus.lastSync);
        }
    }, [vkStatus.lastSync]);

    useEffect(() => {
        // La disponibilité VK est mise à jour par les synchronisations explicites.
        // Ici on ne fait qu'initialiser la région, sans consommer un appel API.
        const rawRegion =
            Intl?.DateTimeFormat?.().resolvedOptions().timeZone ||
            (typeof navigator !== "undefined" ? navigator.language : null) ||
            null;
        const regionAggregate = mapRegion(rawRegion);
        setVkStatus((prev) => ({ ...prev, region: rawRegion, regionAggregate }));
    }, []);

    return { vkStatus, setVkStatus };
};
