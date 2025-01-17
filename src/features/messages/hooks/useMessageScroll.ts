import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function useMessageScroll() {
  const searchParams = useSearchParams();
  const messageId = searchParams.get("messageId");

  useEffect(() => {
    if (messageId) {
      const messageElement = document.getElementById(`message-${messageId}`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
        messageElement.classList.add("bg-yellow-100");
        setTimeout(() => {
          messageElement.classList.remove("bg-yellow-100");
        }, 3000);
      }
    }
  }, [messageId]);
} 