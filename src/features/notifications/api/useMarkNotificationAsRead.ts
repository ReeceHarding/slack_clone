import { useMutation as useReactQueryMutation } from "@tanstack/react-query";
import { useMutation as useConvexMutation } from "convex/react";

import { api } from "../../../../convex/_generated/api";

export const useMarkNotificationAsRead = () => {
  const mutation = useConvexMutation(api.notifications.markAsRead);

  const markAsRead = useReactQueryMutation({
    mutationFn: mutation,
  });

  return markAsRead;
}; 