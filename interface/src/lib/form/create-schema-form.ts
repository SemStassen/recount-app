import type { AnyFormOptions } from "@tanstack/react-form";
import { Effect, Result, Schema } from "effect";

type SubmitProps = Parameters<NonNullable<AnyFormOptions["onSubmit"]>>[0];

export type SchemaFormSubmitProps<T> = Omit<SubmitProps, "value"> & {
  value: T;
};

export function createSchemaForm<T, E>(schema: Schema.Codec<T, E>) {
  const validator = Schema.toStandardSchemaV1(schema);

  const decode = (value: unknown) =>
    Schema.decodeUnknownEffect(schema)(value).pipe(Effect.runPromise);

  const decodeToResult = (value: unknown) =>
    Schema.decodeUnknownEffect(schema)(value).pipe(
      Effect.mapError(({ message }) => message),
      Effect.result,
      Effect.runPromise
    );

  const submitValidator = async ({ value }: { value: unknown }) => {
    const result = await decodeToResult(value);

    if (Result.isFailure(result)) {
      return result.failure;
    }

    return undefined;
  };

  const handleSubmit =
    (handler: (props: SchemaFormSubmitProps<T>) => Promise<void> | void) =>
    async (props: SubmitProps) => {
      const value = await decode(props.value);

      await handler({
        ...props,
        value,
      });
    };

  return {
    validator,
    decode,
    submitValidator,
    handleSubmit,
  };
}
