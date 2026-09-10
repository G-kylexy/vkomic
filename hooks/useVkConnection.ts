
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
            }));
        }
    }, [vkToken]);

    useEffect(() => {
        if (vkStatus.lastSync) {
            localStorage.setItem("vk_last_sync_time", vkStatus.lastSync);
        }
    }, [vkStatus.lastSync]);

    useEffect(() => {
        // Déduit une région agrégée à partir de la timezone/locale
        const rawRegion =
            Intl?.DateTimeFormat?.().resolvedOptions().timeZone ||
            (typeof navigator !== "undefined" ? navigator.language : null) ||
            null;

        const regionAggregate = mapRegion(rawRegion);

        // One validation call per token, instead of polling VK every few seconds.
        // VK now applies monthly per-account API quotas, so connection status is
        // subsequently updated by explicit synchronization actions.
        let cancelled = false;

        const measurePing = async () => {
            if (!vkToken) {
                setVkStatus((prev) => {
                    if (
                        prev.connected === false &&
                        prev.latencyMs === null &&
                        prev.lastSync === null &&
                        prev.region === rawRegion &&
                        prev.regionAggregate === regionAggregate
                    ) {
                        return prev;
                    }
                    return {
                        ...prev,
                        connected: false,
                        latencyMs: null,
                        lastSync: null,
                        region: rawRegion,
                        regionAggregate,
                    };
                });
                return;
            }

            try {
                const latency = await tauriVk.ping(vkToken);
                if (cancelled) return;

                setVkStatus((prev) => {
                    const threshold = 50;
                    const latencyStable =
                        prev.latencyMs !== null &&
                        latency !== null &&
                        Math.abs(prev.latencyMs - latency) < threshold;

                    const nextLatency = latencyStable ? prev.latencyMs : latency;

                    if (
                        prev.connected === true &&
                        prev.latencyMs === nextLatency &&
                        prev.region === rawRegion &&
                        prev.regionAggregate === regionAggregate
                    ) {
                        return prev;
                    }

                    return {
                        ...prev,
                        connected: true,
                        latencyMs: nextLatency,
                        // lastSync est mis à jour par les actions "Sync", pas par le ping
                        region: rawRegion,
                        regionAggregate,
                    };
                });
            } catch (e) {
                if (cancelled) return;
                setVkStatus((prev) => {
                    if (
                        prev.connected === false &&
                        prev.latencyMs === null &&
                        prev.region === rawRegion &&
                        prev.regionAggregate === regionAggregate
                    ) {
                        return prev;
                    }
                    return {
                        ...prev,
                        connected: false,
                        latencyMs: null,
                        region: rawRegion,
                        regionAggregate,
                    };
                });
            }
        };

        void measurePing();

        return () => {
            cancelled = true;
        };
    }, [vkToken]);

    return { vkStatus, setVkStatus };
};
