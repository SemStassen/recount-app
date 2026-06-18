import { Atom } from "effect/unstable/reactivity";

import type {
  Command,
  CommandRegistration,
  CommandRegistrationId,
} from "./types";

type CommandRegistryState = Record<CommandRegistrationId, Array<Command>>;

export const commandMenuOpenAtom = Atom.make(false);

export const commandMenuSearchQueryAtom = Atom.make("");

export const commandRegistryAtom = Atom.make<CommandRegistryState>({});

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
