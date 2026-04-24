import { prepareFileUploadFlow } from "@recount/application/modules/file-upload";
import { FileUploadRpcGroup } from "@recount/core/rpc";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const FileUploadRpcGroupLayer = FileUploadRpcGroup.toLayer(
  Effect.succeed({
    "FileUpload.Prepare": Effect.fn("rpc.fileUpload.prepare")(
      function* (payload) {
        const preparedFileUpload = yield* prepareFileUploadFlow(payload);

        return preparedFileUpload;
      },
      Effect.catchTags({
        "infra/storage/ObjectStorageError": () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  })
);
