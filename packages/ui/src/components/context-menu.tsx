import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "#utils/cn";

import { Icons } from "./icons";

export function ContextMenu(
  props: ContextMenuPrimitive.Root.Props
): React.ReactElement {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

export function ContextMenuTrigger(
  props: ContextMenuPrimitive.Trigger.Props
): React.ReactElement {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

export function ContextMenuPortal({
  className,
  ...props
}: ContextMenuPrimitive.Portal.Props): React.ReactElement {
  return (
    <ContextMenuPrimitive.Portal
      className={className}
      data-slot="context-menu-portal"
      {...props}
    />
  );
}

export function ContextMenuBackdrop({
  className,
  ...props
}: ContextMenuPrimitive.Backdrop.Props): React.ReactElement {
  return (
    <ContextMenuPrimitive.Backdrop
      className={cn("fixed inset-0", className)}
      data-slot="context-menu-backdrop"
      {...props}
    />
  );
}

export function ContextMenuPositioner({
  className,
  ...props
}: ContextMenuPrimitive.Positioner.Props): React.ReactElement {
  return (
    <ContextMenuPrimitive.Positioner
      className={cn("relative", className)}
      data-slot="context-menu-positioner"
      {...props}
    />
  );
}

export function ContextMenuPopup({
  className,
  ...props
}: ContextMenuPrimitive.Popup.Props): React.ReactElement {
  return (
    <ContextMenuPrimitive.Popup
      className={cn("relative", className)}
      data-slot="context-menu-popup"
      {...props}
    />
  );
}

export function ContextMenuGroup(
  props: ContextMenuPrimitive.Group.Props
): React.ReactElement {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

export function ContextMenuRadioGroup(
  props: ContextMenuPrimitive.RadioGroup.Props
): React.ReactElement {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

export function ContextMenuSub(
  props: ContextMenuPrimitive.SubmenuRoot.Props
): React.ReactElement {
  return (
    <ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props} />
  );
}

export function ContextMenuArrow({
  className,
  ...props
}: ContextMenuPrimitive.Arrow.Props): React.ReactElement {
  return (
    <ContextMenuPrimitive.Arrow
      className={cn(
        "data-[side=bottom]:top-[-8px] data-[side=top]:bottom-[-8px]",
        "data-[side=left]:right-[-13px] data-[side=right]:left-[-13px]",
        "data-[side=left]:rotate-90 data-[side=right]:-rotate-90 data-[side=top]:rotate-180",
        className
      )}
      data-slot="context-menu-arrow"
      {...props}
    >
      <Icons.ChevronRight />
    </ContextMenuPrimitive.Arrow>
  );
}

export interface ContextMenuContentProps
  extends ContextMenuPrimitive.Popup.Props {
  side?: ContextMenuPrimitive.Positioner.Props["side"];
  sideOffset?: ContextMenuPrimitive.Positioner.Props["sideOffset"];
  align?: ContextMenuPrimitive.Positioner.Props["align"];
  alignOffset?: ContextMenuPrimitive.Positioner.Props["alignOffset"];
  anchor?: ContextMenuPrimitive.Positioner.Props["anchor"];
  showArrow?: boolean;
  matchAnchorWidth?: boolean;
}

export function ContextMenuContent({
  children,
  className,
  align = "center",
  alignOffset = 0,
  anchor,
  side = "bottom",
  sideOffset = 4,
  showArrow = false,
  matchAnchorWidth = false,
  ...props
}: ContextMenuContentProps): React.ReactElement {
  return (
    <ContextMenuPortal>
      <ContextMenuPositioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className={cn(
          "max-h-(--available-height)",
          matchAnchorWidth && "w-[var(--anchor-width)]"
        )}
        data-slot="context-menu-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <ContextMenuPopup
          className={cn(
            "rounded-md bg-popover py-1 text-popover-foreground shadow-md",
            "overlay-outline animate-popup",
            className
          )}
          data-slot="context-menu-content"
          {...props}
        >
          {showArrow && <ContextMenuArrow />}
          {children}
        </ContextMenuPopup>
      </ContextMenuPositioner>
    </ContextMenuPortal>
  );
}

export function ContextMenuSubContent({
  align = "start",
  side = "right",
  sideOffset = -4,
  alignOffset = 0,
  ...props
}: ContextMenuContentProps): React.ReactElement {
  return (
    <ContextMenuContent
      align={align}
      alignOffset={alignOffset}
      data-slot="context-menu-sub-content"
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

export const contextMenuItemVariants = cva(
  [
    "flex items-center gap-2 px-3.5 py-1.5 text-sm",
    "cursor-default select-none outline-none",
    "highlight-on-active",
    "data-disabled:pointer-events-none data-disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "[&_svg:not([class*='size-'])]:size-4",
    "[&_svg:not([class*='text-'])]:text-muted-foreground hover:[&_svg:not([class*='text-'])]:text-foreground",
  ],
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "",
        destructive: [
          "text-destructive *:[svg]:!text-destructive",
          "data-[highlighted]:text-destructive",
          "data-[highlighted]:before:bg-destructive/10 dark:data-[highlighted]:before:bg-destructive/20",
        ],
      },
    },
  }
);

export interface ContextMenuItemProps
  extends
    ContextMenuPrimitive.Item.Props,
    VariantProps<typeof contextMenuItemVariants> {}

export function ContextMenuItem({
  className,
  variant,
  ...props
}: ContextMenuItemProps): React.ReactElement {
  return (
    <ContextMenuPrimitive.Item
      className={cn(contextMenuItemVariants({ variant, className }))}
      data-slot="context-menu-item"
      {...props}
    />
  );
}

export interface ContextMenuLinkItemProps
  extends
    ContextMenuPrimitive.LinkItem.Props,
    VariantProps<typeof contextMenuItemVariants> {}

export function ContextMenuLinkItem({
  className,
  variant,
  ...props
}: ContextMenuLinkItemProps): React.ReactElement {
  return (
    <ContextMenuPrimitive.LinkItem
      className={cn(contextMenuItemVariants({ variant, className }))}
      data-slot="context-menu-link-item"
      {...props}
    />
  );
}

export function ContextMenuCheckboxItem({
  className,
  ...props
}: ContextMenuPrimitive.CheckboxItem.Props): React.ReactElement {
  return (
    <ContextMenuPrimitive.CheckboxItem
      className={className}
      data-slot="context-menu-checkbox-item"
      {...props}
    />
  );
}

export function ContextMenuRadioItem({
  className,
  ...props
}: ContextMenuPrimitive.RadioItem.Props): React.ReactElement {
  return (
    <ContextMenuPrimitive.RadioItem
      className={className}
      data-slot="context-menu-radio-item"
      {...props}
    />
  );
}

export interface ContextMenuCheckboxItemContentProps
  extends ContextMenuPrimitive.CheckboxItem.Props {
  indicatorPlacement?: "start" | "end";
  indicatorIcon?: React.ReactNode;
}

export function ContextMenuCheckboxItemContent({
  className,
  children,
  checked,
  indicatorPlacement = "start",
  indicatorIcon = <Icons.Check className="size-4" />,
  ...props
}: ContextMenuCheckboxItemContentProps): React.ReactElement {
  return (
    <ContextMenuPrimitive.CheckboxItem
      checked={checked}
      className={cn(
        "grid items-center gap-2 py-1.5 pr-3 text-sm",
        "cursor-default select-none outline-none",
        "highlight-on-active",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        indicatorPlacement === "start" && "grid-cols-[1rem_1fr] pl-3.5",
        indicatorPlacement === "end" && "grid-cols-[1fr_1rem] pl-3.5",
        className
      )}
      data-slot="context-menu-checkbox-item-content"
      {...props}
    >
      <ContextMenuPrimitive.CheckboxItemIndicator
        className={cn(
          "row-start-1 flex items-center justify-center",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          "[&_svg:not([class*='size-'])]:size-4",
          indicatorPlacement === "start" ? "col-start-1" : "col-start-2"
        )}
      >
        {indicatorIcon}
      </ContextMenuPrimitive.CheckboxItemIndicator>
      <div
        className={cn(
          "row-start-1 flex items-center gap-2",
          indicatorPlacement === "start" ? "col-start-2" : "col-start-1"
        )}
      >
        {children}
      </div>
    </ContextMenuPrimitive.CheckboxItem>
  );
}

export interface ContextMenuRadioItemContentProps
  extends ContextMenuPrimitive.RadioItem.Props {
  indicatorPlacement?: "start" | "end";
  indicatorIcon?: React.ReactNode;
}

export function ContextMenuRadioItemContent({
  children,
  className,
  indicatorPlacement = "start",
  indicatorIcon = <Icons.Circle className="size-2.5 fill-current" />,
  ...props
}: ContextMenuRadioItemContentProps): React.ReactElement {
  return (
    <ContextMenuPrimitive.RadioItem
      className={cn(
        "grid items-center gap-2 py-1.5 pr-3 text-sm",
        "cursor-default select-none outline-none",
        "highlight-on-active",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        indicatorPlacement === "start" && "grid-cols-[1rem_1fr] pl-2",
        indicatorPlacement === "end" && "grid-cols-[1fr_1rem] pl-4",
        className
      )}
      data-slot="context-menu-radio-item-content"
      {...props}
    >
      <ContextMenuPrimitive.RadioItemIndicator
        className={cn(
          "row-start-1 flex items-center justify-center",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          "[&_svg:not([class*='size-'])]:size-4",
          indicatorPlacement === "start" ? "col-start-1" : "col-start-2"
        )}
      >
        {indicatorIcon}
      </ContextMenuPrimitive.RadioItemIndicator>
      <div
        className={cn(
          "row-start-1 flex items-center gap-2",
          indicatorPlacement === "start" ? "col-start-2" : "col-start-1"
        )}
      >
        {children}
      </div>
    </ContextMenuPrimitive.RadioItem>
  );
}

export function ContextMenuSubTrigger({
  className,
  ...props
}: ContextMenuPrimitive.SubmenuTrigger.Props): React.ReactElement {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      className={className}
      data-slot="context-menu-sub-trigger"
      {...props}
    />
  );
}

export interface ContextMenuSubTriggerGroupProps
  extends
    ContextMenuPrimitive.SubmenuTrigger.Props,
    VariantProps<typeof contextMenuItemVariants> {}

export function ContextMenuSubTriggerGroup({
  children,
  className,
  variant,
  ...props
}: ContextMenuSubTriggerGroupProps): React.ReactElement {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      className={cn(contextMenuItemVariants({ variant, className }))}
      data-slot="context-menu-sub-trigger-group"
      {...props}
    >
      {children}
      <Icons.ChevronRight className="ml-auto size-4" />
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

export function ContextMenuSeparator({
  className,
  ...props
}: ContextMenuPrimitive.Separator.Props): React.ReactElement {
  return (
    <ContextMenuPrimitive.Separator
      className={cn("pointer-events-none my-1 h-px bg-border", className)}
      data-slot="context-menu-separator"
      {...props}
    />
  );
}

export interface ContextMenuLabelProps
  extends ContextMenuPrimitive.GroupLabel.Props {
  inset?: boolean;
}

export function ContextMenuLabel({
  className,
  inset,
  ...props
}: ContextMenuLabelProps): React.ReactElement {
  return (
    <ContextMenuPrimitive.GroupLabel
      className={cn(
        "px-3.5 py-1.5 font-medium text-muted-foreground text-xs",
        "select-none data-inset:pl-8",
        className
      )}
      data-inset={inset}
      data-slot="context-menu-label"
      {...props}
    />
  );
}

export function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactElement {
  return (
    <span
      className={cn(
        "ml-auto text-muted-foreground text-xs tracking-widest",
        className
      )}
      data-slot="context-menu-shortcut"
      {...props}
    />
  );
}

export { ContextMenuPrimitive };
