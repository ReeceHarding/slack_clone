"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useConvexAuth } from "convex/react";

import { UserButton } from "@/features/auth/components/user-button";
import { useGetWorkspaces } from "@/features/workspaces/api/useGetWorkspaces";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/useCreateWorkspaceModal";
import { Loader } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { open, setOpen } = useCreateWorkspaceModal();
  
  // Only fetch workspaces if authenticated
  const { isLoading: isWorkspacesLoading, data: workspaces } = useGetWorkspaces();

  const workspaceId = useMemo(() => workspaces?.[0]?._id, [workspaces]);
  
  useEffect(() => {
    // 1. Wait for auth to load
    if (isAuthLoading) return;

    // 2. If not authenticated, redirect to auth and ensure modal is closed
    if (!isAuthenticated) {
      setOpen(false); // Ensure modal is closed
      router.replace("/auth");
      return;
    }

    // 3. Only proceed with workspace logic if authenticated
    if (isWorkspacesLoading) return;

    if (workspaceId) {
      router.replace(`/workspace/${workspaceId}`);
    } else if (!open) {
      setOpen(true);
    }
  }, [
    workspaceId, 
    isWorkspacesLoading, 
    open, 
    setOpen, 
    router, 
    isAuthenticated, 
    isAuthLoading
  ]);

  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If not authenticated, render nothing (middleware will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <UserButton />
    </div>
  );
}
