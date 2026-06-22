import { useAtomSet } from "@effect/atom-react";
import { useEffect, useId } from "react";

import { commandRegistryAtom } from "./atoms";
import type { Command, CommandRegistrationId } from "./types";

export function useRegisterCommands(
  commands: Array<Command>,
  options?: { id?: CommandRegistrationId }
) {
  const generatedId = useId();
  const registrationId = options?.id ?? generatedId;
  const setCommandRegistry = useAtomSet(commandRegistryAtom);

  useEffect(() => {
    setCommandRegistry((registry) => ({
      ...registry,
      [registrationId]: commands,
    }));

    return () => {
      setCommandRegistry((registry) => {
        const { [registrationId]: _commands, ...nextRegistry } = registry;
        return nextRegistry;
      });
    };
  }, [registrationId, commands, setCommandRegistry]);
}
