import { Project, Task } from "@recount/core/modules/project";
import { TrackedTimeRow } from "@recount/core/modules/time/persistence";
import { DateTime, Option, Schema, Struct } from "effect";

type StandardSchemaOutput<TSchema extends { readonly "~standard": object }> =
  TSchema extends {
    readonly "~standard": {
      readonly types?: { readonly output: infer Output };
    };
  }
    ? Output
    : never;

export interface TaskCollectionInsert {
  readonly id: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly name: string;
  readonly archivedAt: Date | null;
}

export interface TrackedTimeCollectionInsert {
  readonly id: string;
  readonly workspaceId: string;
  readonly workspaceMemberId: string;
  readonly projectId: string;
  readonly taskId: string | null;
  readonly startedAt: Date;
  readonly stoppedAt: Date | null;
  readonly notes: Schema.Json;
}

const optionalFields = Struct.map(Schema.optionalKey);

export const projectCollectionSchema = Schema.toStandardSchemaV1(
  Project.json.mapFields(
    Struct.evolve({
      archivedAt: () => Schema.Option(Schema.DateTimeUtc),
      notes: () => Schema.Option(Schema.Json),
    })
  )
);

export const taskCollectionSchema = Schema.toStandardSchemaV1(Task.json);

export const trackedTimeCollectionSchema = Schema.toStandardSchemaV1(
  TrackedTimeRow.select
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

export interface ProjectCollectionInsert {
  readonly id: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly color: string;
  readonly isBillable: boolean;
  readonly notes: Option.Option<Schema.Json>;
  readonly archivedAt: Option.Option<DateTime.Utc>;
}

export const decodeWorkspaceProjectRow = Schema.decodeUnknownSync(
  Project.json
    .mapFields(
      Struct.evolve({
        archivedAt: () => Schema.OptionFromNullOr(Schema.DateTimeUtcFromString),
      })
    )
    .mapFields(optionalFields)
);

export const decodeWorkspaceTaskRow = Schema.decodeUnknownSync(
  Task.json.mapFields(optionalFields)
);

export const decodeWorkspaceTrackedTimeRow = Schema.decodeUnknownSync(
  TrackedTimeRow.select
    .mapFields(
      Struct.evolve({
        startedAt: () => Schema.DateTimeUtcFromString,
        stoppedAt: () => Schema.OptionFromNullOr(Schema.DateTimeUtcFromString),
      })
    )
    .mapFields(optionalFields)
);

export function toProjectEntity(project: ProjectCollectionRow): Project {
  return Project.make({
    id: project.id,
    workspaceId: project.workspaceId,
    name: project.name,
    color: project.color,
    isBillable: project.isBillable,
    notes: project.notes,
    archivedAt: project.archivedAt,
  });
}

export function toTaskEntity(task: TaskCollectionRow): Task {
  return Task.make({
    id: task.id,
    workspaceId: task.workspaceId,
    projectId: task.projectId,
    name: task.name,
    archivedAt: task.archivedAt,
  });
}

export function toTrackedTimeRow(
  timeEntry: TrackedTimeCollectionRow
): TrackedTimeRow {
  return TrackedTimeRow.make({
    id: timeEntry.id,
    workspaceId: timeEntry.workspaceId,
    workspaceMemberId: timeEntry.workspaceMemberId,
    projectId: timeEntry.projectId,
    taskId: timeEntry.taskId,
    startedAt: timeEntry.startedAt,
    stoppedAt: timeEntry.stoppedAt,
    notes: timeEntry.notes,
  });
}

export function toTaskCollectionInsert(task: Task): TaskCollectionInsert {
  return {
    id: task.id,
    workspaceId: task.workspaceId,
    projectId: task.projectId,
    name: task.name,
    archivedAt: Option.map(task.archivedAt, DateTime.toDateUtc).pipe(
      Option.getOrNull
    ),
  };
}

const optionDateTimeToDate = (value: Option.Option<DateTime.Utc>) =>
  Option.map(value, DateTime.toDateUtc).pipe(Option.getOrNull);

export function toTrackedTimeCollectionInsert(
  timeEntry: TrackedTimeRow
): TrackedTimeCollectionInsert {
  return {
    id: timeEntry.id,
    workspaceId: timeEntry.workspaceId,
    workspaceMemberId: timeEntry.workspaceMemberId,
    projectId: timeEntry.projectId,
    taskId: Option.getOrNull(timeEntry.taskId),
    startedAt: DateTime.toDateUtc(timeEntry.startedAt),
    stoppedAt: optionDateTimeToDate(timeEntry.stoppedAt),
    notes: Option.getOrNull(timeEntry.notes),
  };
}
