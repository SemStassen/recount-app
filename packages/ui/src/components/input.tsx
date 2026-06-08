import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "#utils/cn";

export const inputControlVariants = cva([], {
  variants: {
    unstyled: {
      false: [
        "inline-flex w-full rounded-lg border border-input bg-background text-base text-foreground",
        "ring-ring/24 transition-colors",
        "has-focus-visible:border-ring has-focus-visible:ring-[3px]",
        "has-aria-invalid:border-destructive/36 has-focus-visible:has-aria-invalid:border-destructive/64 has-focus-visible:has-aria-invalid:ring-destructive/16 dark:has-aria-invalid:ring-destructive/24",
        "has-autofill:bg-foreground/4 dark:has-autofill:bg-foreground/8",
        "has-disabled:opacity-64",
        "sm:text-sm dark:bg-input/32",
      ],
      true: "",
    },
  },
  defaultVariants: {
    unstyled: false,
  },
});

export const inputVariants = cva(
  [
    "h-8.5 w-full min-w-0 rounded-[inherit] px-[calc(--spacing(3)-1px)] leading-8.5",
    "outline-none placeholder:text-muted-foreground/72",
    "[transition:background-color_5000000s_ease-in-out_0s]",
    "sm:h-7.5 sm:leading-7.5",
  ],
  {
    variants: {
      size: {
        default: "",
        lg: "h-9.5 leading-9.5 sm:h-8.5 sm:leading-8.5",
        sm: "h-7.5 px-[calc(--spacing(2.5)-1px)] leading-7.5 sm:h-6.5 sm:leading-6.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export type InputProps = Omit<InputPrimitive.Props, "size"> &
  VariantProps<typeof inputControlVariants> &
  VariantProps<typeof inputVariants> & {
    nativeInput?: boolean;
  };

export function Input({
  className,
  nativeInput = false,
  size,
  unstyled = false,
  ...props
}: InputProps): React.ReactElement {
  const { render: _render, style, ...nativeInputProps } = props;

  const inputClassName = cn(
    inputVariants({
      size: size,
    }),
    props.type === "file" &&
      "text-muted-foreground file:me-3 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
    props.type === "search" &&
      "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none"
  );

  return (
    <span
      className={cn(inputControlVariants({ className, unstyled }))}
      data-size={size}
      data-slot="input-control"
    >
      {nativeInput ? (
        <input
          className={inputClassName}
          data-slot="input"
          style={typeof style === "function" ? undefined : style}
          {...nativeInputProps}
        />
      ) : (
        <InputPrimitive
          className={inputClassName}
          data-slot="input"
          {...props}
        />
      )}
    </span>
  );
}

export { InputPrimitive };
