import { Schema } from "effect";

import { Model } from "#internal/effect/index";
import {
  HexColor,
  NonEmptyTrimmedString,
  ProjectId,
  WorkspaceId,
} from "#shared/schemas/index";

export class Project extends Model.Class<Project>("Project")(
  {
    id: Model.ServerImmutableClientImmutableCreateOptional(ProjectId),
    workspaceId: Model.ServerImmutable(WorkspaceId),
    name: Model.ServerMutableClientMutable(
      NonEmptyTrimmedString.check(Schema.isMaxLength(255))
    ),
    color: Model.ServerMutableClientMutableCreateOptional(HexColor),
    isBillable: Model.ServerMutableClientMutableCreateOptional(Schema.Boolean),
    notes: Model.ServerMutableClientMutableOptional(
      Schema.Json.pipe(Schema.fromJsonString)
    ),
    archivedAt: Model.ServerMutableOptional(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "Project",
    title: "Project",
    description: "A project within a workspace",
  }
) {}
