import { Schema } from "effect";

import { Workspace } from "#modules/workspace/index";

import { User, UserSettings } from "../index";

export const SetLastActiveWorkspaceCommand = Schema.Struct({
  id: Workspace.fields.id,
});
export const SetLastActiveWorkspaceResult = Schema.Void;

export const UpdateMeUserCommand = User.jsonUpdate;
export const UpdateMeUserResult = User.json;

export const UpdateMeUserSettingsCommand = UserSettings.jsonUpdate;
export const UpdateMeUserSettingsResult = UserSettings.json;
