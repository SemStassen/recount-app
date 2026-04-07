import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import {
  UpdateMeUserSettingsCommand,
  UpdateMeUserSettingsResult,
} from "#api/contracts/index";

import { RpcSessionMiddleware } from "./middleware";

export const UserSettingsRpcGroup = RpcGroup.make(
  Rpc.make("UserSettings.UpdateMe", {
    payload: UpdateMeUserSettingsCommand,
    success: UpdateMeUserSettingsResult,
    error: Schema.Union([HttpApiError.InternalServerError]),
  }).middleware(RpcSessionMiddleware)
);
