export const VK_WEB_CLIENT_ID = "54761285";
export const VK_WEB_REDIRECT_URI = "https://g-kylexy.github.io/vkomic/vk-callback.html";
export const VK_AUTHORIZATION_ENDPOINT = "https://id.vk.ru/authorize";

const PENDING_AUTHORIZATIONS_KEY = "vk_oauth_pending_authorizations";
const LEGACY_PENDING_STATE_KEY = "vk_oauth_state";
const LEGACY_PENDING_VERIFIER_KEY = "vk_oauth_code_verifier";
const PENDING_AUTHORIZATION_TTL_MS = 10 * 60 * 1000;

interface PendingVkAuthorization {
  state: string;
  codeVerifier: string;
  createdAt: number;
}

const readPendingVkAuthorizations = (): PendingVkAuthorization[] => {
  try {
    const raw = localStorage.getItem(PENDING_AUTHORIZATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - PENDING_AUTHORIZATION_TTL_MS;
    return parsed.filter((item): item is PendingVkAuthorization =>
      typeof item?.state === "string" &&
      typeof item?.codeVerifier === "string" &&
      typeof item?.createdAt === "number" &&
      item.createdAt >= cutoff
    );
  } catch {
    return [];
  }
};

const savePendingVkAuthorizations = (items: PendingVkAuthorization[]): void => {
  localStorage.setItem(PENDING_AUTHORIZATIONS_KEY, JSON.stringify(items.slice(-5)));
};

export interface VkAuthSession {
  accessToken: string;
  refreshToken: string;
  deviceId: string;
  expiresIn: number;
}

const randomHex = (byteLength: number): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const base64Url = (bytes: ArrayBuffer): string => {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

export const createVkAuthorizationUrl = async (): Promise<string> => {
  const state = randomHex(24);
  const codeVerifier = randomHex(32);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier));
  savePendingVkAuthorizations([
    ...readPendingVkAuthorizations().filter((item) => item.state !== state),
    { state, codeVerifier, createdAt: Date.now() },
  ]);

  const params = new URLSearchParams({
    client_id: VK_WEB_CLIENT_ID,
    redirect_uri: VK_WEB_REDIRECT_URI,
    response_type: "code",
    code_challenge: base64Url(digest),
    code_challenge_method: "s256",
    state,
  });
  return `${VK_AUTHORIZATION_ENDPOINT}?${params.toString()}`;
};

export const readPendingVkAuthorization = (state: string): { state: string; codeVerifier: string } | null => {
  const pending = readPendingVkAuthorizations();
  savePendingVkAuthorizations(pending);
  return pending.find((item) => item.state === state) || null;
};

export const clearPendingVkAuthorization = (state?: string): void => {
  if (state) {
    savePendingVkAuthorizations(readPendingVkAuthorizations().filter((item) => item.state !== state));
  } else {
    localStorage.removeItem(PENDING_AUTHORIZATIONS_KEY);
  }
  sessionStorage.removeItem(LEGACY_PENDING_STATE_KEY);
  sessionStorage.removeItem(LEGACY_PENDING_VERIFIER_KEY);
};

export const createVkState = (): string => randomHex(24);

export const parseVkCallback = (rawUrl: string): {
  code: string;
  deviceId: string;
  state: string;
} => {
  const url = new URL(rawUrl);
  if (url.protocol !== "vkomic:" || url.hostname !== "vk-auth") {
    throw new Error("Lien de retour VK ID invalide.");
  }
  const error = url.searchParams.get("error");
  if (error) {
    throw new Error(url.searchParams.get("error_description") || error);
  }
  const code = url.searchParams.get("code");
  const deviceId = url.searchParams.get("device_id");
  const state = url.searchParams.get("state");
  if (!code || !deviceId || !state) {
    throw new Error("Réponse VK ID incomplète.");
  }
  return { code, deviceId, state };
};
