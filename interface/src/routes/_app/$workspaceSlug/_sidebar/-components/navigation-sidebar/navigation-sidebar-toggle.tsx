import { useAtom } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";

import { isNavigationSidebarOpenAtom } from "~/atoms/ui-atoms";
import { useRegisterCommands } from "~/features/command-menu";

export function NavigationSidebarToggle() {
  const [isOpen, setIsOpen] = useAtom(isNavigationSidebarOpenAtom);
  const toggleIsOpen = () => setIsOpen((o) => !o);

  useRegisterCommands(
    [
      {
        id: isOpen
          ? "navigation.close-left-sidebar"
          : "navigation.open-left-sidebar",
        title: isOpen ? "Close left sidebar" : "Open left sidebar",
        hotkey: "bracketleft",
        category: "navigation",
        icon: Icons.Sidebar,
        perform: ({ close }) => {
          toggleIsOpen();
          close();
        },
      },
    ],
    { id: "navigation-sidebar-toggle" }
  );

  return (
    <Button onClick={toggleIsOpen} size="icon" variant="ghost">
      <Icons.Sidebar />
    </Button>
  );
}
