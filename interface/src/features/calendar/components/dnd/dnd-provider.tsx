import { DragDropProvider } from "@dnd-kit/react";
import type { PropsWithChildren } from "react";

export function DndProvider({ children }: PropsWithChildren) {
  return <DragDropProvider>{children}</DragDropProvider>;
}
