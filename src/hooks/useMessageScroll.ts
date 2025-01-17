import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export const useMessageScroll = () => {
  const searchParams = useSearchParams();
  const messageId = searchParams.get("messageId");
  const hasScrolled = useRef(false);

  useEffect(() => {
    if (messageId && !hasScrolled.current) {
      const messageElement = document.getElementById(`message-${messageId}`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
        messageElement.classList.add("bg-yellow-100/50");
        setTimeout(() => {
          messageElement.classList.remove("bg-yellow-100/50");
        }, 3000);
        hasScrolled.current = true;
      }
    }
  }, [messageId]);

  return {
    messageId,
  };
}; 