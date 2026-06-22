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
  value: Option.Option<DateTime.Utc>
): Date | null =>
  Option.match(value, {
    onNone: () => null,
    onSome: DateTime.toDate,
  });

export const optionToNullable = <T>(value: Option.Option<T>): T | null =>
  Option.match(value, {
    onNone: () => null,
    onSome: (someValue) => someValue,
  });
