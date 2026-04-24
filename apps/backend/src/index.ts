import { BunHttpClient, BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { CryptoLayer } from "@recount/application/infra/crypto";
import {
  FileUploadKeyPolicy,
  ObjectStorageR2Layer,
} from "@recount/application/infra/storage";
import {
  SessionRepositoryLayer,
  UserRepositoryLayer,
  UserSettingsRepositoryLayer,
} from "@recount/application/modules/identity";
import {
  IntegrationModuleLayer,
  WorkspaceIntegrationRepositoryLayer,
} from "@recount/application/modules/integration";
import {
  ProjectRepositoryLayer,
  TaskRepositoryLayer,
} from "@recount/application/modules/project";
import { TimeEntryRepositoryLayer } from "@recount/application/modules/time";
import { WorkspaceRepositoryLayer } from "@recount/application/modules/workspace";
import { WorkspaceInvitationRepositoryLayer } from "@recount/application/modules/workspace-invitation";
import { WorkspaceMemberRepositoryLayer } from "@recount/application/modules/workspace-member";
import { Authorization } from "@recount/application/shared/authorization";
import {
  RpcSessionMiddlewareLayer,
  RpcWorkspaceMiddlewareLayer,
} from "@recount/application/shared/middleware";
import {
  BetterAuth,
  BetterAuthConfig,
  RequestContextResolver,
} from "@recount/auth";
import { IdentityModuleLayer } from "@recount/core/modules/identity";
import { ProjectModuleLayer } from "@recount/core/modules/project";
import { TimeModuleLayer } from "@recount/core/modules/time";
import { WorkspaceModuleLayer } from "@recount/core/modules/workspace";
import { WorkspaceInvitationModuleLayer } from "@recount/core/modules/workspace-invitation";
import { WorkspaceMemberModuleLayer } from "@recount/core/modules/workspace-member";
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
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";

import { HttpApiRoutesLayer } from "./http";
import { BetterAuthRoutesLayer } from "./routes/better-auth";
import { AllRpcsGroup, AllRpcsGroupLayer } from "./rpc";

const PersistenceServicesLayer = Layer.mergeAll(
  ProjectRepositoryLayer,
  SessionRepositoryLayer,
  TaskRepositoryLayer,
  TimeEntryRepositoryLayer,
  UserSettingsRepositoryLayer,
  UserRepositoryLayer,
  WorkspaceIntegrationRepositoryLayer,
  WorkspaceInvitationRepositoryLayer,
  WorkspaceMemberRepositoryLayer,
  WorkspaceRepositoryLayer
).pipe(Layer.provideMerge(DatabaseLayer));

const InfrastructureServicesLayer = Layer.mergeAll(
  CryptoLayer,
  Authorization.layer,
  Mailer.layerDev,
  PersistenceServicesLayer,
  ObjectStorageR2Layer,
  FileUploadKeyPolicy.layer
);

const DomainServicesLayer = Layer.mergeAll(
  IdentityModuleLayer,
  IntegrationModuleLayer,
  ProjectModuleLayer,
  TimeModuleLayer,
  WorkspaceModuleLayer,
  WorkspaceInvitationModuleLayer,
  WorkspaceMemberModuleLayer
).pipe(Layer.provide(InfrastructureServicesLayer));

const BetterAuthLayer = BetterAuth.layer.pipe(
  Layer.provide(BetterAuthConfig.layer),
  Layer.provide(DomainServicesLayer),
  Layer.provide(InfrastructureServicesLayer)
);

const RequestContextLayer = RequestContextResolver.layer.pipe(
  Layer.provide(BetterAuthLayer),
  Layer.provide(PersistenceServicesLayer)
);

const MiddlewareServicesLayer = Layer.mergeAll(
  RpcSessionMiddlewareLayer,
  RpcWorkspaceMiddlewareLayer
).pipe(Layer.provide(RequestContextLayer));

const RpcRouteLayer = RpcServer.layerHttp({
  group: AllRpcsGroup,
  path: "/rpc",
  protocol: "http",
}).pipe(
  Layer.provide(RpcSerialization.layerNdjson),
  Layer.provide(AllRpcsGroupLayer)
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
  HttpApiRoutesLayer,
  RpcRouteLayer,
  BetterAuthRoutesLayer
).pipe(Layer.provide(CorsLayer));

const ApplicationServicesLayer = Layer.mergeAll(
  InfrastructureServicesLayer,
  DomainServicesLayer,
  BetterAuthLayer,
  RequestContextLayer,
  MiddlewareServicesLayer
);

const ObservabilityLayer = makeObservabilityLayer({
  serviceName: "recount-backend",
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
