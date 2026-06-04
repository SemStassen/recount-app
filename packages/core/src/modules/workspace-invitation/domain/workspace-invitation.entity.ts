import { Schema } from "effect";

import { SharedModel } from "#internal/effect/index";
import { WorkspaceRole } from "#shared/authorization/index";
import {
  Email,
  WorkspaceId,
  WorkspaceInvitationId,
  WorkspaceMemberId,
} from "#shared/schemas/index";

export class WorkspaceInvitation extends SharedModel.Class<WorkspaceInvitation>(
  "WorkspaceInvitation"
)(
  {
    id: SharedModel.ImmutableReadOnly(WorkspaceInvitationId),
    inviterId: SharedModel.ImmutableReadOnly(WorkspaceMemberId),
    workspaceId: SharedModel.ImmutableReadOnly(WorkspaceId),
    email: SharedModel.MutableCreate(Email),
    role: SharedModel.MutableCreate(WorkspaceRole),
    status: SharedModel.MutableReadOnly(
      Schema.Literals(["pending", "accepted", "rejected", "canceled"])
    ),
    expiresAt: SharedModel.MutableReadOnly(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "WorkspaceInvitation",
    title: "Workspace Invitation",
    description: "A workspace invitation",
  }
) {
  isPending(): boolean {
    return this.status === "pending";
  }
}
