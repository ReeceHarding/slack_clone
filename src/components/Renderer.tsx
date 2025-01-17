import Quill from "quill";
import { useEffect, useRef, useState } from "react";

interface RendererProps {
  value: string;
}

const Renderer = ({ value }: RendererProps) => {
  const [isEmpty, setIsEmpty] = useState(false);
  const rendereRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rendereRef.current) return;

    const container = rendereRef.current;

    // Register the mention format
    const Inline = Quill.import('blots/inline') as any;
    
    class MentionBlot extends Inline {
      static blotName = 'mention';
      static tagName = 'span';
      
      static create(data: string) {
        const node = super.create();
        node.setAttribute('class', 'ql-mention');
        node.textContent = data;
        return node;
      }
      
      static formats(node: HTMLElement) {
        return node.textContent;
      }
    }
    
    Quill.register('formats/mention', MentionBlot);

    const quill = new Quill(document.createElement("div"), {
      theme: "snow",
      formats: ['bold', 'italic', 'strike', 'link', 'list', 'mention'],
    });

    quill.enable(false);

    const contents = JSON.parse(value);
    quill.setContents(contents);

    const isEmpty = quill.getText().replace("/s*/g", "").trim().length === 0;
    setIsEmpty(isEmpty);

    container.innerHTML = quill.root.innerHTML;

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [value]);

  if (isEmpty) return null;

  return <div ref={rendereRef} className="ql-editor ql-renderer" />;
};

export default Renderer;
