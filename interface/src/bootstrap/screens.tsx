function BootstrapShell({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background p-6 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,hsl(var(--primary)/0.14),transparent_32rem)]" />
      <div className="relative w-full max-w-md rounded-2xl border bg-card/95 p-6 shadow-xl shadow-black/5 ring-1 ring-white/5 backdrop-blur">
        {children}
      </div>
    </div>
  );
}

function RecountMark() {
  return (
    <div className="flex size-10 items-center justify-center rounded-xl border bg-background shadow-sm">
      <div className="size-3 rounded-full bg-primary shadow-[0_0_0_6px_hsl(var(--primary)/0.12)]" />
    </div>
  );
}

export function BootstrapScreen() {
  return (
    <BootstrapShell>
      <div className="flex items-start gap-4">
        <RecountMark />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-base">Starting Recount</p>
          <p className="mt-1 text-muted-foreground text-sm">
            Preparing your local runtime, sync clients, and workspace database.
          </p>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="mt-6 h-1 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
      </div>
      <output className="sr-only">Recount is starting.</output>
    </BootstrapShell>
  );
}

export function BootstrapErrorScreen({ error }: { readonly error: unknown }) {
  const message =
    error instanceof Error ? error.message : "Unknown bootstrap failure";

  return (
    <BootstrapShell>
      <div className="flex items-start gap-4">
        <div className="flex size-10 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive">
          <span aria-hidden="true" className="font-semibold text-lg">
            !
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-base">Recount could not start</p>
          <p className="mt-1 text-muted-foreground text-sm">
            The app failed before the main interface could load.
          </p>
        </div>
      </div>
      <pre className="mt-5 max-h-40 overflow-auto rounded-xl border bg-muted/50 p-3 text-muted-foreground text-xs">
        {message}
      </pre>
      <button
        className="mt-5 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 font-medium text-primary-foreground text-sm shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => window.location.reload()}
        type="button"
      >
        Restart app
      </button>
    </BootstrapShell>
  );
}
