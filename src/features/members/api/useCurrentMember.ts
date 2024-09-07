import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetWorkspaceProps {
  workspaceId: Id<"workspaces">;
}

export const useCurrentMember = ({ workspaceId }: UseGetWorkspaceProps) => {
  const member = useQuery(api.members.current, { workspaceId });
  const isLoading = member === undefined;

  return {
    member,
    isLoading,
  };
};
