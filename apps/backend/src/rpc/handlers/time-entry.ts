import {
  createTimeEntryFlow,
  deleteTimeEntryFlow,
  startRunningTimeEntryFlow,
  stopRunningTimeEntryFlow,
  updateRunningTimeEntryFlow,
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
    "RunningTimeEntry.Start": Effect.fn("rpc.runningTimeEntry.start")(
      function* (payload) {
        const runningTimeEntry = yield* startRunningTimeEntryFlow(payload);

        return runningTimeEntry;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
    "RunningTimeEntry.Update": Effect.fn("rpc.runningTimeEntry.update")(
      function* (payload) {
        const runningTimeEntry = yield* updateRunningTimeEntryFlow(payload);

        return runningTimeEntry;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
    "RunningTimeEntry.Stop": Effect.fn("rpc.runningTimeEntry.stop")(
      function* () {
        const runningTimeEntry = yield* stopRunningTimeEntryFlow();

        return runningTimeEntry;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  })
);
