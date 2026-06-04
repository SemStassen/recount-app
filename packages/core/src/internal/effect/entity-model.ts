import { Schema } from "effect";
import { VariantSchema } from "effect/unstable/schema";

const {
  Class,
  Field,
  FieldExcept,
  FieldOnly,
  Struct,
  Union,
  extract,
  fieldEvolve,
} = VariantSchema.make({
  variants: ["json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "json",
});

export {
  Class,
  Field,
  FieldExcept,
  FieldOnly,
  Struct,
  Union,
  extract,
  fieldEvolve,
};

const optionalNullableOptionKey = <S extends Schema.Top>(schema: S) =>
  Schema.optionalKey(Schema.OptionFromNullOr(schema));

/**
 * Helpers for API-shaped entities shared by server and client.
 *
 * Names describe which API operation variants include the field:
 * - `ReadOnly`: present in read output only
 * - `CreateOptional`: present in read output and optional on create
 * - `CreateUpdate`: present in read output, required on create, optional on update
 * - `CreateOptionalUpdate`: present in read output, optional on create/update
 * - `CreateUpdateNullable`: nullable field present in read output and optional on
 *   create/update, represented as Option in core
 */

export interface ReadOnly<S extends Schema.Top> extends VariantSchema.Field<{
  readonly json: S;
}> {}

export const ReadOnly = <S extends Schema.Top>(schema: S): ReadOnly<S> =>
  Field({
    json: schema,
  });

export interface CreateOptional<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly json: S;
  readonly jsonCreate: Schema.OptionFromOptionalKey<S>;
}> {}

export const CreateOptional = <S extends Schema.Top>(
  schema: S
): CreateOptional<S> =>
  Field({
    json: schema,
    jsonCreate: Schema.OptionFromOptionalKey(schema),
  });

export interface CreateUpdate<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly json: S;
  readonly jsonCreate: S;
  readonly jsonUpdate: Schema.optionalKey<S>;
}> {}

export const CreateUpdate = <S extends Schema.Top>(
  schema: S
): CreateUpdate<S> =>
  Field({
    json: schema,
    jsonCreate: schema,
    jsonUpdate: Schema.optionalKey(schema),
  });

export interface CreateOptionalUpdate<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly json: S;
  readonly jsonCreate: Schema.optionalKey<S>;
  readonly jsonUpdate: Schema.optionalKey<S>;
}> {}

export const CreateOptionalUpdate = <S extends Schema.Top>(
  schema: S
): CreateOptionalUpdate<S> =>
  Field({
    json: schema,
    jsonCreate: Schema.optionalKey(schema),
    jsonUpdate: Schema.optionalKey(schema),
  });

export interface CreateUpdateNullable<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly json: Schema.OptionFromNullOr<S>;
  readonly jsonCreate: Schema.optionalKey<Schema.OptionFromNullOr<S>>;
  readonly jsonUpdate: Schema.optionalKey<Schema.OptionFromNullOr<S>>;
}> {}

export const CreateUpdateNullable = <S extends Schema.Top>(
  schema: S
): CreateUpdateNullable<S> =>
  Field({
    json: Schema.OptionFromNullOr(schema),
    jsonCreate: optionalNullableOptionKey(schema),
    jsonUpdate: optionalNullableOptionKey(schema),
  });
