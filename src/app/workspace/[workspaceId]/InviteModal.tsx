import { CopyIcon, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNewJoinCode } from "@/features/workspaces/api/useNewJoinCode";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { useConfirm } from "@/hooks/useConfirm";

interface InviteModalProps {
  open: boolean;
  joinCode: string;
  name: string;
  setOpen: (open: boolean) => void;
}

export const InviteModal = ({
  open,
  joinCode,
  name,
  setOpen,
}: InviteModalProps) => {
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "This will deactivate the current invite code and generate a new one"
  );

  const { mutateAsync, isPending } = useNewJoinCode();

  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/join/${workspace.joinCode}`;

    navigator.clipboard
      .writeText(inviteLink)
      .then(() => toast.success("Invite link copied to clipboard"));
  };

  const handleNewCode = async () => {
    const ok = await confirm();
    if (!ok) return;

    mutateAsync({ workspaceId })
      .then(() => {
        toast.success("Invite code regenerated");
      })
      .catch((error) => {
        console.error(error);
        toast.success("Failed to regenerate invite code");
      });
  };

  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite people to {name}</DialogTitle>
            <DialogDescription>
              Share either the code or the invite link with people you want to invite
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-6 items-center justify-center py-6">
            <div className="flex flex-col items-center gap-y-2 w-full">
              <p className="text-sm font-medium text-muted-foreground">Join Code</p>
              <div className="bg-muted w-full p-4 rounded-lg flex items-center justify-center">
                <p className="text-3xl font-mono tracking-[0.5em] font-bold uppercase">
                  {joinCode}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-y-2 w-full">
              <p className="text-sm font-medium text-muted-foreground">Invite Link</p>
              <div className="bg-muted w-full p-3 rounded-lg flex items-center justify-between gap-x-2">
                <code className="text-sm text-muted-foreground truncate">
                  {`${window.location.origin}/join/${workspaceId}`}
                </code>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="shrink-0">
                  <CopyIcon className="size-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <Button
              onClick={handleNewCode}
              variant="outline"
              disabled={isPending}
              className="gap-x-2"
            >
              Generate New Code
              <RefreshCcw className="size-4" />
            </Button>
            <DialogClose asChild>
              <Button>Done</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
