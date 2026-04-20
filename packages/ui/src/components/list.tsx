import { mergeProps, useRender } from "@base-ui/react";
import type * as React from "react";

import { cn } from "#utils/cn";

import { Icons } from "./icons";

export function List({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div className="min-h-0 min-w-0 h-full w-full">
      <div
        className={cn(
          "grid relative gap-y-0 content-start h-full grid-rows-[auto_1fr]",
          className
        )}
        data-slot="list-container"
        {...props}
      />
    </div>
  );
}

export function ListHeader({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn("grid grid-cols-subgrid col-span-full h-8", className)}
      data-slot="list-header"
      {...props}
    />
  );
}

interface ListHeadProps extends React.ComponentProps<"div"> {
  isSorted: "asc" | "desc" | false;
  canSort: boolean;
}

export function ListHead({
  children,
  className,
  isSorted,
  canSort,
  ...props
}: ListHeadProps): React.ReactElement {
  return (
    <div
      className={cn(
        "flex flex-row items-center gap-2",
        canSort && "cursor-pointer",
        className
      )}
      data-slot="list-head"
      {...props}
    >
      {children}
      {isSorted && (
        <span className="shrink-0 text-muted-foreground/60">
          {isSorted === "asc" && <Icons.ChevronUp className="size-3.5" />}
          {isSorted === "desc" && <Icons.ChevronDown className="size-3.5" />}
        </span>
      )}
    </div>
  );
}

export function ListBody({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn(
        "relative grid grid-cols-subgrid col-span-full min-h-0 overflow-y-scroll",
        className
      )}
      data-slot="list-body"
      {...props}
    />
  );
}

interface ListRowProps extends useRender.ComponentProps<"div"> {}
export function ListRow({
  className,
  render,
  ...props
}: ListRowProps): React.ReactElement {
  const defaultProps = {
    className: cn(
      "grid grid-cols-subgrid w-full min-w-0 relative will-change-transform col-span-full hover:bg-accent",
      className
    ),
    "data-slot": "list-row",
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export function ListCell({
  className,
  children,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div className={cn("inline-flex min-w-0", className)} data-slot="list-cell">
      <div className={cn("flex items-center", className)} {...props}>
        {children}
      </div>
    </div>
  );
}

export function ListFooter({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div className={cn("", className)} data-slot="list-footer" {...props} />
  );
}
