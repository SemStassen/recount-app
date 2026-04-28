import { Option, Result } from "effect";

import { WorkspaceMemberId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import { WorkspaceMember } from "./workspace-member.entity";

export const createWorkspaceMember = (params: {
  workspaceId: WorkspaceMember["workspaceId"];
  userId: WorkspaceMember["userId"];
  role: WorkspaceMember["role"];
  data: typeof WorkspaceMember.jsonCreate.Type;
}): Result.Result<WorkspaceMember, never> =>
  Result.succeed(
    WorkspaceMember.make({
      id: WorkspaceMemberId.make(generateUUID()),
      workspaceId: params.workspaceId,
      userId: params.userId,
      role: params.role,
      displayName: params.data.displayName,
      imageUrl: params.data.imageUrl ?? Option.none(),
      deletedAt: Option.none(),
    })
  );

export const updateWorkspaceMember = (params: {
  workspaceMember: WorkspaceMember;
  data: typeof WorkspaceMember.jsonUpdate.Type;
}): Result.Result<
  {
    entity: WorkspaceMember;
    changes: typeof WorkspaceMember.update.Type;
  },
  never
> => {
  const updatedWorkspaceMember = WorkspaceMember.make({
    ...params.workspaceMember,
    ...params.data,
  });

  return Result.succeed({
    entity: updatedWorkspaceMember,
    changes: params.data,
  });
};
