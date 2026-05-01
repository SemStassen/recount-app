import { Atom } from "effect/unstable/reactivity";

import { atomRegistry } from "~/atoms/registry";

import { defaultCommands } from "./default-commands";
import type {
  Command,
  CommandRegistration,
  CommandRegistrationId,
} from "./types";

type CommandRegistryState = Record<CommandRegistrationId, Array<Command>>;

export const commandMenuOpenAtom = Atom.make(false);

export const commandMenuSearchQueryAtom = Atom.make("");

export const commandRegistryAtom = Atom.make<CommandRegistryState>({
  "default-commands": defaultCommands,
});

export const commandRegistrationsAtom = Atom.map(
  commandRegistryAtom,
  (registry) =>
    Object.entries(registry).map(
      ([id, commands]): CommandRegistration => ({ id, commands })
    )
);

export const commandsAtom = Atom.map(
  commandRegistrationsAtom,
  (registrations) =>
    registrations.flatMap((registration) => registration.commands)
);

export function registerCommands(
  id: CommandRegistrationId,
  commands: Array<Command>
) {
  atomRegistry.update(commandRegistryAtom, (registry) => ({
    ...registry,
    [id]: commands,
  }));

  return () => unregisterCommands(id);
}

function unregisterCommands(id: CommandRegistrationId) {
  atomRegistry.update(commandRegistryAtom, (registry) => {
    const { [id]: _commands, ...nextRegistry } = registry;
    return nextRegistry;
  });
}
