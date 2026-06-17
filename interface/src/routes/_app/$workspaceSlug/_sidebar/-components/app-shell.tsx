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
        "grid h-full w-full grid-cols-[auto_minmax(0,1fr)] overflow-hidden",
        className
      )}
      {...props}
    >
      {sidebar}
      <div className="grid min-w-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
        <main className="overflow-hidden">{children}</main>
        <footer className="flex h-7 items-center justify-end border-t bg-background px-2">
          {footer}
        </footer>
      </div>
    </div>
  );
}
