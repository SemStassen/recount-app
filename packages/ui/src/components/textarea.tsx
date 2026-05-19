import { mergeProps } from "@base-ui/react/merge-props";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "#utils/cn";

import { FieldPrimitive } from "./old/field.coss";

export const textareaVariants = cva(
  [
    "field-sizing-content min-h-17.5 w-full border px-3 py-1.5 text-base text-foreground",
    "outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-64",
  ],
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "border-input bg-background",
        ghost: "border-transparent bg-transparent",
      },
    },
  }
);

export interface TextareaProps
  extends
    React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {}

export function Textarea({
  ref,
  className,
  variant,
  ...props
}: TextareaProps): React.ReactElement {
  return (
    <FieldPrimitive.Control
      ref={ref}
      value={props.value}
      defaultValue={props.defaultValue}
      disabled={props.disabled}
      id={props.id}
      name={props.name}
      render={(defaultProps: React.ComponentProps<"textarea">) => (
        <textarea
          data-slot="textarea"
          className={cn(textareaVariants({ variant, className }))}
          {...mergeProps(defaultProps, props)}
        />
      )}
    />
  );
}
