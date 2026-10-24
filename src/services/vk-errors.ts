import type { Translations } from "../i18n";

const VK_ERROR_CODE = /"error_code"\s*:\s*(\d+)/;

/**
 * Turn a VK API failure (vk-service embeds VK's JSON error in the message)
 * into a message the user can act on.
 */
export const describeVkError = (error: unknown, t: Translations, fallback: string): string => {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const code = Number(message.match(VK_ERROR_CODE)?.[1]);

  switch (code) {
    case 5:
      return t.browser.errorSessionExpired;
    case 6:
    case 9:
    case 29:
      return t.browser.errorRateLimited;
    case 15:
      return t.browser.errorAccessDenied;
    case 18:
      return t.browser.errorAccountBlocked;
    case 1051:
      return t.browser.errorAppNotApproved;
    default:
      return fallback;
  }
};
