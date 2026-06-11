export interface StandardSchemaLike<TOutput = unknown> {
  readonly "~standard": {
    readonly types?: {
      readonly output: TOutput;
    };
  };
}

export type StandardSchemaOutput<TSchema extends StandardSchemaLike> =
  NonNullable<TSchema["~standard"]["types"]>["output"];
