import { isDesktop } from "../utils/platform";

const BEARER_TOKEN_STORAGE_KEY = "recount.bearer_token";

export const getBearerToken = () => {
  if (!isDesktop) {
    return "";
  }

  return globalThis.localStorage?.getItem(BEARER_TOKEN_STORAGE_KEY) ?? "";
};

export const getAuthHeaders = (): Readonly<Record<string, string>> => {
  const token = getBearerToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const storeBearerTokenFromResponse = (response: Response) => {
  if (!isDesktop) {
    return;
  }

  const token = response.headers.get("set-auth-token");
  if (token) {
    globalThis.localStorage?.setItem(BEARER_TOKEN_STORAGE_KEY, token);
  }
};

export const clearBearerToken = () => {
  if (!isDesktop) {
    return;
  }

  globalThis.localStorage?.removeItem(BEARER_TOKEN_STORAGE_KEY);
};
