import { RegistryContext } from "@effect/atom-react";
import { TooltipProvider } from "@recount/ui/tooltip";
import { RouterProvider } from "@tanstack/react-router";
import { HotkeysProvider } from "react-hotkeys-hook";

import type { RecountInterfaceInstance } from "./bootstrap/instance";
import { ThemeProvider } from "./components/theme-provider";

export function RecountInterfaceApp({
  instance,
}: {
  readonly instance: RecountInterfaceInstance;
}) {
  return (
    <RegistryContext.Provider value={instance.app.atomRegistry}>
      <HotkeysProvider>
        <TooltipProvider delay={100}>
          <ThemeProvider>
            <RouterProvider router={instance.router} />
          </ThemeProvider>
        </TooltipProvider>
      </HotkeysProvider>
    </RegistryContext.Provider>
  );
}
