import type { UserId } from "@recount/core/shared/schemas";

import { createSingleKeyResource } from "~/lib/utils/create-single-key-resource";

import { openUserDb } from "./open-user-db";

export const userDatabases = createSingleKeyResource({
  create: (userId: UserId) => openUserDb(userId),
});
