import { Schema } from "effect";

import { Model } from "#internal/effect/index";
import { WorkspaceRole } from "#shared/authorization/index";
import {
  NonEmptyTrimmedString,
  UserId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";

export class WorkspaceMember extends Model.Class<WorkspaceMember>(
  "WorkspaceMember"
)(
  {
    id: Model.ServerImmutable(WorkspaceMemberId),
    workspaceId: Model.ServerImmutable(WorkspaceId),
    userId: Model.ServerImmutable(UserId),
    displayName: Model.ServerMutableClientMutable(NonEmptyTrimmedString),
    imageUrl: Model.ServerMutableClientMutableOptional(NonEmptyTrimmedString),
    role: Model.ServerMutable(WorkspaceRole),
    deletedAt: Model.ServerMutableOptional(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "WorkspaceMember",
    title: "Workspace Member",
    description: "A member of a workspace",
  }
) {}
