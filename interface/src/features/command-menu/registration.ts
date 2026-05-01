import { useEffect, useId } from "react";

import { registerCommands } from "./atoms";
import type { Command, CommandRegistrationId } from "./types";

export function useRegisterCommands(
  commands: Array<Command>,
  options?: { id?: CommandRegistrationId }
) {
  const generatedId = useId();
  const registrationId = options?.id ?? generatedId;

  useEffect(() => {
    return registerCommands(registrationId, commands);
  }, [registrationId, commands]);
}
