import { Schema } from "effect";

import { SharedModel } from "#internal/effect/index";
import { DataResidencyRegion } from "#shared/data-residency/index";
import { NonEmptyTrimmedString, WorkspaceId } from "#shared/schemas/index";

export class Workspace extends SharedModel.Class<Workspace>("Workspace")(
  {
    id: SharedModel.ImmutableReadOnly(WorkspaceId),
    name: SharedModel.MutableCreateUpdate(
      NonEmptyTrimmedString.check(Schema.isMaxLength(100))
    ),
    slug: SharedModel.MutableCreateUpdate(
      NonEmptyTrimmedString.check(Schema.isMaxLength(100))
    ),
    logoUrl: SharedModel.MutableCreateUpdateNullable(NonEmptyTrimmedString),
    dataResidencyRegion: SharedModel.Field({
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
