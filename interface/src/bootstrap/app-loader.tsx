import { useEffect, useState } from "react";

import { RecountInterfaceApp } from "../app";
import type { RecountInterfaceInstance } from "./instance";
import { BootstrapErrorScreen, BootstrapScreen } from "./screens";

type BootstrapState =
  | { readonly status: "pending" }
  | { readonly status: "ready"; readonly instance: RecountInterfaceInstance }
  | { readonly status: "failed"; readonly error: unknown };

export function BootstrapRecountInterface({
  instancePromise,
}: {
  readonly instancePromise: Promise<RecountInterfaceInstance>;
}) {
  const [state, setState] = useState<BootstrapState>({ status: "pending" });

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const instance = await instancePromise;

        if (isMounted) {
          setState({ status: "ready", instance });
        }
      } catch (error) {
        if (isMounted) {
          setState({ status: "failed", error });
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [instancePromise]);

  if (state.status === "ready") {
    return <RecountInterfaceApp instance={state.instance} />;
  }

  if (state.status === "failed") {
    return <BootstrapErrorScreen error={state.error} />;
  }

  return <BootstrapScreen />;
}
