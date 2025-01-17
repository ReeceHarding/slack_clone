import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseSearchMembersProps {
  workspaceId: Id<"workspaces">;
  query: string;
}

export const useSearchMembers = ({ workspaceId, query }: UseSearchMembersProps) => {
  const data = useQuery(api.members.search, { workspaceId, query });
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}; 