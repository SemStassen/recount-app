import { Schema, ServiceMap } from "effect";
import type { Effect, Option } from "effect";

import type { RepositoryError } from "#shared/repository/index";
import { SessionId, UserId, UserSettingsId } from "#shared/schemas/index";

import type { Session } from "./domain/session.entity";
import type { UserSettings } from "./domain/user-settings.entity";
import type { User } from "./domain/user.entity";

export class SessionNotFoundError extends Schema.TaggedErrorClass<SessionNotFoundError>()(
  "identity/SessionNotFoundError",
  {
    sessionId: SessionId,
  }
) {}

export class UserNotFoundError extends Schema.TaggedErrorClass<UserNotFoundError>()(
  "identity/UserNotFoundError",
  {
    userId: UserId,
  }
) {}

interface IdentityModuleShape {
  readonly setLastActiveWorkspace: (params: {
    sessionId: Session["id"];
    workspaceId: Session["lastActiveWorkspaceId"];
  }) => Effect.Effect<Session, SessionNotFoundError | RepositoryError>;

  readonly afterCreateUser: (
    userId: User["id"]
  ) => Effect.Effect<void, RepositoryError>;

  readonly updateUser: (params: {
    userId: User["id"];
    data: typeof User.jsonUpdate.Type;
  }) => Effect.Effect<User, UserNotFoundError | RepositoryError>;

  readonly updateUserSettings: (params: {
    userId: UserSettings["userId"];
    data: typeof UserSettings.jsonUpdate.Type;
  }) => Effect.Effect<UserSettings, RepositoryError>;

  readonly retrieveUserByEmail: (
    email: User["email"]
  ) => Effect.Effect<Option.Option<User>, RepositoryError>;
}

export class IdentityModule extends ServiceMap.Service<
  IdentityModule,
  IdentityModuleShape
>()("@recount/identity/IdentityModule") {}
