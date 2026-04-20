import { useAtomValue } from "@effect/atom-react";
import { cn } from "@recount/ui/utils";
import type { PropsWithChildren } from "react";

import { isNavigationSidebarOpenAtom } from "~/atoms/ui-atoms";

interface HeaderProps extends PropsWithChildren {}

export function Header({ children }: HeaderProps) {
  const isNavigationSidebarOpen = useAtomValue(isNavigationSidebarOpenAtom);

  console.log(isNavigationSidebarOpen);

  return (
    <header
      className={cn(
        "flex flex-row items-center justify-between py-2 px-4",
        !isNavigationSidebarOpen && "pl-12"
      )}
    >
      {/* Breadcrumb */}
      <div>
        <span>Projects</span>
      </div>
      {children}
    </header>
  );
}
