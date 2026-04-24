import type { PrepareFileUploadCommand } from "@recount/core/contracts";
import {
  FileUploadTooLargeError,
  UnsupportedFileUploadContentTypeError,
} from "@recount/core/modules/file-upload";
import { Effect } from "effect";

const megabytes = (value: number) => value * 1024 * 1024;

const imageContentTypes = ["image/png", "image/jpeg", "image/webp"] as const;

const fileUploadPolicies = {
  workspaceMemberAvatar: {
    allowedContentTypes: imageContentTypes,
    maxSize: megabytes(2),
  },
  workspaceLogo: {
    allowedContentTypes: imageContentTypes,
    maxSize: megabytes(2),
  },
} as const satisfies Record<
  typeof PrepareFileUploadCommand.Type.target._tag,
  {
    readonly allowedContentTypes: ReadonlyArray<string>;
    readonly maxSize: number;
  }
>;

export const validateFileUploadPolicy = Effect.fn(
  "fileUploadPolicy.validateFileUploadPolicy"
)(function* (request: typeof PrepareFileUploadCommand.Type) {
  const policy = fileUploadPolicies[request.target._tag];

  if (
    !policy.allowedContentTypes.some(
      (contentType) => contentType === request.contentType
    )
  ) {
    return yield* new UnsupportedFileUploadContentTypeError({
      contentType: request.contentType,
      allowedContentTypes: [...policy.allowedContentTypes],
    });
  }

  if (request.size > policy.maxSize) {
    return yield* new FileUploadTooLargeError({
      size: request.size,
      maxSize: policy.maxSize,
    });
  }
});
