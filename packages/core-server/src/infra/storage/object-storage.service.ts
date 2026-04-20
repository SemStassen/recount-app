import type { DataResidencyRegion } from "@recount/core/shared/residency";
import { Context, Schema } from "effect";
import type { Effect } from "effect";

export class ObjectStorageError extends Schema.TaggedErrorClass<ObjectStorageError>()(
  "infra/storage/ObjectStorageError",
  {
    cause: Schema.Unknown,
  }
) {}

export interface ObjectStorageShape {
  readonly createPresignedUpload: (params: {
    region: DataResidencyRegion;
    key: string;
    contentType: string;
  }) => Effect.Effect<string, ObjectStorageError>;
  readonly deleteObject: (params: {
    region: DataResidencyRegion;
    key: string;
  }) => Effect.Effect<void, ObjectStorageError>;
}

export class ObjectStorage extends Context.Service<
  ObjectStorage,
  ObjectStorageShape
>()("@recount/infra/storage/ObjectStorage") {}
