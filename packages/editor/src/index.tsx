import { Button } from "@recount/ui/button";
import { cn } from "@recount/ui/utils";
import { useEditor, EditorContext, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { useMemo } from "react";

import { BlockquoteExtension } from "./extensions/blockquote";
import { BoldExtension } from "./extensions/bold";
import { BulletListExtension } from "./extensions/bullet-list";
import { CodeExtension } from "./extensions/code";
import { CodeBlockExtension } from "./extensions/code-block";
import { DocumentExtension } from "./extensions/document";
import { DropcursorExtension } from "./extensions/dropcursor";
import { GapcursorExtension } from "./extensions/gapcursor";
import { HardBreakExtension } from "./extensions/hard-break";
import { HeadingExtension } from "./extensions/heading";
import { HorizontalRuleExtension } from "./extensions/horizontal-rule";
import { ItalicExtension } from "./extensions/italic";
import { LinkExtension } from "./extensions/link";
import { ListItemExtension } from "./extensions/list-item";
import { ListKeymapExtension } from "./extensions/list-keymap";
import { OrderedListExtension } from "./extensions/ordered-list";
import { ParagraphExtension } from "./extensions/paragraph";
import { StrikeExtension } from "./extensions/strike";
import { TextExtension } from "./extensions/text";
import { TrailingNodeExtension } from "./extensions/trailing-node";
import { UnderlineExtension } from "./extensions/underline";
import { UndoRedoExtension } from "./extensions/undo-redo";

interface RichTextEditorProps {
  content: JSONContent;
  onChange: (c: JSONContent) => void;
}

const extensions = [
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeExtension,
  CodeBlockExtension,
  DocumentExtension,
  DropcursorExtension,
  GapcursorExtension,
  HardBreakExtension,
  HeadingExtension,
  HorizontalRuleExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  ListKeymapExtension,
  OrderedListExtension,
  ParagraphExtension,
  StrikeExtension,
  TextExtension,
  TrailingNodeExtension,
  UnderlineExtension,
  UndoRedoExtension,
];

export type RichTextContent = JSONContent;
export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor: e }) => {
      const c = e.getJSON();
      onChange(c);
    },
  });

  // Memoize the provider value to avoid unnecessary re-renders
  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <EditorContext.Provider value={providerValue}>
      <EditorContent
        editor={editor}
        className={cn(
          "relative w-full rounded-lg min-h-12 border border-input bg-background not-dark:bg-clip-padding  text-base text-foreground shadow-xs/5 ring-ring/24 transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] has-focus-visible:has-aria-invalid:border-destructive/64 has-focus-visible:has-aria-invalid:ring-destructive/16 has-aria-invalid:border-destructive/36 has-focus-visible:border-ring has-autofill:bg-foreground/4 has-disabled:opacity-64 has-[:disabled,:focus-visible,[aria-invalid]]:shadow-none has-focus-visible:ring-[3px] sm:text-sm dark:bg-input/32 dark:has-autofill:bg-foreground/8 dark:has-aria-invalid:ring-destructive/24 dark:not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)]",
          "[&>.ProseMirror:focus]:outline-none"
        )}
      />
      <BubbleMenu editor={editor} className="bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </Button>
      </BubbleMenu>
    </EditorContext.Provider>
  );
}
