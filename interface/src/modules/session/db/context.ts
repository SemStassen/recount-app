import { createContext, useContext } from "react";

import type { UserDb } from "./open-user-db";

export interface UserDbContext extends UserDb {}

export const UserDbContext = createContext<UserDbContext | null>(null);

export function useUserDb() {
  const value = useContext(UserDbContext);

  if (!value) {
    throw new Error("useUserDb must be used within a UserDbProvider");
  }

  return value;
}
