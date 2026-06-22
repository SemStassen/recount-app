import { Schema } from "effect";

import { SharedModel } from "#internal/effect/index";
import {
  NonEmptyTrimmedString,
  ProjectId,
  TaskId,
  WorkspaceId,
} from "#shared/schemas/index";

export class Task extends SharedModel.Class<Task>("Task")(
  {
    id: SharedModel.ImmutableCreateOptional(TaskId),
    workspaceId: SharedModel.ImmutableReadOnly(WorkspaceId),
    projectId: SharedModel.MutableCreate(ProjectId),
    name: SharedModel.MutableCreateUpdate(
      NonEmptyTrimmedString.check(Schema.isMaxLength(255))
    ),
    archivedAt: SharedModel.MutableNullableReadOnly(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "Task",
    title: "Task",
    description: "A task within a project",
  }
) {}
