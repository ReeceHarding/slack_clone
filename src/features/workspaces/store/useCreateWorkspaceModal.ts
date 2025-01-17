import { create } from "zustand";
import { useConvexAuth } from "convex/react";
import { useEffect } from "react";

interface CreateWorkspaceModalState {
  open: boolean;
  setOpen: (newOpen: boolean) => void;
}

export const useCreateWorkspaceModal = create<CreateWorkspaceModalState>()(
  (set) => ({
    open: false,
    setOpen: (newOpen) =>
      set(() => ({
        open: newOpen,
      })),
  })
);
