import { useDraggable } from "@dnd-kit/react";

type DraggableTimeEntryProps = {
  id: string;
  children: React.ReactNode;
};

export function DraggableTimeEntry({ id, children }: DraggableTimeEntryProps) {
  const { ref } = useDraggable({
    id: id,
  });

  return <div ref={ref}>{children}</div>;
}
