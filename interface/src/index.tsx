import { RegistryContext } from "@effect/atom-react";
import { AnchoredToastProvider, ToastProvider } from "@recount/ui/toast";
import { TooltipProvider } from "@recount/ui/tooltip";
import { TanStackDevtools } from "@tanstack/react-devtools";

import "./globals.css";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { HotkeysProvider } from "react-hotkeys-hook";

import { atomRegistry } from "./atoms/registry";
import { ThemeProvider } from "./components/theme-provider";
import { env } from "./lib/env";
import { router } from "./router";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    className?: string;
  }
}

export function renderRecountInterface() {
  const rootElement = document.querySelector("#root");

  if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <StrictMode>
        <RegistryContext.Provider value={atomRegistry}>
          <HotkeysProvider>
            <TooltipProvider delay={100}>
              <ToastProvider>
                <AnchoredToastProvider>
                  <ThemeProvider>
                    <RouterProvider router={router} />
                    {env.VITE_DEV && (
                      <TanStackDevtools
                        plugins={[
                          {
                            name: "TanStack Router",
                            render: <TanStackRouterDevtoolsPanel />,
                          },
                          {
                            name: "TanStack Form",
                            render: <FormDevtoolsPanel />,
                          },
                        ]}
                      />
                    )}
                  </ThemeProvider>
                </AnchoredToastProvider>
              </ToastProvider>
            </TooltipProvider>
          </HotkeysProvider>
        </RegistryContext.Provider>
      </StrictMode>
    );
  }
}
