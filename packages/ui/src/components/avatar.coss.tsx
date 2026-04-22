import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";

import { cn } from "#utils/cn";

const avatarVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center overflow-hidden align-middle font-medium text-xs",
  {
    defaultVariants: {
      size: "default",
      rounded: "full",
    },
    variants: {
      size: {
        default: "size-8",
      },
      rounded: {
        md: "rounded-md",
        full: "rounded-full",
      },
    },
  }
);

interface AvatarProps
  extends AvatarPrimitive.Root.Props, VariantProps<typeof avatarVariants> {}

export function Avatar({
  className,
  size,
  rounded,
  ...props
}: AvatarProps): React.ReactElement {
  return (
    <AvatarPrimitive.Root
      className={cn(avatarVariants({ className, size, rounded }))}
      data-slot="avatar"
      {...props}
    />
  );
}

export function AvatarImage({
  className,
  ...props
}: AvatarPrimitive.Image.Props): React.ReactElement {
  return (
    <AvatarPrimitive.Image
      className={cn("size-full object-cover", className)}
      data-slot="avatar-image"
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.Fallback.Props): React.ReactElement {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted",
        className
      )}
      data-slot="avatar-fallback"
      {...props}
    />
  );
}

export { AvatarPrimitive };
