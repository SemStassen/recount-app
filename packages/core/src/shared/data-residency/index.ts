import { Schema } from "effect";

export type DataResidencyRegion = typeof DataResidencyRegion.Type;
/* ⚠️ Changing will require a DB migration  */
export const DataResidencyRegion = Schema.Literals(["global", "eu"]).pipe(
  Schema.brand("DataResidencyRegion")
);
