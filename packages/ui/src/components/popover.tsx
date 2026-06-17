import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import type React from "react";

import { cn } from "#utils/cn";

export const PopoverCreateHandle: typeof PopoverPrimitive.createHandle =
  PopoverPrimitive.createHandle;

export function Popover(
  props: PopoverPrimitive.Root.Props
): React.ReactElement {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

export function PopoverTrigger(
  props: PopoverPrimitive.Trigger.Props
): React.ReactElement {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

export function PopoverPortal({
  className,
  ...props
}: PopoverPrimitive.Portal.Props): React.ReactElement {
  return (
    <PopoverPrimitive.Portal
      className={className}
      data-slot="popover-portal"
      {...props}
    />
  );
}

export function PopoverPositioner({
  className,
  ...props
}: PopoverPrimitive.Positioner.Props): React.ReactElement {
  return (
    <PopoverPrimitive.Positioner
      className={cn("z-50 max-h-(--available-height)", className)}
      data-slot="popover-positioner"
      {...props}
    />
  );
}

export function PopoverPopup({
  className,
  ...props
}: PopoverPrimitive.Popup.Props): React.ReactElement {
  return (
    <PopoverPrimitive.Popup
      className={cn(
        "origin-(--transform-origin) rounded-lg border bg-popover text-popover-foreground outline-none",
        "transition-[scale,opacity] duration-150 ease-out",
        "data-ending-style:scale-98 data-starting-style:scale-98",
        "data-ending-style:opacity-0 data-starting-style:opacity-0",
        className
      )}
      data-slot="popover-popup"
      {...props}
    />
  );
}

export function PopoverViewport({
  className,
  ...props
}: PopoverPrimitive.Viewport.Props): React.ReactElement {
  return (
    <PopoverPrimitive.Viewport
      className={cn(
        "relative size-full max-h-(--available-height) overflow-y-auto p-4",
        "has-data-[slot=calendar]:p-2",
        className
      )}
      data-slot="popover-viewport"
      {...props}
    />
  );
}

export interface PopoverContentProps extends PopoverPrimitive.Popup.Props {
  side?: PopoverPrimitive.Positioner.Props["side"];
  sideOffset?: PopoverPrimitive.Positioner.Props["sideOffset"];
  align?: PopoverPrimitive.Positioner.Props["align"];
  alignOffset?: PopoverPrimitive.Positioner.Props["alignOffset"];
  anchor?: PopoverPrimitive.Positioner.Props["anchor"];
  matchAnchorWidth?: boolean;
}

export function PopoverContent({
  children,
  className,
  align = "center",
  alignOffset = 0,
  anchor,
  side = "bottom",
  sideOffset = 4,
  matchAnchorWidth = false,
  ...props
}: PopoverContentProps): React.ReactElement {
  return (
    <PopoverPortal>
      <PopoverPositioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className={cn(matchAnchorWidth && "w-[var(--anchor-width)]")}
        side={side}
        sideOffset={sideOffset}
      >
        <PopoverPopup className={className} {...props}>
          <PopoverViewport>{children}</PopoverViewport>
        </PopoverPopup>
      </PopoverPositioner>
    </PopoverPortal>
  );
}

export function PopoverClose(
  props: PopoverPrimitive.Close.Props
): React.ReactElement {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

export function PopoverTitle({
  className,
  ...props
}: PopoverPrimitive.Title.Props): React.ReactElement {
  return (
    <PopoverPrimitive.Title
      className={cn("font-semibold text-lg leading-none", className)}
      data-slot="popover-title"
      {...props}
    />
  );
}

export function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props): React.ReactElement {
  return (
    <PopoverPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="popover-description"
      {...props}
    />
  );
}

export { PopoverPrimitive };
