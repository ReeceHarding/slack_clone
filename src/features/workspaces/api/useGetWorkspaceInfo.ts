import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetWorkspaceInfoProps {
  id: Id<"workspaces">;
}

export const useGetWorkspaceInfo = ({ id }: UseGetWorkspaceInfoProps) => {
  const workspaceInfo = useQuery(api.workspaces.getInfoById, { id });
  const isLoading = workspaceInfo === undefined;

  return {
    workspaceInfo,
    isLoading,
  };
};
