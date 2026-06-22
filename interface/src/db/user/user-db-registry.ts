import type { UserId } from "@recount/core/shared/schemas";

import { createCurrentResourceRegistry } from "~/lib/utils/create-resource-registry";

import { openUserDb } from "./open-user-db";

export const userDbRegistry = createCurrentResourceRegistry({
  load: async (userId: UserId) => {
    const userDb = await openUserDb(userId);

    await userDb.preload();

    return userDb;
  },
});
