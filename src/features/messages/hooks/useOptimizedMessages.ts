import { useCallback, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const MESSAGES_PER_PAGE = 50;

export function useOptimizedMessages({
  channelId,
  conversationId,
  parentMessageId,
}: {
  channelId?: Id<"channels">;
  conversationId?: Id<"conversations">;
  parentMessageId?: Id<"messages">;
}) {
  console.log("[useOptimizedMessages] Hook called with:", {
    channelId,
    conversationId,
    parentMessageId,
  });

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const result = useQuery(api.messages.get, {
    channelId,
    conversationId,
    parentMessageId,
    cursor,
    limit: MESSAGES_PER_PAGE,
  });

  useEffect(() => {
    console.log("[useOptimizedMessages] Query result:", {
      hasMessages: result?.page?.length ?? 0,
      isDone: result?.isDone,
      cursor: result?.continueCursor,
    });

    if (result) {
      setHasMore(!result.isDone);
    }
  }, [result]);

  const loadMore = useCallback(async () => {
    console.log("[useOptimizedMessages] loadMore called", {
      hasMore,
      isLoadingMore,
      currentCursor: cursor,
      nextCursor: result?.continueCursor,
    });

    if (!result || !hasMore || isLoadingMore) {
      console.log("[useOptimizedMessages] loadMore aborted", {
        hasResult: !!result,
        hasMore,
        isLoadingMore,
      });
      return;
    }

    setIsLoadingMore(true);
    try {
      console.log("[useOptimizedMessages] Setting new cursor:", result.continueCursor);
      setCursor(result.continueCursor);
    } finally {
      setIsLoadingMore(false);
    }
  }, [result, hasMore, isLoadingMore, cursor]);

  return {
    messages: result?.page ?? [],
    hasMore,
    isLoadingMore,
    loadMore,
  };
} 