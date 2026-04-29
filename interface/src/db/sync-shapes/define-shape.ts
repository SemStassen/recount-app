import { env } from "~/lib/env";

export type StandardShapeSchema<TOutput = unknown> = {
  readonly "~standard": {
    readonly types?: {
      readonly output: TOutput;
    };
  };
};

type ShapeSchemaOutput<TSchema extends StandardShapeSchema> = NonNullable<
  TSchema["~standard"]["types"]
>["output"];

export type SyncedShapeDefinition<
  TSchema extends StandardShapeSchema,
  TDecodedRow = unknown,
> = {
  readonly name: string;
  readonly routePath: string;
  readonly schema: TSchema;
  readonly getKey: (record: ShapeSchemaOutput<TSchema>) => string;
  readonly decodeRow: (row: unknown) => TDecodedRow;
};

export function defineShape<TSchema extends StandardShapeSchema, TDecodedRow>(
  definition: SyncedShapeDefinition<TSchema, TDecodedRow>
) {
  const { routePath, ...shape } = definition;

  return {
    ...shape,
    url: `${env.VITE_ELECTRIC_PROXY_URL}${routePath}`,
  };
}
