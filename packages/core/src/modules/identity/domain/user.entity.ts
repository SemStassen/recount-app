import { Schema } from "effect";

import { SharedModel } from "#internal/effect/index";
import { Email, NonEmptyTrimmedString, UserId } from "#shared/schemas/index";

export class User extends SharedModel.Class<User>("User")(
  {
    id: SharedModel.ImmutableReadOnly(UserId),
    email: SharedModel.MutableReadOnly(Email),
    emailVerified: SharedModel.MutableReadOnly(Schema.Boolean),
    // Better Auth seeds this as an empty string on email signup;
    // NonEmptyTrimmedString is enforced on all client input variants but not at the DB level.
    fullName: SharedModel.Field({
      select: Schema.String,
      insert: Schema.String,
      update: Schema.optionalKey(NonEmptyTrimmedString),
      json: Schema.String,
      jsonCreate: Schema.optionalKey(NonEmptyTrimmedString),
      jsonUpdate: Schema.optionalKey(NonEmptyTrimmedString),
    }),
  },
  {
    identifier: "User",
    title: "User",
    description: "A user",
  }
) {}
