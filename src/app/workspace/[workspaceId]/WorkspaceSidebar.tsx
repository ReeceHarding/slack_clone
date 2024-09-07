import { AlertTriangle, Loader } from "lucide-react";

import { useCurrentMember } from "@/features/members/api/useCurrentMember";
import { useGetWorkspace } from "@/features/workspaces/api/useGetWorkspace";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { WorkspaceHeader } from "./WorkspaceHeader";

export const WorkspaceSidebar = () => {
  const workspaceId = useWorkspaceId();
  const { isLoading: isLoadingMember, member } = useCurrentMember({
    workspaceId,
  });
  const { isLoading: isLoadingWorkspace, workspace } = useGetWorkspace({
    id: workspaceId,
  });

  if (isLoadingMember || isLoadingWorkspace) {
    return (
      <div className="flex flex-col bg-[#5E2C5F] h-full items-center justify-center">
        <Loader className="size-5 text-white animate-spin" />
      </div>
    );
  }

  if (!workspace || !member) {
    return (
      <div className="flex flex-col gap-y-2 bg-[#5E2C5F] h-full items-center justify-center">
        <AlertTriangle className="size-5 text-white" />
        <p className="text-white text-sm">Workspace not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-2 bg-[#5E2C5F] h-full">
      <WorkspaceHeader
        workspace={workspace}
        isAdmin={member.role === "admin"}
      />
    </div>
  );
};
