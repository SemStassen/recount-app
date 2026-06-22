import { Schema } from "effect";

import { NonEmptyTrimmedString } from "#shared/schemas/primitives";

export const PrepareFileUploadCommand = Schema.Struct({
  filename: NonEmptyTrimmedString,
  contentType: NonEmptyTrimmedString,
  size: Schema.Int.check(Schema.isGreaterThan(0)),
  target: Schema.TaggedUnion({
    workspaceMemberAvatar: {},
    workspaceLogo: {},
  }),
});

export const PrepareFileUploadResult = Schema.Struct({
  uploadUrl: NonEmptyTrimmedString,
  assetUrl: NonEmptyTrimmedString,
});
