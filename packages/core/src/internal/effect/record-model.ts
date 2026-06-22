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
  variants: ["select", "insert", "update"],
  defaultVariant: "select",
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

export interface Immutable<S extends Schema.Top> extends VariantSchema.Field<{
  readonly select: S;
  readonly insert: S;
}> {}

export const Immutable = <S extends Schema.Top>(schema: S): Immutable<S> =>
  Field({
    select: schema,
    insert: schema,
  });

export interface Mutable<S extends Schema.Top> extends VariantSchema.Field<{
  readonly select: S;
  readonly insert: S;
  readonly update: Schema.optionalKey<S>;
}> {}

export const Mutable = <S extends Schema.Top>(schema: S): Mutable<S> =>
  Field({
    select: schema,
    insert: schema,
    update: Schema.optionalKey(schema),
  });

export interface MutableNullable<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: Schema.OptionFromNullOr<S>;
  readonly insert: Schema.OptionFromNullOr<S>;
  readonly update: Schema.optionalKey<Schema.OptionFromNullOr<S>>;
}> {}

export const MutableNullable = <S extends Schema.Top>(
  schema: S
): MutableNullable<S> =>
  Field({
    select: Schema.OptionFromNullOr(schema),
    insert: Schema.OptionFromNullOr(schema),
    update: Schema.optionalKey(Schema.OptionFromNullOr(schema)),
  });
