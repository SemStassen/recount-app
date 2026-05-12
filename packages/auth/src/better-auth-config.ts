import { parseOrigins } from "@recount/core-server/shared/config";
import { Config, Effect, Layer, Context } from "effect";

export interface BetterAuthConfigShape {
  secret: string;
  googleClientId: string;
  googleClientSecret: string;
  crossSubDomainCookieDomain: string;
  trustedOrigins: Array<string>;
}

export class BetterAuthConfig extends Context.Service<
  BetterAuthConfig,
  BetterAuthConfigShape
>()("@recount/auth/BetterAuthConfig") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function* () {
      const secret = yield* Config.string("BETTER_AUTH_SECRET");
      const googleClientId = yield* Config.string("GOOGLE_CLIENT_ID");
      const googleClientSecret = yield* Config.string("GOOGLE_CLIENT_SECRET");
      const crossSubDomainCookieDomain = yield* Config.string(
        "CROSS_SUB_DOMAIN_COOKIE_DOMAIN"
      );
      const frontendOrigins = yield* Config.string("FRONTEND_ORIGINS");

      const trustedOrigins = yield* parseOrigins(frontendOrigins);

      return {
        secret,
        googleClientId,
        googleClientSecret,
        crossSubDomainCookieDomain,
        trustedOrigins,
      };
    })
  );
}
