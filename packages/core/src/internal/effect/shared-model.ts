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
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
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

const optionalNullableOptionKey = <S extends Schema.Top>(schema: S) =>
  Schema.optionalKey(Schema.OptionFromNullOr(schema));

/**
 * Named helpers compose RecordModel persistence variants with EntityModel JSON
 * variants. Keep the variant semantics aligned with those two leading models:
 * record variants mirror `record-model.ts`; JSON variants mirror
 * `entity-model.ts`.
 *
 * Reach for `Field(...)` directly when a field has asymmetric behavior across
 * variants, such as different DB/JSON schemas or omitted JSON read variants.
 *
 * Naming rules:
 * - Start with record persistence mutability: `Immutable` or `Mutable`.
 * - Add JSON operation inclusion: `ReadOnly`, `Create`, or
 *   `CreateUpdate`.
 * - Append modifiers last: `Nullable`, `CreateOptional`.
 * - `Nullable` means the field value can be absent/null and decodes to Option.
 * - `Optional` means the input key may be omitted, matching EntityModel's
 *   `Schema.optionalKey` behavior. Omitted keys stay omitted; they do not
 *   decode to Option.
 * - `Update` always means Partial Update semantics: omitted update keys are not
 *   updates; present nullable `Option.none` values clear the field.
 * - If the name starts to describe transport quirks instead of the core
 *   contract, prefer an explicit `Field(...)`.
 *
 * Grammar:
 * `<Record mutability><API inclusion><modifier>`
 *
 * Alignment examples:
 * - `ImmutableCreateOptional` = RecordModel.Immutable +
 *   EntityModel.CreateOptional
 * - `MutableCreateUpdateNullable` = RecordModel.MutableNullable +
 *   EntityModel.CreateUpdateNullable
 */

// ---------------------------------------------------------------------------
// ImmutableReadOnly
// ---------------------------------------------------------------------------

export interface ImmutableReadOnly<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: S;
  readonly insert: S;
  readonly json: S;
}> {}

/**
 * Immutable record field exposed in read output only.
 *
 * Absent from the update variant and all JSON input variants.
 *
 * @example
 * workspaceId: ImmutableReadOnly(WorkspaceId)
 * createdAt: ImmutableReadOnly(Timestamp)
 */
export const ImmutableReadOnly = <S extends Schema.Top>(
  schema: S
): ImmutableReadOnly<S> =>
  Field({
    select: schema,
    insert: schema,
    json: schema,
  });

// ---------------------------------------------------------------------------
// MutableReadOnly
// ---------------------------------------------------------------------------

export interface MutableReadOnly<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: S;
  readonly insert: S;
  readonly update: Schema.optionalKey<S>;
  readonly json: S;
}> {}

/**
 * Mutable record field exposed in read output only.
 *
 * Absent from all client-facing create and update payloads.
 *
 * @example
 * emailVerified: MutableReadOnly(Schema.Boolean)
 * status: MutableReadOnly(Schema.Literals(["pending", "accepted"]))
 */
export const MutableReadOnly = <S extends Schema.Top>(
  schema: S
): MutableReadOnly<S> =>
  Field({
    select: schema,
    insert: schema,
    update: Schema.optionalKey(schema),
    json: schema,
  });

// ---------------------------------------------------------------------------
// MutableNullableReadOnly
// ---------------------------------------------------------------------------

export interface MutableNullableReadOnly<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: Schema.OptionFromNullOr<S>;
  readonly insert: Schema.OptionFromNullOr<S>;
  readonly update: Schema.optionalKey<Schema.OptionFromNullOr<S>>;
  readonly json: Schema.OptionFromNullOr<S>;
}> {}

/**
 * Mutable nullable record field exposed in read output only.
 *
 * DB variants use OptionFromNullOr so SQL NULLs decode to None.
 *
 * @example
 * archivedAt: MutableNullableReadOnly(Schema.DateTimeUtcFromDate)
 * activeWorkspaceId: MutableNullableReadOnly(WorkspaceId)
 */
export const MutableNullableReadOnly = <S extends Schema.Top>(
  schema: S
): MutableNullableReadOnly<S> =>
  Field({
    select: Schema.OptionFromNullOr(schema),
    insert: Schema.OptionFromNullOr(schema),
    update: Schema.optionalKey(Schema.OptionFromNullOr(schema)),
    json: Schema.OptionFromNullOr(schema),
  });

// ---------------------------------------------------------------------------
// ImmutableCreateOptional
// ---------------------------------------------------------------------------

export interface ImmutableCreateOptional<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: S;
  readonly insert: S;
  readonly json: S;
  readonly jsonCreate: Schema.optionalKey<S>;
}> {}

/**
 * Immutable record field exposed in read output and optional in create input.
 *
 * Useful for IDs that can be client-supplied for optimistic writes and
 * server-generated when omitted.
 *
 * Omitted create keys stay omitted so the service layer can choose or generate
 * the inserted value without exposing Option at the create command interface.
 *
 * @example
 * id: ImmutableCreateOptional(ProjectId)
 */
export const ImmutableCreateOptional = <S extends Schema.Top>(
  schema: S
): ImmutableCreateOptional<S> =>
  Field({
    select: schema,
    insert: schema,
    json: schema,
    jsonCreate: Schema.optionalKey(schema),
  });

// ---------------------------------------------------------------------------
// ImmutableCreate
// ---------------------------------------------------------------------------

export interface ImmutableCreate<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: S;
  readonly insert: S;
  readonly json: S;
  readonly jsonCreate: S;
}> {}

/**
 * Immutable record field exposed in read output and required in create input.
 *
 * @example
 * provider: ImmutableCreate(WorkspaceIntegrationConnectionProvider)
 */
export const ImmutableCreate = <S extends Schema.Top>(
  schema: S
): ImmutableCreate<S> =>
  Field({
    select: schema,
    insert: schema,
    json: schema,
    jsonCreate: schema,
  });

// ---------------------------------------------------------------------------
// MutableCreate
// ---------------------------------------------------------------------------

export interface MutableCreate<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: S;
  readonly insert: S;
  readonly update: Schema.optionalKey<S>;
  readonly json: S;
  readonly jsonCreate: S;
}> {}

/**
 * Mutable record field exposed in read output and required in create input.
 *
 * The server retains an internal update escape hatch via the update variant.
 *
 * @example
 * email: MutableCreate(Email)
 */
export const MutableCreate = <S extends Schema.Top>(
  schema: S
): MutableCreate<S> =>
  Field({
    select: schema,
    insert: schema,
    update: Schema.optionalKey(schema),
    json: schema,
    jsonCreate: schema,
  });

// ---------------------------------------------------------------------------
// MutableCreateUpdate
// ---------------------------------------------------------------------------

export interface MutableCreateUpdate<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: S;
  readonly insert: S;
  readonly update: Schema.optionalKey<S>;
  readonly json: S;
  readonly jsonCreate: S;
  readonly jsonUpdate: Schema.optionalKey<S>;
}> {}

/**
 * Mutable record field exposed in read output, required in create input, and
 * optional in update input for Partial Update semantics.
 *
 * @example
 * name: MutableCreateUpdate(Schema.NonEmptyTrimmedString)
 */
export const MutableCreateUpdate = <S extends Schema.Top>(
  schema: S
): MutableCreateUpdate<S> =>
  Field({
    select: schema,
    insert: schema,
    update: Schema.optionalKey(schema),
    json: schema,
    jsonCreate: schema,
    jsonUpdate: Schema.optionalKey(schema),
  });

// ---------------------------------------------------------------------------
// MutableCreateOptionalUpdate
// ---------------------------------------------------------------------------

export interface MutableCreateOptionalUpdate<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: S;
  readonly insert: S;
  readonly update: Schema.optionalKey<S>;
  readonly json: S;
  readonly jsonCreate: Schema.optionalKey<S>;
  readonly jsonUpdate: Schema.optionalKey<S>;
}> {}

/**
 * Mutable record field exposed in read output and optional in create/update
 * input.
 *
 * When absent from the create payload, the value must be derived by the
 * service layer before calling the repository.
 *
 * @example
 * displayName: MutableCreateOptionalUpdate(NonEmptyTrimmedString)
 */
export const MutableCreateOptionalUpdate = <S extends Schema.Top>(
  schema: S
): MutableCreateOptionalUpdate<S> =>
  Field({
    select: schema,
    insert: schema,
    update: Schema.optionalKey(schema),
    json: schema,
    jsonCreate: Schema.optionalKey(schema),
    jsonUpdate: Schema.optionalKey(schema),
  });

// ---------------------------------------------------------------------------
// MutableCreateUpdateNullable
// ---------------------------------------------------------------------------

export interface MutableCreateUpdateNullable<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: Schema.OptionFromNullOr<S>;
  readonly insert: Schema.OptionFromNullOr<S>;
  readonly update: Schema.optionalKey<Schema.OptionFromNullOr<S>>;
  readonly json: Schema.OptionFromNullOr<S>;
  readonly jsonCreate: Schema.optionalKey<Schema.OptionFromNullOr<S>>;
  readonly jsonUpdate: Schema.optionalKey<Schema.OptionFromNullOr<S>>;
}> {}

/**
 * Mutable nullable record field exposed in read output and optional in
 * create/update input.
 *
 * Omitted create keys stay omitted at the command boundary and should be
 * normalized by entity construction. Omitted update keys are not updates.
 * Present `Option.none` values clear the field. Present `Option.some(value)`
 * values set it.
 *
 * @example
 * logoUrl: MutableCreateUpdateNullable(Schema.NonEmptyTrimmedString)
 */
export const MutableCreateUpdateNullable = <S extends Schema.Top>(
  schema: S
): MutableCreateUpdateNullable<S> =>
  Field({
    select: Schema.OptionFromNullOr(schema),
    insert: Schema.OptionFromNullOr(schema),
    update: Schema.optionalKey(Schema.OptionFromNullOr(schema)),
    json: Schema.OptionFromNullOr(schema),
    jsonCreate: optionalNullableOptionKey(schema),
    jsonUpdate: optionalNullableOptionKey(schema),
  });
