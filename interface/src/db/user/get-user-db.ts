import type { UserId } from "@recount/core/shared/schemas";

import { createSingleKeyResource } from "~/lib/utils/create-single-key-resource";

import { openUserDb } from "./open-user-db";

const userDbResource = createSingleKeyResource({
  create: (userId: UserId) => openUserDb(userId),
});

export async function getUserDb(userId: UserId) {
  return await userDbResource.get(userId);
}
