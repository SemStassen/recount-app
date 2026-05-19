import { Schema } from "effect";

export type WorkspaceRole = typeof WorkspaceRole.Type;
export const WorkspaceRole = Schema.Literals(["owner", "member"]);

const WorkspaceAction = Schema.Literals([
  "workspace:invite_user",
  "workspace:cancel_invite",
  "workspace:patch",
  "workspace:delete",
  "workspace:create_integration_connection",
  "workspace:delete_integration_connection",
]);

const WorkspaceMemberAction = Schema.Literals([
  "workspace-member:update_avatar_self",
]);

const ProjectAction = Schema.Literals([
  "project:create",
  "project:patch",
  "project:archive",
  "project:unarchive",
  "project:create_task",
  "project:patch_task",
  "project:archive_task",
  "project:unarchive_task",
]);

const TimeAction = Schema.Literals([
  "time:create_time_entry",
  "time:update_time_entry",
  "time:delete_time_entry",
]);

export type Action = typeof Action.Type;
export const Action = Schema.Union([
  WorkspaceAction,
  WorkspaceMemberAction,
  ProjectAction,
  TimeAction,
]);
