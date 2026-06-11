import type { ProjectModule } from "@recount/core/modules/project";
import { ProjectModuleLayer } from "@recount/core/modules/project";
import type { TimeModule } from "@recount/core/modules/time";
import { TimeModuleLayer } from "@recount/core/modules/time";
import { Layer, ManagedRuntime } from "effect";

import type { BackendAtomRpcClient } from "~/lib/rpc/atom-client";
import { appRuntimeLayer } from "~/lib/runtime";
import { createClientProjectRepositoryLayer } from "~/lib/services/client-project-repository.layer";
import type { ClientRepositoryCollection } from "~/lib/services/client-repository-collection";
import { createClientTaskRepositoryLayer } from "~/lib/services/client-task-repository.layer";
import { createClientTrackedTimeRepositoryLayer } from "~/lib/services/client-tracked-time-repository.layer";
import { createClientTrackedTimeTargetValidatorLayer } from "~/lib/services/client-tracked-time-target-validator.layer";

import type {
  ProjectCollectionInsert,
  ProjectCollectionRow,
  TaskCollectionInsert,
  TaskCollectionRow,
  TrackedTimeCollectionInsert,
  TrackedTimeCollectionRow,
} from "../synced-collections";

type WorkspaceProjectCollection = ClientRepositoryCollection<
  ProjectCollectionRow,
  ProjectCollectionInsert
>;

type WorkspaceTaskCollection = ClientRepositoryCollection<
  TaskCollectionRow,
  TaskCollectionInsert
>;

type WorkspaceTrackedTimeCollection = ClientRepositoryCollection<
  TrackedTimeCollectionRow,
  TrackedTimeCollectionInsert
>;

export type WorkspaceRuntime = ManagedRuntime.ManagedRuntime<
  ProjectModule | TimeModule | BackendAtomRpcClient,
  never
>;

export function createWorkspaceRuntime(params: {
  readonly allProjectsCollection: WorkspaceProjectCollection;
  readonly allTasksCollection: WorkspaceTaskCollection;
  readonly timeEntriesCollection: WorkspaceTrackedTimeCollection;
}): WorkspaceRuntime {
  const projectRepositoryLayer = createClientProjectRepositoryLayer(
    params.allProjectsCollection
  );
  const taskRepositoryLayer = createClientTaskRepositoryLayer(
    params.allTasksCollection
  );
  const trackedTimeRepositoryLayer = createClientTrackedTimeRepositoryLayer(
    params.timeEntriesCollection
  );
  const trackedTimeTargetValidatorLayer =
    createClientTrackedTimeTargetValidatorLayer({
      projectsCollection: params.allProjectsCollection,
      tasksCollection: params.allTasksCollection,
    });

  return ManagedRuntime.make(
    Layer.mergeAll(
      appRuntimeLayer,
      ProjectModuleLayer.pipe(
        Layer.provide(projectRepositoryLayer),
        Layer.provide(taskRepositoryLayer)
      ),
      TimeModuleLayer.pipe(
        Layer.provide(trackedTimeRepositoryLayer),
        Layer.provide(trackedTimeTargetValidatorLayer)
      )
    )
  );
}
