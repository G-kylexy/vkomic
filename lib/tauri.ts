import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open as openExternal } from "@tauri-apps/plugin-shell";
import { open as selectFolder } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { VkNode } from "../types";
import { VkAuthSession } from "./vk-auth";

// --- VK API Commands ---
export const tauriVk = {
    exchangeAuthCode: (code: string, deviceId: string, state: string, codeVerifier: string) =>
        invoke<VkAuthSession>("vk_exchange_auth_code", { code, deviceId, state, codeVerifier }),
    refreshAuthToken: (refreshToken: string, deviceId: string, state: string) =>
        invoke<VkAuthSession>("vk_refresh_auth_token", { refreshToken, deviceId, state }),
    ping: (token: string) => invoke<number>("vk_ping", { token }),
    fetchRootIndex: (token: string, groupId: string, topicId: string) =>
        invoke<VkNode[]>("vk_fetch_root_index", { token, groupId, topicId }),
    fetchFullIndex: (token: string, groupId: string, topicId: string) =>
        invoke<VkNode[]>("vk_fetch_full_index", { token, groupId, topicId }),
    fetchNodeContent: (token: string, groupId: string, topicId: string) =>
        invoke<VkNode>("vk_fetch_node_content", { token, groupId, topicId }),
    refreshCounts: (token: string, groupId: string, topicIds: string[]) =>
        invoke<Record<string, number>>("vk_refresh_counts", { token, groupId, topicIds }),
};

// --- Filesystem Commands ---
export const tauriFs = {
    listDirectory: (path: string) => invoke<any>("fs_list_directory", { path }),
    openPath: (path: string) => invoke<void>("fs_open_path", { path }),
    revealPath: (path: string) => invoke<void>("fs_reveal_path", { path }),
    queueDownload: (id: string, url: string, directory: string, fileName: string, expectedSize?: number, token?: string) =>
        invoke<void>("fs_queue_download", { id, url, directory, fileName, expectedSize, token }),
    cancelDownload: (id: string) => invoke<boolean>("fs_cancel_download", { id }),
    resetDownload: (id: string, directory: string, fileName: string) =>
        invoke<void>("fs_reset_download", { id, directory, fileName }),
    clearDownloadQueue: () => invoke<number>("fs_clear_download_queue"),
};

// --- Settings Commands ---
export interface AppSettings {
    vk_token: string;
    vk_refresh_token: string;
    vk_device_id: string;
    vk_token_expires_at: number;
    vk_group_id: string;
    vk_topic_id: string;
    vk_download_path: string;
}

export const tauriSettings = {
    load: () => invoke<AppSettings>("settings_load"),
    save: (settings: AppSettings) => invoke<void>("settings_save", { settings }),
};

// --- Shell Commands ---
export const tauriShell = {
    openExternal: (url: string) => openExternal(url),
};

export const tauriDeepLink = {
    getCurrent,
    onOpenUrl,
};

// --- Dialog Commands ---
export const tauriDialog = {
    selectFolder: () => selectFolder({ directory: true, multiple: false }),
};

// --- Window Commands ---
const getWindow = () => getCurrentWindow();

export const tauriWin = {
    minimize: async () => { try { await getWindow().minimize(); } catch (e) { console.error("Failed to minimize:", e); } },
    maximize: async () => { try { await getWindow().toggleMaximize(); } catch (e) { console.error("Failed to maximize:", e); } },
    close: async () => { try { await getWindow().close(); } catch (e) { console.error("Failed to close:", e); } },
};

// --- Events ---
export const tauriEvents = {
    onDownloadProgress: (callback: (payload: any) => void) =>
        listen("download-progress", (event) => callback(event.payload)),
    onDownloadResult: (callback: (payload: any) => void) =>
        listen("download-result", (event) => callback(event.payload)),
};

// --- VK API Helpers (avec valeurs par défaut) ---
const VK_DEFAULTS = { GROUP: "203785966", TOPIC: "47515406" };

export const fetchRootIndex = async (token: string, groupId?: string, topicId?: string): Promise<VkNode[]> => {
    try {
        return await tauriVk.fetchRootIndex(token, groupId?.trim() || VK_DEFAULTS.GROUP, topicId?.trim() || VK_DEFAULTS.TOPIC);
    } catch (error) {
        console.error("VK API Error (Root):", error);
        throw error;
    }
};

export const fetchNodeContent = async (token: string, node: VkNode): Promise<VkNode> => {
    if (!node.vkGroupId || !node.vkTopicId) return { ...node, isLoaded: true, children: [] };
    try {
        const result = await tauriVk.fetchNodeContent(token, node.vkGroupId, node.vkTopicId);
        return { ...result, title: node.title };
    } catch (error) {
        // Rethrow so the caller shows the error without caching a broken node.
        console.error("VK API Error (Node):", error);
        throw error;
    }
};

export const fetchFolderTreeUpToDepth = async (token: string, groupId?: string, topicId?: string): Promise<VkNode[]> => {
    try {
        return await tauriVk.fetchFullIndex(token, groupId?.trim() || VK_DEFAULTS.GROUP, topicId?.trim() || VK_DEFAULTS.TOPIC);
    } catch (error) {
        console.error("VK API Error (Full Index):", error);
        throw error;
    }
};
