import "./global.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import {
  BootstrapRecountInterface,
  createRecountInterfaceInstance,
} from "./bootstrap";
import type { RecountInterfaceHost } from "./lib/runtime";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    grow?: boolean;
  }
}

export function renderRecountInterface(host: RecountInterfaceHost) {
  const rootElement = document.querySelector("#root");

  if (rootElement && !rootElement.innerHTML) {
    // Create the instance outside React so StrictMode remounts do not build
    // duplicate Effect runtimes, routers, or local database resources in dev.
    const instancePromise = createRecountInterfaceInstance(host);
    const root = ReactDOM.createRoot(rootElement);

    root.render(
      <StrictMode>
        <BootstrapRecountInterface instancePromise={instancePromise} />
      </StrictMode>
    );
  }
}
