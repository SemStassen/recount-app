import { Schema } from "effect";

import { SharedModel } from "#internal/effect/index";
import {
  HexColor,
  NonEmptyTrimmedString,
  ProjectId,
  WorkspaceId,
} from "#shared/schemas/index";

export class Project extends SharedModel.Class<Project>("Project")(
  {
    id: SharedModel.ImmutableCreateOptional(ProjectId),
    workspaceId: SharedModel.ImmutableReadOnly(WorkspaceId),
    name: SharedModel.MutableCreateUpdate(
      NonEmptyTrimmedString.check(Schema.isMaxLength(255))
    ),
    color: SharedModel.MutableCreateOptionalUpdate(HexColor),
    isBillable: SharedModel.MutableCreateOptionalUpdate(Schema.Boolean),
    notes: SharedModel.MutableCreateUpdateNullable(
      Schema.Json.pipe(Schema.fromJsonString)
    ),
    archivedAt: SharedModel.MutableNullableReadOnly(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "Project",
    title: "Project",
    description: "A project within a workspace",
  }
) {}
