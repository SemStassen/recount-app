import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@recount/ui/popover";

export function AskRecountPopover() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost">Ask Recount</Button>} />
      <PopoverContent
        align="end"
        className="h-125 w-100 max-h-[calc(100dvh-3rem)] max-w-[calc(100dvw-1rem)]"
        side="top"
      >
        <div className="flex flex-row justify-between gap-2">
          <div>
            <span>New chat</span>
          </div>
          <PopoverClose>
            <Icons.X />
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
