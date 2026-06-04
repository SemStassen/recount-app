import {
  createTimeEntryFlow,
  deleteTimeEntryFlow,
  startTimerFlow,
  stopTimerFlow,
  updateTimerFlow,
  updateTimeEntryFlow,
} from "@recount/application/modules/time";
import { TimeEntryRpcGroup } from "@recount/core/rpc";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const TimeEntryRpcGroupLayer = TimeEntryRpcGroup.toLayer(
  Effect.succeed({
    "TimeEntry.Create": Effect.fn("rpc.timeEntry.create")(
      function* (payload) {
        const timeEntry = yield* createTimeEntryFlow(payload);

        return timeEntry;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
    "TimeEntry.Update": Effect.fn("rpc.timeEntry.update")(
      function* (payload) {
        const timeEntry = yield* updateTimeEntryFlow(payload);

        return timeEntry;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
    "TimeEntry.Delete": Effect.fn("rpc.timeEntry.delete")(
      function* (payload) {
        yield* deleteTimeEntryFlow(payload);
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
    "Timer.Start": Effect.fn("rpc.timer.start")(
      function* (payload) {
        const timer = yield* startTimerFlow(payload);

        return timer;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
    "Timer.Update": Effect.fn("rpc.timer.update")(
      function* (payload) {
        const timer = yield* updateTimerFlow(payload);

        return timer;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
    "Timer.Stop": Effect.fn("rpc.timer.stop")(
      function* () {
        const timeEntry = yield* stopTimerFlow();

        return timeEntry;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  })
);
