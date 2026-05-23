import { HttpClientRequest } from "effect/unstable/http";

import { getAuthHeaders } from "./bearer-token";

export const setAuthHeaders = (request: HttpClientRequest.HttpClientRequest) =>
  HttpClientRequest.setHeaders(request, getAuthHeaders());

export const authFetch: typeof fetch = (url, options) =>
  fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });
