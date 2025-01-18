import "quill/dist/quill.snow.css";

import { ImageIcon, Smile, XIcon } from "lucide-react";
import Quill, { QuillOptions } from "quill";
import { Delta, Op } from "quill/core";
import { Blot } from "parchment";
import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MdSend } from "react-icons/md";
import { PiTextAa } from "react-icons/pi";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { EmojiPopover } from "./EmojiPopover";
import { Hint } from "./Hint";
import { Button } from "./ui/button";
import { MentionsPopover } from "./MentionsPopover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "./ui/dropdown-menu";

type EditorValue = {
  image: File | null;
  body: string;
};

interface MentionState {
  isActive: boolean;
  query: string;
  index: number | null;
}

interface EditorProps {
  variant?: "create" | "update";
  defaultValue?: Delta | Op[];
  disabled?: boolean;
  innerRef?: MutableRefObject<Quill | null>;
  placeholder?: string;
  onCancel?: () => void;
  onSubmit: ({ image, body }: EditorValue) => void;
}

const Editor = ({
  variant = "create",
  defaultValue = [],
  disabled = false,
  innerRef,
  placeholder = "Write something...",
  onCancel,
  onSubmit,
}: EditorProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [mentionState, setMentionState] = useState<MentionState>({
    isActive: false,
    query: "",
    index: null,
  });
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const onSubmitRef = useRef(onSubmit);
  const placeholderRef = useRef(placeholder);
  const quillRef = useRef<Quill | null>(null);
  const defaultValueRef = useRef(defaultValue);
  const disabledRef = useRef(disabled);
  const imageElementRef = useRef<HTMLInputElement>(null);

  const isEmpty = useMemo(
    () => !image && text.replace("/s*/g", "").trim().length === 0,
    [text, image]
  );

  useLayoutEffect(() => {
    onSubmitRef.current = onSubmit;
    placeholderRef.current = placeholder;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div")
    );

    // Register the mention format
    const Inline = Quill.import('blots/inline') as any;
    
    class MentionBlot extends Inline {
      static blotName = 'mention';
      static tagName = 'span';
      
      static create(data: string) {
        const node = super.create();
        node.setAttribute('class', 'ql-mention');
        node.setAttribute('data-mention', data);
        node.textContent = data;
        return node;
      }
      
      static formats(node: HTMLElement) {
        return node.getAttribute('data-mention');
      }
    }
    
    Quill.register('formats/mention', MentionBlot);

    // Add custom styles for mentions
    const style = document.createElement('style');
    style.innerHTML = `
      .ql-mention {
        background-color: rgba(29, 155, 209, 0.1);
        color: rgb(29, 155, 209);
        padding: 1px 4px;
        border-radius: 3px;
        font-weight: 500;
        cursor: default;
        user-select: all;
      }
    `;
    document.head.appendChild(style);

    const options: QuillOptions = {
      theme: "snow",
      placeholder: placeholderRef.current,
      formats: ['bold', 'italic', 'strike', 'link', 'list', 'mention'],
      modules: {
        toolbar: [
          ["bold", "italic", "strike"],
          ["link"],
          [
            {
              list: "ordered",
            },
            {
              list: "bullet",
            },
          ],
        ],
        keyboard: {
          bindings: {
            enter: {
              key: "Enter",
              handler: () => {
                if (mentionState.isActive) return true;

                const text = quill.getText();
                const addedImage = imageElementRef.current?.files?.[0] || null;
                const isEmpty =
                  !addedImage && text.replace("/s*/g", "").trim().length === 0;

                if (isEmpty) return true;

                const body = JSON.stringify(quill.getContents());

                onSubmitRef.current?.({ body, image: addedImage });
                return false;
              },
            },
            shift_enter: {
              key: "Enter",
              shiftKey: true,
              handler: () => {
                quill.insertText(quill.getSelection()?.index || 0, "\n");
                return false;
              },
            },
          },
        },
      },
    };

    const quill = new Quill(editorContainer, options);
    quillRef.current = quill;
    quillRef.current.focus();

    if (innerRef) {
      innerRef.current = quill;
    }

    quill.setContents(defaultValueRef.current);
    setText(quill.getText());

    quill.on(Quill.events.TEXT_CHANGE, () => {
      const text = quill.getText();
      setText(text);
      
      const selection = quill.getSelection();
      if (!selection) return;
      
      const cursorPosition = selection.index;
      const textBeforeCursor = text.slice(0, cursorPosition);
      
      // Check if we just typed @
      if (textBeforeCursor.endsWith("@")) {
        setMentionState({
          isActive: true,
          query: "",
          index: cursorPosition - 1
        });
        return;
      }
      
      // If mention is active, update the query
      if (mentionState.isActive && mentionState.index !== null) {
        // Get text from @ symbol to cursor
        const currentQuery = text.slice(mentionState.index + 1, cursorPosition);
        
        // If we've deleted the @ symbol, deactivate mentions
        if (text[mentionState.index] !== "@") {
          setMentionState({
            isActive: false,
            query: "",
            index: null
          });
          return;
        }

        // Check if we still have a valid mention pattern
        if (currentQuery.includes(" ")) {
          setMentionState({
            isActive: false,
            query: "",
            index: null
          });
          return;
        }

        // Update the query
        setMentionState(prev => ({
          ...prev,
          query: currentQuery
        }));
      }
    });

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      if (container) {
        container.innerHTML = "";
      }
      if (quillRef.current) {
        quillRef.current = null;
      }
      if (innerRef) {
        innerRef.current = null;
      }
    };
  }, [innerRef]);

  const handleToolbarToggle = () => {
    setIsToolbarVisible((current) => !current);
    const toolbarElement = containerRef.current?.querySelector(".ql-toolbar");
    if (toolbarElement) {
      toolbarElement.classList.toggle("hidden");
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const quill = quillRef.current;

    quill?.insertText(quill?.getSelection()?.index || 0, emoji);
  };

  const handleMentionSelect = (username: string) => {
    if (!quillRef.current || mentionState.index === null) return;
    
    // If empty username, just close the popover
    if (!username) {
      setMentionState({
        isActive: false,
        query: "",
        index: null
      });
      return;
    }

    const quill = quillRef.current;
    const currentPosition = quill.getSelection()?.index || 0;
    
    // Delete the typed @ and query
    quill.deleteText(mentionState.index, currentPosition - mentionState.index);
    
    // Insert the mention with @ symbol included
    const mentionText = '@' + username;
    quill.insertText(mentionState.index, mentionText, { mention: username });
    
    // Add a space after the mention
    quill.insertText(mentionState.index + mentionText.length, ' ');
    
    // Move cursor after the mention and space
    quill.setSelection(mentionState.index + mentionText.length + 1, 0);

    // Reset mention state
    setMentionState({
      isActive: false,
      query: "",
      index: null
    });
  };

  return (
    <div className="flex flex-col">
      <input
        type="file"
        accept="image/*"
        ref={imageElementRef}
        onChange={(event) => setImage(event.target.files![0])}
        className="hidden"
      />
      <div
        className={cn(
          "flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white relative",
          disabled && "opacity-50"
        )}
      >
        <div ref={containerRef} className="h-full ql-custom relative">
          <MentionsPopover
            isOpen={mentionState.isActive}
            query={mentionState.query}
            onSelect={handleMentionSelect}
          />
        </div>
        {!!image && (
          <div className="p-2">
            <div className="relative size-[62px] flex items-center justify-center group/image">
              <Hint label="Remove image">
                <button
                  onClick={() => {
                    setImage(null);
                    imageElementRef.current!.value = "";
                  }}
                  className="hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 text-white size-6 z-[4] border-2 border-white items-center justify-center"
                >
                  <XIcon className="size-3.5" />
                </button>
              </Hint>
              <Image
                src={URL.createObjectURL(image)}
                alt="Uploaded"
                fill
                className="rounded-xl overflow-hidden object-cover"
              />
            </div>
          </div>
        )}
        <div className="flex px-2 pb-2 z-[5]">
          <Hint
            label={isToolbarVisible ? "Hide formatting" : "Show formatting"}
          >
            <Button
              disabled={disabled}
              size="sm"
              variant="ghost"
              onClick={handleToolbarToggle}
            >
              <PiTextAa className="size-4" />
            </Button>
          </Hint>
          <EmojiPopover onEmojiSelect={handleEmojiSelect}>
            <Button disabled={disabled} size="sm" variant="ghost">
              <Smile className="size-4" />
            </Button>
          </EmojiPopover>
          {variant === "create" && (
            <Hint label="Image">
              <Button
                disabled={disabled}
                size="sm"
                variant="ghost"
                onClick={() => imageElementRef.current?.click()}
              >
                <ImageIcon className="size-4" />
              </Button>
            </Hint>
          )}
          {variant === "update" && (
            <div className="ml-auto flex items-center gap-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={disabled}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    image,
                  })
                }
                disabled={disabled || isEmpty}
                className="bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
              >
                Save
              </Button>
            </div>
          )}
          {variant === "create" && (
            <Button
              disabled={disabled || isEmpty}
              onClick={() =>
                onSubmit({
                  body: JSON.stringify(quillRef.current?.getContents()),
                  image,
                })
              }
              className={cn(
                "ml-auto",
                isEmpty
                  ? "bg-white hover:bg-white text-muted-foreground"
                  : "bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
              )}
              size="sm"
            >
              <MdSend className="size-4" />
            </Button>
          )}
        </div>
      </div>
      {variant === "create" && (
        <div
          className={cn(
            "p-2 text-[10px] text-muted-foreground flex justify-end opacity-0 transition",
            !isEmpty && "opacity-100"
          )}
        >
          <p>
            <strong>Shift + Return</strong> to add new line
          </p>
        </div>
      )}
    </div>
  );
};

export default Editor;
