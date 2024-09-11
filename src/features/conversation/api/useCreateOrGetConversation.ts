import { useMutation as useReactQueryMutation } from "@tanstack/react-query";
import { useMutation as useConvexMutation } from "convex/react";

import { api } from "../../../../convex/_generated/api";

export const useCreateOrGetConversation = () => {
  const mutation = useConvexMutation(api.conversations.createOrGet);

  const createOrGetConversation = useReactQueryMutation({
    mutationFn: mutation,
  });

  return createOrGetConversation;
};
