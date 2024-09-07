"use client";

import { useGetWorkspace } from "@/features/workspaces/api/useGetWorkspace";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";

const WorkspaceIdPage = () => {
  const workspaceId = useWorkspaceId();

  const { isLoading, workspace } = useGetWorkspace({ id: workspaceId });

  return <div>Data: {JSON.stringify(workspace, null, 2)}</div>;
};

export default WorkspaceIdPage;
