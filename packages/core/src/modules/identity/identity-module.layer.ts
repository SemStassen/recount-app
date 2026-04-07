import { Effect, Layer, Option } from "effect";

import * as sessionTransitions from "./domain/session.transitions";
import * as userSettingsTransitions from "./domain/user-settings.transitions";
import * as userTransitions from "./domain/user.transitions";
import {
  IdentityModule,
  SessionNotFoundError,
  UserNotFoundError,
} from "./identity-module.service";
import { SessionRepository } from "./session-repository.service";
import { UserRepository } from "./user-repository.service";
import { UserSettingsRepository } from "./user-settings-repository.service";

export const IdentityModuleLayer = Layer.effect(
  IdentityModule,
  Effect.gen(function* () {
    const sessionRepo = yield* SessionRepository;
    const userRepo = yield* UserRepository;
    const userSettingsRepo = yield* UserSettingsRepository;

    return {
      setLastActiveWorkspace: Effect.fn("identity.setLastActiveWorkspace")(
        function* (params) {
          const session = yield* sessionRepo.findById(params.sessionId).pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new SessionNotFoundError({ sessionId: params.sessionId })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

          const { entity, changes } = yield* Effect.fromResult(
            sessionTransitions.updateSessionLastActiveWorkspace({
              session: session,
              lastActiveWorkspaceId: params.workspaceId,
            })
          );

          const persistedSession = yield* sessionRepo.update({
            id: entity.id,
            update: changes,
          });

          return persistedSession;
        }
      ),

      afterCreateUser: Effect.fn("identity.afterCreateUser")(
        function* (userId) {
          const userSettings =
            yield* userSettingsTransitions.createUserSettings(userId);

          yield* userSettingsRepo.insert(userSettings);

          return undefined;
        }
      ),

      updateUser: Effect.fn("identity.updateUser")(function* (params) {
        const user = yield* userRepo.findById(params.userId).pipe(
          Effect.flatMap(
            Option.match({
              onNone: () =>
                Effect.fail(new UserNotFoundError({ userId: params.userId })),
              onSome: Effect.succeed,
            })
          )
        );

        const { entity, changes } = yield* Effect.fromResult(
          userTransitions.updateUser({
            user: user,
            data: params.data,
          })
        );

        const persistedUser = yield* userRepo.update({
          id: entity.id,
          update: changes,
        });

        return persistedUser;
      }),

      updateUserSettings: Effect.fn("identity.updateUserSettings")(
        function* (params) {
          const userSettings = yield* userSettingsRepo
            .findByUserId(params.userId)
            .pipe(
              Effect.flatMap(
                Option.match({
                  onNone: () =>
                    Effect.die(
                      new Error(
                        `UserSettings missing for userId ${params.userId} — invariant violated`
                      )
                    ),
                  onSome: Effect.succeed,
                })
              )
            );

          const { entity, changes } = yield* Effect.fromResult(
            userSettingsTransitions.updateUserSettings({
              userSettings: userSettings,
              data: params.data,
            })
          );

          const persistedUserSettings = yield* userSettingsRepo.update({
            id: entity.id,
            update: changes,
          });

          return persistedUserSettings;
        }
      ),

      retrieveUserByEmail: Effect.fn("identity.retrieveUserByEmail")(
        function* (email) {
          return yield* userRepo.findByEmail(email);
        }
      ),
    };
  })
);
