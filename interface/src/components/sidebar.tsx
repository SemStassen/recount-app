import { Button } from "@recount/ui/button";
import type { ButtonProps } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import { cn } from "@recount/ui/utils";
import { AnimatePresence, motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { createContext, use } from "react";
import type { ComponentProps } from "react";

interface SidebarContextValue {
  close: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebarContext() {
  const context = use(SidebarContext);

  if (!context) {
    throw new Error(`useSidebarContext must be used inside Sidebar`);
  }

  return context;
}

export interface SidebarProps extends HTMLMotionProps<"aside"> {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  width: number;
  side?: "left" | "right";
}

export function Sidebar({
  children,
  open,
  onOpenChange,
  width,
  side = "left",
  className,
  ...props
}: SidebarProps) {
  const close = () => onOpenChange?.(false);

  return (
    <SidebarContext
      value={{
        close,
      }}
    >
      <AnimatePresence initial={false}>
        {open && (
          <motion.aside
            animate={{ width }}
            className={cn(
              "relative h-full max-w-full shrink-0 overflow-hidden",
              side === "left" ? "border-r" : "border-l",
              className
            )}
            exit={{ width: 0 }}
            initial={{ width: 0 }}
            transition={{ ease: "linear", duration: 0.1 }}
            {...props}
          >
            <motion.div
              animate={{ x: 0, opacity: 1 }}
              className="flex h-full w-full flex-col"
              exit={{ x: side === "left" ? -width : width, opacity: 0 }}
              initial={{ x: side === "left" ? -width : width, opacity: 0 }}
              transition={{ ease: "linear", duration: 0.1 }}
            >
              {children}
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </SidebarContext>
  );
}

export interface SidebarContentProps extends ComponentProps<"div"> {}

export function SidebarContent({
  children,
  className,
  ...props
}: SidebarContentProps) {
  return (
    <div
      className={cn("flex min-h-0 w-full flex-1 flex-col", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface SidebarHeaderProps extends ComponentProps<"header"> {}

export function SidebarHeader({
  className,
  children,
  ...props
}: SidebarHeaderProps) {
  return (
    <header className={cn("flex w-full shrink-0", className)} {...props}>
      {children}
    </header>
  );
}

export interface SidebarCloseProps extends ButtonProps {}

export function SidebarClose({ className, ...props }: SidebarCloseProps) {
  const { close } = useSidebarContext();

  return (
    <Button
      className={className}
      onClick={close}
      size="icon"
      variant="ghost"
      {...props}
    >
      <Icons.X size={16} />
    </Button>
  );
}
