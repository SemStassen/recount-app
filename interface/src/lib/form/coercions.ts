import { DateTime, Option, Schema, SchemaGetter } from "effect";

export const emptyStringAsUndefined = Schema.Undefined.pipe(
  Schema.encodeTo(Schema.Literal(""), {
    decode: SchemaGetter.transform(() => undefined),
    encode: SchemaGetter.transform(() => "" as const),
  })
);

export const optionalFromEmptyString = <S extends Schema.Top>(schema: S) =>
  Schema.Union([emptyStringAsUndefined, schema]);

export const optionDateTimeToDate = (
  value: Option.Option<DateTime.Utc> | undefined
): Date | null =>
  Option.match(value ?? Option.none(), {
    onNone: () => null,
    onSome: DateTime.toDateUtc,
  });

export const optionToNullable = <T>(
  value: Option.Option<T> | undefined
): T | null =>
  Option.match(value ?? Option.none<T>(), {
    onNone: () => null,
    onSome: (value) => value,
  });
