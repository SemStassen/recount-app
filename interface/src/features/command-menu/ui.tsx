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
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import {
  commandMenuOpenAtom,
  commandMenuSearchQueryAtom,
  commandsAtom,
} from "./atoms";
import { createDefaultCommands } from "./default-commands";
import { useRegisterCommands } from "./registration";
import { isCommandDisabled, searchCommands } from "./search";
import type { Command as CommandItemType, CommandCategory } from "./types";

const BACK_COMMAND_VALUE = "command-menu.back";
const CATEGORY_ORDER: Array<CommandCategory> = [
  "navigation",
  "project",
  "settings",
  "developer",
];

function getCategoryLabel(category: CommandCategory) {
  return {
    developer: "Developer",
    navigation: "Navigation",
    project: "Project",
    settings: "Settings",
  }[category];
}

function groupCommands(commandItems: Array<CommandItemType>) {
  const grouped = new Map<CommandCategory, Array<CommandItemType>>();

  for (const command of commandItems) {
    const categoryCommands = grouped.get(command.category) ?? [];
    categoryCommands.push(command);
    grouped.set(command.category, categoryCommands);
  }

  return CATEGORY_ORDER.flatMap((category) => {
    const categoryCommands = grouped.get(category);

    if (!categoryCommands?.length) {
      return [];
    }

    return [{ category, commands: categoryCommands }];
  });
}

export function CommandMenu() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useAtom(commandMenuOpenAtom);
  const [query, setQuery] = useAtom(commandMenuSearchQueryAtom);
  const commands = useAtomValue(commandsAtom);
  const [stack, setStack] = useState<
    Array<{ title: string; commands: Array<CommandItemType> }>
  >([]);
  const closeResolversRef = useRef<Array<() => void>>([]);
  const defaultCommands = useMemo(
    () => createDefaultCommands(navigate),
    [navigate]
  );

  useRegisterCommands(defaultCommands, { id: "default-commands" });

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

  function closeCommandMenu() {
    if (!isOpen) {
      return Promise.resolve();
    }

    handleOpenChange(false);

    // oxlint-disable-next-line promise/avoid-new
    return new Promise<void>((resolve) => {
      closeResolversRef.current.push(resolve);
    });
  }

  function handleOpenChangeComplete(open: boolean) {
    if (open) {
      return;
    }

    const closeResolvers = closeResolversRef.current;
    closeResolversRef.current = [];

    for (const resolve of closeResolvers) {
      resolve();
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

    void command.perform?.({ close: closeCommandMenu });
  }

  return (
    <CommandDialog
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={handleOpenChangeComplete}
      open={isOpen}
    >
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
