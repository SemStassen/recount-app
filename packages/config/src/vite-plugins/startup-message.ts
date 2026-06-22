// ast-grep-ignore: no-console-log

import type { Plugin } from "vite";

interface StartupMessageOptions {
  messages?: Array<string>;
}

export function startupMessage(options: StartupMessageOptions): Plugin {
  return {
    name: "startup-message",
    apply: "serve",
    configureServer(server) {
      server.httpServer?.once("listening", () => {
        console.log();
        const messages = options.messages ?? [];
        for (const message of messages) {
          console.log(message);
        }
        console.log();
      });
    },
  };
}
