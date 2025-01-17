import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/features/auth/api/useCurrentUser";

export const useGetNotifications = () => {
  const { data: user } = useCurrentUser();
  const data = useQuery(api.notifications.get, user ? { userId: user._id } : "skip");
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}; 