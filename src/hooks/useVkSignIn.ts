import { useCallback, useState } from "react";
import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useVk } from "../context/VkContext";
import { getT } from "../i18n";
import {
  createVkAuthorizationRequest,
  exchangeVkAuthorizationCode,
  VK_ANDROID_REDIRECT_URI,
} from "../services/vk-auth";

WebBrowser.maybeCompleteAuthSession();

/**
 * Opens the VK ID sign-in page straight away and stores the session when VK
 * redirects back to the app. No intermediate screen, nothing to copy.
 */
export const useVkSignIn = () => {
  const { language, handleAuthSuccess } = useVk();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signIn = useCallback(async () => {
    const t = getT(language);
    setIsSigningIn(true);
    try {
      const request = await createVkAuthorizationRequest();
      // When the VK app is installed, VK ID hands off to it and then asks the user to
      // "return to the browser". Keep the tab in Vkomic's own task: by default it opens
      // in a separate task hidden from recents, so returning meant reopening Vkomic,
      // which cancels the session. Now reopening Vkomic shows the VK ID tab again.
      const result = await WebBrowser.openAuthSessionAsync(request.url, VK_ANDROID_REDIRECT_URI, {
        createTask: false,
      });
      if (result.type !== "success") return;

      const callback = new URL(result.url);
      const error = callback.searchParams.get("error");
      if (error) {
        throw new Error(callback.searchParams.get("error_description") || error);
      }
      const returnedState = callback.searchParams.get("state");
      const code = callback.searchParams.get("code");
      const deviceId = callback.searchParams.get("device_id");
      if (returnedState !== request.state || !code || !deviceId) {
        throw new Error(t.settings.signInIncomplete);
      }

      const session = await exchangeVkAuthorizationCode(
        code,
        deviceId,
        request.state,
        request.codeVerifier,
      );
      await handleAuthSuccess(session);
    } catch (error) {
      Alert.alert(
        t.settings.signInFailed,
        error instanceof Error ? error.message : t.settings.signInUnknownError,
      );
    } finally {
      setIsSigningIn(false);
    }
  }, [language, handleAuthSuccess]);

  return { signIn, isSigningIn };
};
