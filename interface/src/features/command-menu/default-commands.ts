import { Icons } from "@recount/ui/icons";
import { linkOptions } from "@tanstack/react-router";
import type { useNavigate } from "@tanstack/react-router";

import type { Command } from "./types";

export function createDefaultCommands(
  navigate: ReturnType<typeof useNavigate>
): Array<Command> {
  return [
    {
      id: "navigation.go-to-log-time",
      category: "navigation",
      icon: Icons.ArrowRight,
      perform: ({ close }) => {
        navigate(
          linkOptions({
            to: "/$workspaceSlug",
            from: "/$workspaceSlug/",
          })
        );
        close();
      },
      title: "Go to log time",
    },
    {
      id: "navigation.go-to-projects",
      category: "navigation",
      icon: Icons.ArrowRight,
      perform: ({ close }) => {
        navigate(
          linkOptions({
            to: "/$workspaceSlug/projects",
            from: "/$workspaceSlug/",
          })
        );
        close();
      },
      title: "Go to projects",
    },
    {
      id: "navigation.go-to-preferences",
      category: "navigation",
      icon: Icons.ArrowRight,
      perform: ({ close }) => {
        navigate(
          linkOptions({
            to: "/$workspaceSlug/settings",
            from: "/$workspaceSlug/",
          })
        );
        close();
      },
      title: "Go to preferences",
    },
    {
      id: "navigation.go-to-profile",
      category: "navigation",
      icon: Icons.ArrowRight,
      perform: ({ close }) => {
        navigate(
          linkOptions({
            to: "/$workspaceSlug/settings/profile",
            from: "/$workspaceSlug/",
          })
        );
        close();
      },
      title: "Go to profile",
    },
    {
      id: "navigation.go-to-archive",
      category: "navigation",
      icon: Icons.ArrowRight,
      perform: ({ close }) => {
        navigate(
          linkOptions({
            to: "/$workspaceSlug/archive/projects",
            from: "/$workspaceSlug/",
          })
        );
        close();
      },
      title: "Go to archive",
    },
  ];
}
