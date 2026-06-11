import { env } from "~/lib/env";
import type {
  StandardSchemaLike,
  StandardSchemaOutput,
} from "~/lib/standard-schema";

export interface SyncedCollectionDefinition<
  TSchema extends StandardSchemaLike,
  TDecodedRow = unknown,
> {
  readonly decodeElectricRow: (row: unknown) => TDecodedRow;
  readonly getKey: (record: StandardSchemaOutput<TSchema>) => string;
  readonly name: string;
  readonly routePath: string;
  readonly schema: TSchema;
}

export function defineSyncedCollection<
  TSchema extends StandardSchemaLike,
  TDecodedRow,
>(definition: SyncedCollectionDefinition<TSchema, TDecodedRow>) {
  const { routePath, ...collection } = definition;

  return {
    ...collection,
    url: `${env.VITE_ELECTRIC_PROXY_URL}${routePath}`,
  };
}
