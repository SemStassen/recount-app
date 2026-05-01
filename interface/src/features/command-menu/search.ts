import type { Command, CommandSearchOptions } from "./types";

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function getCommandSearchText(command: Command) {
  return [
    command.title,
    command.subtitle,
    command.category,
    ...(command.keywords ?? []),
  ]
    .filter((part): part is string => Boolean(part))
    .join(" ")
    .toLowerCase();
}

export function isCommandDisabled(command: Command) {
  return Boolean(command.disabled);
}

export function searchCommands(
  commands: Array<Command>,
  query: string,
  options: CommandSearchOptions = {}
) {
  const normalizedQuery = normalizeSearchValue(query);
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return commands.filter((command) => {
    if (!(options.includeDisabled ?? true) && isCommandDisabled(command)) {
      return false;
    }

    if (terms.length === 0) {
      return true;
    }

    const searchText = getCommandSearchText(command);
    return terms.every((term) => searchText.includes(term));
  });
}
