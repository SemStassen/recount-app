import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import {
  PrepareFileUploadCommand,
  PrepareFileUploadResult,
} from "#api/contracts/index";
import {
  FileUploadTooLargeError,
  UnsupportedFileUploadContentTypeError,
} from "#modules/file-upload/index";
import { AuthorizationError } from "#shared/authorization/index";

import { RpcSessionMiddleware, RpcWorkspaceMiddleware } from "./middleware";

export const FileUploadRpcGroup = RpcGroup.make(
  Rpc.make("FileUpload.Prepare", {
    payload: PrepareFileUploadCommand,
    success: PrepareFileUploadResult,
    error: Schema.Union([
      AuthorizationError,
      UnsupportedFileUploadContentTypeError,
      FileUploadTooLargeError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware)
);
