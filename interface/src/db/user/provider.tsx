import type { PropsWithChildren } from "react";

import { UserDbContext } from "./context";
import type { UserDb } from "./open-user-db";

interface UserDbProviderProps extends PropsWithChildren {
  userDb: UserDb;
}

export function UserDbProvider({ userDb, children }: UserDbProviderProps) {
  return (
    <UserDbContext.Provider value={userDb}>{children}</UserDbContext.Provider>
  );
}
