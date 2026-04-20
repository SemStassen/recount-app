import type { UserId } from "@recount/core/shared/schemas";
import { useEffect, useState } from "react";
import type { PropsWithChildren } from "react";

import { UserDbContext } from "./context";
import { openUserDb } from "./open-user-db";

interface UserDbProviderProps extends PropsWithChildren {
  userId: UserId;
}

export function UserDbProvider({ userId, children }: UserDbProviderProps) {
  const [db, setDb] = useState<UserDbContext | null>(null);

  useEffect(() => {
    const nextDb = openUserDb(userId);
    setDb(nextDb);

    return () => {
      setDb(null);
      nextDb.dispose();
    };
  }, [userId]);

  if (!db) {
    return null;
  }

  return <UserDbContext.Provider value={db}>{children}</UserDbContext.Provider>;
}
