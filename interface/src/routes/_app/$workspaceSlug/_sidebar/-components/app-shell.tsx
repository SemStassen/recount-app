import { cn } from "@recount/ui/utils";

interface WorkspaceAppShellProps extends React.ComponentProps<"div"> {
  sidebar: React.ReactNode;
  footer: React.ReactNode;
}

export function WorkspaceAppShell({
  sidebar,
  footer,
  children,
  className,
  ...props
}: WorkspaceAppShellProps) {
  return (
    <div
      className={cn(
        "flex h-dvh w-dvw overflow-hidden overscroll-none",
        className
      )}
      {...props}
    >
      <div className="h-full shrink-0">{sidebar}</div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </main>
        <footer className="flex h-7 shrink-0 items-center justify-end border-t bg-background px-2">
          {footer}
        </footer>
      </div>
    </div>
  );
}
