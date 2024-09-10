import { useParentMessageId } from "@/features/messages/store/useParentMessageid";

export const usePanel = () => {
  const [parentMessageId, setParentMessageId] = useParentMessageId();

  const openMessage = (messageId: string) => {
    setParentMessageId(messageId);
  };

  const closeMessage = () => {
    setParentMessageId(null);
  };

  return {
    parentMessageId,
    openMessage,
    closeMessage,
  };
};
