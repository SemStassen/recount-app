import { WorkspaceIntegrationConnection } from "@recount/core/modules/integration";
import { Project, Task } from "@recount/core/modules/project";
import type { Timer, TimeEntry } from "@recount/core/modules/time";
import { TrackedTimeRow } from "@recount/core/modules/time/persistence";
import { WorkspaceMember } from "@recount/core/modules/workspace-member";
import { DateTime, Option, Schema, Struct } from "effect";

import type { StandardSchemaOutput } from "~/lib/standard-schema";

import { defineSyncedCollection } from "./define-synced-collection";

const optionalFields = Struct.map(Schema.optionalKey);

const nullableDateTimeSource = <S extends Schema.Top>(
  schema: Schema.OptionFromNullOr<Schema.decodeTo<S, Schema.Date>>
) => Schema.NullOr(schema.from.members[0].from);

const projectCollectionRowSchema = Project.json.mapFields(
  Struct.evolve({
    archivedAt: nullableDateTimeSource,
    notes: () => Schema.NullOr(Schema.Json),
  })
);

const taskCollectionRowSchema = Task.json.mapFields(
  Struct.evolve({
    archivedAt: nullableDateTimeSource,
  })
);

const trackedTimeCollectionRowSchema = TrackedTimeRow.select.mapFields(
  Struct.evolve({
    notes: (s) => s.from,
    startedAt: (s) => s.from,
    stoppedAt: nullableDateTimeSource,
    taskId: (s) => s.from,
  })
);

const projectElectricRowSchema = Project.json.mapFields(
  Struct.evolve({
    archivedAt: () => Schema.NullOr(Schema.DateFromString),
    notes: () => Schema.NullOr(Schema.Json),
  })
);

const taskElectricRowSchema = Task.json.mapFields(
  Struct.evolve({
    archivedAt: () => Schema.NullOr(Schema.DateFromString),
  })
);

const trackedTimeElectricRowSchema = TrackedTimeRow.select.mapFields(
  Struct.evolve({
    notes: (s) => s.from,
    startedAt: () => Schema.DateFromString,
    stoppedAt: () => Schema.NullOr(Schema.DateFromString),
    taskId: (s) => s.from,
  })
);

const projectCollectionSchema = Schema.toStandardSchemaV1(
  projectCollectionRowSchema
);

const taskCollectionSchema = Schema.toStandardSchemaV1(taskCollectionRowSchema);

const trackedTimeCollectionSchema = Schema.toStandardSchemaV1(
  trackedTimeCollectionRowSchema
);

export type ProjectCollectionRow = StandardSchemaOutput<
  typeof projectCollectionSchema
>;
export type TaskCollectionRow = StandardSchemaOutput<
  typeof taskCollectionSchema
>;
export type TrackedTimeCollectionRow = StandardSchemaOutput<
  typeof trackedTimeCollectionSchema
>;
export type TimerViewRow = Omit<
  TrackedTimeCollectionRow,
  "id" | "stoppedAt"
> & {
  readonly id: typeof Timer.fields.id.Type;
  readonly stoppedAt: null;
};
export type TimeEntryViewRow = Omit<
  TrackedTimeCollectionRow,
  "id" | "stoppedAt"
> & {
  readonly id: typeof TimeEntry.fields.id.Type;
  readonly stoppedAt: Date;
};
export type ProjectCollectionInsert = ProjectCollectionRow;
export type TaskCollectionInsert = TaskCollectionRow;
export type TrackedTimeCollectionInsert = TrackedTimeCollectionRow;

const nullableDateToDateTime = (value: Date | null | undefined) =>
  Option.map(Option.fromNullishOr(value), DateTime.makeUnsafe);

const optionDateTimeToDate = (value: Option.Option<DateTime.Utc>) =>
  Option.map(value, DateTime.toDateUtc).pipe(Option.getOrNull);

const mapPatchField = <TInput, TOutput>(
  value: TInput | undefined,
  map: (value: TInput) => TOutput
) => (value === undefined ? undefined : map(value));

export function toProjectEntity(project: ProjectCollectionRow): Project {
  return Project.make({
    archivedAt: nullableDateToDateTime(project.archivedAt),
    color: project.color,
    id: project.id,
    isBillable: project.isBillable,
    name: project.name,
    notes: Option.fromNullishOr(project.notes),
    workspaceId: project.workspaceId,
  });
}

export function toTaskEntity(task: TaskCollectionRow): Task {
  return Task.make({
    archivedAt: nullableDateToDateTime(task.archivedAt),
    id: task.id,
    name: task.name,
    projectId: task.projectId,
    workspaceId: task.workspaceId,
  });
}

export function toTrackedTimeRow(
  timeEntry: TrackedTimeCollectionRow
): TrackedTimeRow {
  return TrackedTimeRow.make({
    id: timeEntry.id,
    notes: Option.fromNullishOr(timeEntry.notes),
    projectId: timeEntry.projectId,
    startedAt: DateTime.makeUnsafe(timeEntry.startedAt),
    stoppedAt: nullableDateToDateTime(timeEntry.stoppedAt),
    taskId: Option.fromNullishOr(timeEntry.taskId),
    workspaceId: timeEntry.workspaceId,
    workspaceMemberId: timeEntry.workspaceMemberId,
  });
}

export function toTaskCollectionInsert(task: Task): TaskCollectionInsert {
  return {
    archivedAt: optionDateTimeToDate(task.archivedAt),
    id: task.id,
    name: task.name,
    projectId: task.projectId,
    workspaceId: task.workspaceId,
  };
}

export function toTaskCollectionPatch(
  update: typeof Task.update.Type
): Partial<TaskCollectionInsert> {
  return {
    ...update,
    archivedAt: mapPatchField(update.archivedAt, optionDateTimeToDate),
  };
}

export function toProjectCollectionInsert(
  project: Project
): ProjectCollectionInsert {
  return {
    archivedAt: optionDateTimeToDate(project.archivedAt),
    color: project.color,
    id: project.id,
    isBillable: project.isBillable,
    name: project.name,
    notes: Option.getOrNull(project.notes),
    workspaceId: project.workspaceId,
  };
}

export function toProjectCollectionPatch(
  update: typeof Project.update.Type
): Partial<ProjectCollectionInsert> {
  return {
    ...update,
    archivedAt: mapPatchField(update.archivedAt, optionDateTimeToDate),
    notes: mapPatchField(update.notes, Option.getOrNull),
  };
}

export function toTrackedTimeCollectionPatch(
  update: typeof TrackedTimeRow.update.Type
): Partial<TrackedTimeCollectionInsert> {
  return {
    ...update,
    notes: mapPatchField(update.notes, Option.getOrNull),
    startedAt: mapPatchField(update.startedAt, DateTime.toDateUtc),
    stoppedAt: mapPatchField(update.stoppedAt, optionDateTimeToDate),
    taskId: mapPatchField(update.taskId, Option.getOrNull),
  };
}

export function toTrackedTimeCollectionInsert(
  timeEntry: TrackedTimeRow
): TrackedTimeCollectionInsert {
  return {
    id: timeEntry.id,
    notes: Option.getOrNull(timeEntry.notes),
    projectId: timeEntry.projectId,
    startedAt: DateTime.toDateUtc(timeEntry.startedAt),
    stoppedAt: optionDateTimeToDate(timeEntry.stoppedAt),
    taskId: Option.getOrNull(timeEntry.taskId),
    workspaceId: timeEntry.workspaceId,
    workspaceMemberId: timeEntry.workspaceMemberId,
  };
}

export const workspaceSyncedCollections = {
  projects: defineSyncedCollection({
    decodeElectricRow: Schema.decodeUnknownSync(
      projectElectricRowSchema.mapFields(optionalFields)
    ),
    getKey: (project) => project.id,
    name: "projects",
    routePath: "/projects",
    schema: projectCollectionSchema,
  }),
  tasks: defineSyncedCollection({
    decodeElectricRow: Schema.decodeUnknownSync(
      taskElectricRowSchema.mapFields(optionalFields)
    ),
    getKey: (task) => task.id,
    name: "tasks",
    routePath: "/tasks",
    schema: taskCollectionSchema,
  }),
  timeEntries: defineSyncedCollection({
    decodeElectricRow: Schema.decodeUnknownSync(
      trackedTimeElectricRowSchema.mapFields(optionalFields)
    ),
    getKey: (timeEntry) => timeEntry.id,
    name: "time-entries",
    routePath: "/time-entries",
    schema: trackedTimeCollectionSchema,
  }),
  workspaceIntegrationConnections: defineSyncedCollection({
    decodeElectricRow: Schema.decodeUnknownSync(
      WorkspaceIntegrationConnection.json
        .mapFields(
          Struct.evolve({
            createdAt: () => Schema.DateTimeUtcFromString,
          })
        )
        .mapFields(optionalFields)
    ),
    getKey: (workspaceIntegrationConnection) =>
      workspaceIntegrationConnection.id,
    name: "workspace-integration-connections",
    routePath: "/workspace-integration-connections",
    schema: Schema.toStandardSchemaV1(WorkspaceIntegrationConnection.json),
  }),
  workspaceMembers: defineSyncedCollection({
    decodeElectricRow: Schema.decodeUnknownSync(
      WorkspaceMember.json.mapFields(optionalFields)
    ),
    getKey: (workspaceMember) => workspaceMember.id,
    name: "workspace-members",
    routePath: "/workspace-members",
    schema: Schema.toStandardSchemaV1(WorkspaceMember.json),
  }),
};
