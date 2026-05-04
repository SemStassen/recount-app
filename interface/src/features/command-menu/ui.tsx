import { useAtom, useAtomValue } from "@effect/atom-react";
import {
  Command,
  CommandDialog,
  CommandDialogPopup,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@recount/ui/command";
import { Icons } from "@recount/ui/icons";
import { useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import {
  commandMenuOpenAtom,
  commandMenuSearchQueryAtom,
  commandsAtom,
} from "./atoms";
import { isCommandDisabled, searchCommands } from "./search";
import type { Command as CommandItemType, CommandCategory } from "./types";

const CATEGORY_ORDER: Array<CommandCategory> = [
  "navigation",
  "settings",
  "developer",
];

const BACK_COMMAND_VALUE = "command-menu.back";

function getCategoryLabel(category: CommandCategory) {
  switch (category) {
    case "developer":
      return "Developer";
    case "navigation":
      return "Navigation";
    case "settings":
      return "Settings";
  }
}

function groupCommands(commands: Array<CommandItemType>) {
  const grouped = commands.reduce(
    (acc, command) => {
      acc[command.category] ??= [];
      acc[command.category].push(command);
      return acc;
    },
    {} as Record<CommandCategory, Array<CommandItemType>>
  );

  return CATEGORY_ORDER.flatMap((category) => {
    const commands = grouped[category];

    if (!commands?.length) {
      return [];
    }

    return [{ category, commands }];
  });
}

export function CommandMenu() {
  const [isOpen, setIsOpen] = useAtom(commandMenuOpenAtom);
  const [query, setQuery] = useAtom(commandMenuSearchQueryAtom);
  const commands = useAtomValue(commandsAtom);
  const [stack, setStack] = useState<
    Array<{ title: string; commands: Array<CommandItemType> }>
  >([]);

  useHotkeys("meta+k", () => setIsOpen((open) => !open), {
    preventDefault: true,
  });

  const currentCommands = stack.at(-1)?.commands ?? commands;
  const searchedCommands = useMemo(
    () => searchCommands(currentCommands, query),
    [currentCommands, query]
  );
  const groupedCommands = useMemo(
    () => groupCommands(searchedCommands),
    [searchedCommands]
  );

  function resetMenuState() {
    setStack([]);
    setQuery("");
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);

    if (!open) {
      resetMenuState();
    }
  }

  function selectCommand(command: CommandItemType) {
    const children = command
      .children?.()
      .filter((child) => !isCommandDisabled(child));

    if (children?.length) {
      setStack((currentStack) => [
        ...currentStack,
        { title: command.title, commands: children },
      ]);
      setQuery("");
      return;
    }

    void command.perform?.({ close: () => handleOpenChange(false) });
  }

  return (
    <CommandDialog onOpenChange={handleOpenChange} open={isOpen}>
      <CommandDialogPopup>
        <Command filter={() => true} items={searchedCommands}>
          <CommandInput
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder={
              stack.length > 0 ? stack.at(-1)?.title : "Search for a command..."
            }
            value={query}
          />
          <CommandList>
            <CommandEmpty>No command found.</CommandEmpty>
            {stack.length > 0 && (
              <CommandItem
                onClick={() => {
                  setStack((currentStack) => currentStack.slice(0, -1));
                  setQuery("");
                }}
                value={BACK_COMMAND_VALUE}
              >
                <Icons.ArrowLeft />
                <span>Back</span>
              </CommandItem>
            )}
            {groupedCommands.map(({ category, commands: categoryCommands }) => (
              <CommandGroup key={category}>
                <CommandGroupLabel>
                  {getCategoryLabel(category)}
                </CommandGroupLabel>
                {categoryCommands.map((command) => (
                  <CommandMenuItem
                    command={command}
                    key={command.id}
                    onSelect={selectCommand}
                  />
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialogPopup>
    </CommandDialog>
  );
}

function CommandMenuItem({
  command,
  onSelect,
}: {
  command: CommandItemType;
  onSelect: (command: CommandItemType) => void;
}) {
  const Icon = command.icon;

  return (
    <CommandItem onClick={() => onSelect(command)} value={command.id}>
      {Icon && <Icon />}
      <span>{command.title}</span>
      {command.children && <Icons.ChevronRight className="ms-auto" />}
      {command.hotkey && !command.children && (
        <CommandShortcut>{command.hotkey}</CommandShortcut>
      )}
    </CommandItem>
  );
}
