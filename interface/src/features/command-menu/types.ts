import type { IconProps } from "@recount/ui/icons";
import type { ReactNode } from "react";

export type CommandCategory = "navigation" | "settings" | "developer";

export type CommandId = string;

export type CommandRegistrationId = string;

export type CommandIcon = (props: IconProps) => ReactNode;

export interface CommandActionContext {
  close: () => void;
}

export interface Command {
  id: CommandId;
  title: string;
  subtitle?: string;
  keywords?: Array<string>;
  category: CommandCategory;
  icon?: CommandIcon;
  hotkey?: string;
  disabled?: boolean;
  perform?: (context: CommandActionContext) => void | Promise<void>;
  children?: () => Array<Command>;
}

export interface CommandRegistration {
  id: CommandRegistrationId;
  commands: Array<Command>;
}

export interface CommandSearchOptions {
  includeDisabled?: boolean;
}
