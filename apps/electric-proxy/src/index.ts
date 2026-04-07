import { BunHttpClient, BunHttpServer, BunRuntime } from "@effect/platform-bun";
import {
  BetterAuth,
  BetterAuthConfig,
  RequestContextResolver,
} from "@recount/auth";
import {
  SessionRepositoryLayer,
  UserRepositoryLayer,
  UserSettingsRepositoryLayer,
} from "@recount/core-server/modules/identity";
import { WorkspaceRepositoryLayer } from "@recount/core-server/modules/workspace";
import { WorkspaceMemberRepositoryLayer } from "@recount/core-server/modules/workspace-member";
import { IdentityModuleLayer } from "@recount/core/modules/identity";
import {
  matchesAllowedOrigin,
  parseOrigins,
} from "@recount/core/shared/config";
import { DatabaseLayer } from "@recount/db";
import { Mailer } from "@recount/notifications/mailer";
import { makeObservabilityLayer } from "@recount/observability";
import { Config, Effect, Layer } from "effect";
import {
  HttpMiddleware,
  HttpRouter,
  HttpServerResponse,
} from "effect/unstable/http";

import { UserSettingsMeRouteLayer } from "./routes/me/user-settings";
import { WorkspacesMeRouteLayer } from "./routes/me/workspaces";
import { ProjectsRouteLayer } from "./routes/projects";
import { WorkspaceIntegrationsRouteLayer } from "./routes/workspace-integrations";
import { WorkspaceMembersRouteLayer } from "./routes/workspace-members";

const PersistenceServicesLayer = Layer.mergeAll(
  SessionRepositoryLayer,
  UserRepositoryLayer,
  UserSettingsRepositoryLayer,
  WorkspaceMemberRepositoryLayer,
  WorkspaceRepositoryLayer
).pipe(Layer.provideMerge(DatabaseLayer));

const InfrastructureServicesLayer = Layer.mergeAll(
  PersistenceServicesLayer,
  Mailer.layerDev
);

const DomainServicesLayer = IdentityModuleLayer.pipe(
  Layer.provide(InfrastructureServicesLayer)
);

const BetterAuthLayer = BetterAuth.layer.pipe(
  Layer.provide(BetterAuthConfig.layer),
  Layer.provide(DomainServicesLayer),
  Layer.provide(InfrastructureServicesLayer)
);

const RequestContextLayer = RequestContextResolver.layer.pipe(
  Layer.provide(BetterAuthLayer),
  Layer.provideMerge(PersistenceServicesLayer)
);

const ApplicationServicesLayer = Layer.mergeAll(
  InfrastructureServicesLayer,
  DomainServicesLayer,
  BetterAuthLayer,
  RequestContextLayer
);

const HealthRouteLayer = HttpRouter.add("GET", "/health", () =>
  HttpServerResponse.json({ status: "ok" })
);

const allowedOrigins = Effect.runSync(
  Effect.gen(function* () {
    const frontendOrigins = yield* Config.string("FRONTEND_ORIGINS");

    return yield* parseOrigins(frontendOrigins);
  })
);

const CorsLayer = HttpRouter.middleware(
  HttpMiddleware.cors({
    allowedOrigins: (origin) => matchesAllowedOrigin(origin, allowedOrigins),
    allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
  {
    global: true,
  }
);

const HttpRoutesLayer = Layer.mergeAll(
  HealthRouteLayer,
  // Me
  UserSettingsMeRouteLayer,
  WorkspacesMeRouteLayer,
  // General
  ProjectsRouteLayer,
  WorkspaceIntegrationsRouteLayer,
  WorkspaceMembersRouteLayer
).pipe(Layer.provide(CorsLayer));

const ObservabilityLayer = makeObservabilityLayer({
  serviceName: "recount-electric-proxy",
});

const ServerLayer = HttpRouter.serve(HttpRoutesLayer).pipe(
  Layer.provide(ApplicationServicesLayer),
  Layer.provide(ObservabilityLayer),
  Layer.provide(BunHttpClient.layer),
  Layer.provide(
    BunHttpServer.layerConfig(
      Config.all({
        port: Config.number("PORT"),
        idleTimeout: Config.succeed(120),
      })
    )
  )
);

Layer.launch(ServerLayer).pipe(BunRuntime.runMain);
