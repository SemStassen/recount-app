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
      <PopoverContent className="w-100 h-125" align="end" side="top">
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
