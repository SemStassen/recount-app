import { ServiceMap } from "effect";
import type { Effect, Option } from "effect";

import type { RepositoryError } from "#shared/repository/index";

import type { UserSettings } from "./domain/user-settings.entity";

export interface UserSettingsRepositoryShape {
  readonly insert: (
    data: typeof UserSettings.insert.Type
  ) => Effect.Effect<UserSettings, RepositoryError>;
  readonly update: (params: {
    id: UserSettings["id"];
    update: typeof UserSettings.update.Type;
  }) => Effect.Effect<UserSettings, RepositoryError>;
  readonly findByUserId: (
    userId: UserSettings["userId"]
  ) => Effect.Effect<Option.Option<UserSettings>, RepositoryError>;
}

export class UserSettingsRepository extends ServiceMap.Service<
  UserSettingsRepository,
  UserSettingsRepositoryShape
>()("@recount/identity/UserSettingsRepository") {}
