import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "../env";
import {
  clearBearerToken,
  getBearerToken,
  storeBearerTokenFromResponse,
} from "./bearer-token";

const betterAuthClient = createAuthClient({
  baseURL: env.VITE_BACKEND_URL,
  fetchOptions: {
    onSuccess: (ctx) => {
      storeBearerTokenFromResponse(ctx.response);
    },
    auth: {
      type: "Bearer",
      token: getBearerToken,
    },
  },
  plugins: [emailOTPClient()],
});

export const sendSignInOtp = (params: { readonly email: string }) =>
  betterAuthClient.emailOtp.sendVerificationOtp({
    type: "sign-in",
    email: params.email,
  });

export const signInWithEmailOtp = (params: {
  readonly email: string;
  readonly otp: string;
}) => betterAuthClient.signIn.emailOtp(params);

export const signInWithGoogle = () =>
  betterAuthClient.signIn.social({
    provider: "google",
  });

export const signOut = async () => {
  await betterAuthClient.signOut();
  clearBearerToken();
};
