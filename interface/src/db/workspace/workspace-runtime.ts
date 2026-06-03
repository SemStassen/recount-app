import {
  ProjectModule,
  ProjectModuleLayer,
} from "@recount/core/modules/project";
import { TimeModule, TimeModuleLayer } from "@recount/core/modules/time";
import { Layer, ManagedRuntime } from "effect";

import { BackendAtomRpcClient } from "~/lib/rpc/atom-client";
import { appRuntimeLayer } from "~/lib/runtime";
import { createClientProjectRepositoryLayer } from "~/lib/services/client-project-repository.layer";
import type { ClientRepositoryCollection } from "~/lib/services/client-repository-collection";
import { createClientTaskRepositoryLayer } from "~/lib/services/client-task-repository.layer";
import { createClientTimeEntryRepositoryLayer } from "~/lib/services/client-time-entry-repository.layer";

import type {
  ProjectCollectionInsert,
  ProjectRow,
  TaskCollectionInsert,
  TaskRow,
  TimeEntryCollectionInsert,
  TimeEntryRow,
} from "./workspace-collection-codecs";

type WorkspaceProjectCollection = ClientRepositoryCollection<
  ProjectRow,
  ProjectCollectionInsert
>;

type WorkspaceTaskCollection = ClientRepositoryCollection<
  TaskRow,
  TaskCollectionInsert
>;

type WorkspaceTimeEntryCollection = ClientRepositoryCollection<
  TimeEntryRow,
  TimeEntryCollectionInsert
>;

export type WorkspaceRuntime = ManagedRuntime.ManagedRuntime<
  ProjectModule | TimeModule | BackendAtomRpcClient,
  never
>;

export function createWorkspaceRuntime(params: {
  readonly allProjectsCollection: WorkspaceProjectCollection;
  readonly allTasksCollection: WorkspaceTaskCollection;
  readonly timeEntriesCollection: WorkspaceTimeEntryCollection;
}): WorkspaceRuntime {
  const projectRepositoryLayer = createClientProjectRepositoryLayer(
    params.allProjectsCollection
  );
  const taskRepositoryLayer = createClientTaskRepositoryLayer(
    params.allTasksCollection
  );
  const timeEntryRepositoryLayer = createClientTimeEntryRepositoryLayer(
    params.timeEntriesCollection
  );

  return ManagedRuntime.make(
    Layer.mergeAll(
      appRuntimeLayer,
      ProjectModuleLayer.pipe(
        Layer.provide(projectRepositoryLayer),
        Layer.provide(taskRepositoryLayer)
      ),
      TimeModuleLayer.pipe(Layer.provide(timeEntryRepositoryLayer))
    )
  );
}
