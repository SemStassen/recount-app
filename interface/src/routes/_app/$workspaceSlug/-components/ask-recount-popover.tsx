import { useAtom } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import {
  Dialog,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DialogViewport,
} from "@recount/ui/dialog";
import { Icons } from "@recount/ui/icons";
import { Textarea } from "@recount/ui/textarea";

import { isAskRecountOpenAtom } from "~/atoms/ui-atoms";

export function AskRecountPopover() {
  const [isOpen, setIsOpen] = useAtom(isAskRecountOpenAtom);

  return (
    <Dialog modal={false} onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger render={<Button variant="ghost" />}>
        Ask Recount
      </DialogTrigger>
      <DialogPortal>
        <DialogViewport className="pointer-events-none z-40 overflow-visible p-0">
          <DialogPopup className="pointer-events-auto fixed right-2 bottom-2 h-125 max-h-[calc(100dvh-1rem)] w-100 max-w-[calc(100dvw-1rem)] max-sm:right-1 max-sm:bottom-1 max-sm:max-h-[calc(100dvh-0.5rem)] max-sm:max-w-[calc(100dvw-0.5rem)]">
            <div className="flex flex-row items-center justify-between gap-2 border-b p-3">
              <DialogTitle className="text-sm">New chat</DialogTitle>
              <DialogClose
                aria-label="Close Ask Recount"
                render={<Button size="icon-sm" variant="ghost" />}
              >
                <Icons.X aria-hidden="true" />
              </DialogClose>
            </div>
            <div className="min-h-0 flex-1" />
            <div className="border-t p-3">
              <Textarea placeholder="Ask Recount..." autoFocus={true} />
            </div>
          </DialogPopup>
        </DialogViewport>
      </DialogPortal>
    </Dialog>
  );
}
