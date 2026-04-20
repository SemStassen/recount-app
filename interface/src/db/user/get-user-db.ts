import { createSingleKeyResource } from "~/lib/utils/create-single-key-resource";

import { openUserDb } from "./open-user-db";

const userDbResource = createSingleKeyResource({
  create: (userId: string) => openUserDb(userId),
});

export async function getUserDb(userId: string) {
  return userDbResource.get(userId);
}
