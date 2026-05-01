import { Icons } from "@recount/ui/icons";
import { linkOptions } from "@tanstack/react-router";

import { router } from "~/router";

import type { Command } from "./types";

export const defaultCommands: Array<Command> = [
  {
    id: "navigation.go-to-projects",
    category: "navigation",
    icon: Icons.ArrowRight,
    perform: ({ close }) => {
      router.navigate(
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
      router.navigate(
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
      router.navigate(
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
    category: "developer",
    id: "developer.say-hello",
    icon: Icons.Bug,
    perform: ({ close }) => {
      console.log("hello");
      close();
    },
    title: "Say hello",
  },
];
