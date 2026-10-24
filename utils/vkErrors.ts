import type { Translations } from "../i18n";

const VK_ERROR_CODE = /"error_code"\s*:\s*(\d+)/;

/**
 * Turn a VK API failure (Tauri rejects with the Rust error string, which embeds
 * VK's JSON error) into a message the user can act on.
 */
export const describeVkError = (error: unknown, t: Translations): string => {
    const message = error instanceof Error ? error.message : String(error ?? "");
    const code = Number(message.match(VK_ERROR_CODE)?.[1]);

    switch (code) {
        case 5:
            return t.errors.vkSessionExpired;
        case 6:
        case 9:
        case 29:
            return t.errors.vkRateLimited;
        case 15:
            return t.errors.vkAccessDenied;
        case 18:
            return t.errors.vkAccountBlocked;
        case 1051:
            return t.errors.vkAppNotApproved;
        default:
            return t.errors.vkUnavailable;
    }
};
