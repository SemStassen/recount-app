import { IdentityModule } from "@recount/core/modules/identity";
import { Email, UserId } from "@recount/core/shared/schemas";
import { Database, schema } from "@recount/db";
import { Mailer } from "@recount/notifications/mailer";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, emailOTP } from "better-auth/plugins";
import { Effect, Layer, Schema, Context } from "effect";

import { BetterAuthConfig } from "./better-auth-config";

export class BetterAuthError extends Schema.TaggedErrorClass<BetterAuthError>()(
  "auth/BetterAuthError",
  {
    cause: Schema.Unknown,
  }
) {}

export class BetterAuth extends Context.Service<BetterAuth>()(
  "@recount/auth/BetterAuth",
  {
    make: Effect.gen(function* () {
      const betterAuthConfig = yield* BetterAuthConfig;

      const db = yield* Database;
      const mailer = yield* Mailer;
      const identityModule = yield* IdentityModule;

      const services = yield* Effect.context<
        Database | Mailer | IdentityModule
      >();
      const runPromise = Effect.runPromiseWith(services);

      const betterAuthClient = betterAuth({
        appName: "Recount",
        secret: betterAuthConfig.secret,
        database: drizzleAdapter(db.unsafeDrizzle, {
          provider: "pg",
          schema,
        }),
        trustedOrigins: betterAuthConfig.trustedOrigins,
        databaseHooks: {
          user: {
            create: {
              after: (user) =>
                runPromise(
                  Effect.gen(function* () {
                    const userId = yield* UserId.makeEffect(user.id);

                    yield* identityModule.afterCreateUser(userId);
                  })
                ),
            },
          },
        },
        advanced: {
          database: {
            generateId: false,
          },
          cookiePrefix: "recount",
        },
        emailAndPassword: {
          enabled: true,
        },
        socialProviders: {
          google: {
            clientId: betterAuthConfig.googleClientId,
            clientSecret: betterAuthConfig.googleClientSecret,
            accessType: "offline",
            prompt: "select_account consent",
          },
        },
        user: {
          modelName: "usersTable",
          fields: {
            image: "imageUrl",
            name: "fullName",
          },
        },
        session: {
          storeSessionInDatabase: false,
          modelName: "sessionsTable",
          fields: {
            token: "sessionToken",
          },
        },
        account: {
          modelName: "accountsTable",
        },
        verification: {
          modelName: "verificationsTable",
        },
        plugins: [
          bearer({
            requireSignature: true,
          }),
          emailOTP({
            sendVerificationOTP: ({ email: rawEmail, otp, type }) =>
              runPromise(
                Effect.gen(function* () {
                  const email = yield* Email.makeEffect(rawEmail);

                  switch (type) {
                    case "sign-in": {
                      return yield* mailer.sendSignInOtp({ email, otp });
                    }
                    case "email-verification": {
                      return yield* mailer.sendEmailVerificationOtp({
                        email,
                        otp,
                      });
                    }
                    case "forget-password": {
                      return yield* mailer.sendPasswordResetOtp({
                        email,
                        otp,
                      });
                    }
                    default: {
                      return yield* new BetterAuthError({
                        cause: new Error(
                          `Unsupported OTP type: ${String(type)}`
                        ),
                      });
                    }
                  }
                })
              ),
          }),
        ],
      });

      return {
        use: Effect.fn("AuthService.use")(
          <A>(
            fn: (client: typeof betterAuthClient) => Promise<A>
          ): Effect.Effect<A, BetterAuthError> =>
            Effect.tryPromise({
              try: () => fn(betterAuthClient),
              catch: (cause) => new BetterAuthError({ cause }),
            })
        ),
      };
    }),
  }
) {
  static readonly layer = Layer.effect(BetterAuth, BetterAuth.make);
}
