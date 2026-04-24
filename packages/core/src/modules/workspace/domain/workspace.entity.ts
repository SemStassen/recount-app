import { Schema } from "effect";

import { Model } from "#internal/effect/index";
import { DataResidencyRegion } from "#shared/data-residency/index";
import { NonEmptyTrimmedString, WorkspaceId } from "#shared/schemas/index";

export class Workspace extends Model.Class<Workspace>("Workspace")(
  {
    id: Model.ServerImmutable(WorkspaceId),
    name: Model.ServerMutableClientMutable(
      NonEmptyTrimmedString.check(Schema.isMaxLength(100))
    ),
    slug: Model.ServerMutableClientMutable(
      NonEmptyTrimmedString.check(Schema.isMaxLength(100))
    ),
    logoUrl: Model.ServerMutableClientMutableOptional(NonEmptyTrimmedString),
    dataResidencyRegion: Model.Field({
      select: DataResidencyRegion,
      insert: DataResidencyRegion,
      jsonCreate: DataResidencyRegion,
    }),
  },
  {
    identifier: "Workspace",
    title: "Workspace",
    description: "A workspace",
  }
) {}
