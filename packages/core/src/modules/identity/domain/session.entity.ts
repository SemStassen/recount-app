import { SharedModel } from "#internal/effect/index";
import { SessionId, UserId, WorkspaceId } from "#shared/schemas/index";

export class Session extends SharedModel.Class<Session>("Session")(
  {
    id: SharedModel.ImmutableReadOnly(SessionId),
    userId: SharedModel.ImmutableReadOnly(UserId),
    lastActiveWorkspaceId: SharedModel.MutableNullableReadOnly(WorkspaceId),
  },
  {
    identifier: "Session",
    title: "Session",
    description: "A session",
  }
) {}
