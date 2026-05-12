import { Button } from "@recount/ui/button";
import { textareaVariants } from "@recount/ui/textarea";
import { cn } from "@recount/ui/utils";
import { Placeholder } from "@tiptap/extensions";
import { useEditor, EditorContext, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { VariantProps } from "class-variance-authority";
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

import styles from "./index.module.css";

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
export interface RichTextEditorProps
  extends
    Omit<React.ComponentProps<"div">, "content">,
    VariantProps<typeof textareaVariants> {
  content: JSONContent;
  onChange: (c: JSONContent) => void;
  placeholder: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder,
  variant,
  className,
  ...props
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      ...extensions,
      Placeholder.configure({
        placeholder,
      }),
    ],
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
        className={cn(
          textareaVariants({ variant, className }),
          styles.root,
          "p-0"
        )}
        editor={editor}
        {...props}
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
