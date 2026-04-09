import { cn } from "@recount/ui/utils";
import { useEditor, Tiptap } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

interface RichTextEditorProps {
  content: JSONContent;
  onChange: (c: JSONContent) => void;
}

export type RichTextContent = JSONContent;
export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor: e }) => {
      const c = e.getJSON();
      onChange(c);
    },
  });

  return (
    <Tiptap editor={editor}>
      <Tiptap.Content
        className={cn(
          "relative w-full rounded-lg border border-input bg-background not-dark:bg-clip-padding  text-base text-foreground shadow-xs/5 ring-ring/24 transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] has-focus-visible:has-aria-invalid:border-destructive/64 has-focus-visible:has-aria-invalid:ring-destructive/16 has-aria-invalid:border-destructive/36 has-focus-visible:border-ring has-autofill:bg-foreground/4 has-disabled:opacity-64 has-[:disabled,:focus-visible,[aria-invalid]]:shadow-none has-focus-visible:ring-[3px] sm:text-sm dark:bg-input/32 dark:has-autofill:bg-foreground/8 dark:has-aria-invalid:ring-destructive/24 dark:not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)]",
          "[&>.ProseMirror:focus]:outline-none"
        )}
      />
    </Tiptap>
  );
}
