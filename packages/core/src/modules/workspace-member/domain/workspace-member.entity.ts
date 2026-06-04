import { Schema } from "effect";

import { SharedModel } from "#internal/effect/index";
import { WorkspaceRole } from "#shared/authorization/index";
import {
  NonEmptyTrimmedString,
  UserId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";

export class WorkspaceMember extends SharedModel.Class<WorkspaceMember>(
  "WorkspaceMember"
)(
  {
    id: SharedModel.ImmutableReadOnly(WorkspaceMemberId),
    workspaceId: SharedModel.ImmutableReadOnly(WorkspaceId),
    userId: SharedModel.ImmutableReadOnly(UserId),
    displayName: SharedModel.MutableCreateUpdate(NonEmptyTrimmedString),
    avatarUrl: SharedModel.MutableCreateUpdateNullable(NonEmptyTrimmedString),
    role: SharedModel.MutableReadOnly(WorkspaceRole),
    removedAt: SharedModel.MutableNullableReadOnly(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "WorkspaceMember",
    title: "Workspace Member",
    description: "A member of a workspace",
  }
) {}
