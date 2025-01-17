import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";

interface UseGetWorkspaceByJoinCodeProps {
  joinCode: string;
}

export const useGetWorkspaceByJoinCode = ({ joinCode }: UseGetWorkspaceByJoinCodeProps) => {
  const data = useQuery(api.workspaces.getByJoinCode, { joinCode });
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}; 