import { AlertTriangle, Loader, XIcon } from "lucide-react";
import { useState } from "react";

import { Message } from "@/components/Message";
import { Button } from "@/components/ui/button";
import { useCurrentMember } from "@/features/members/api/useCurrentMember";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { Id } from "../../../../convex/_generated/dataModel";
import { useGetMessage } from "../api/useGetMessage";

interface ThreadProps {
  messageId: Id<"messages">;
  onClose: () => void;
}

export const Thread = ({ messageId, onClose }: ThreadProps) => {
  const getMessage = useGetMessage({ id: messageId });
  const workspaceId = useWorkspaceId();
  const currentMember = useCurrentMember({ workspaceId });

  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

  if (getMessage.isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center h-[49px] px-4 border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button onClick={onClose} size="iconSm" variant="ghost">
            <XIcon className="size-5 stroke-[1.5] " />
          </Button>
        </div>
        <div className="flex h-full items-center justify-center">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!getMessage.data) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center h-[49px] px-4 border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button onClick={onClose} size="iconSm" variant="ghost">
            <XIcon className="size-5 stroke-[1.5] " />
          </Button>
        </div>
        <div className="flex flex-col gap-y-2 h-full items-center justify-center">
          <AlertTriangle className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Message not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center h-[49px] px-4 border-b">
        <p className="text-lg font-bold">Thread</p>
        <Button onClick={onClose} size="iconSm" variant="ghost">
          <XIcon className="size-5 stroke-[1.5] " />
        </Button>
      </div>
      <div>
        <Message
          id={getMessage.data._id}
          memberId={getMessage.data.memberId}
          authorImage={getMessage.data.user.image}
          authorName={getMessage.data.user.name}
          reactions={getMessage.data.reactions}
          body={getMessage.data.body}
          image={getMessage.data.image}
          updatedAt={getMessage.data.updatedAt}
          createdAt={getMessage.data._creationTime}
          isEditing={editingId === getMessage.data._id}
          setEditingId={setEditingId}
          hideThreadButton
          isAuthor={currentMember.member?._id === getMessage.data.memberId}
        />
      </div>
    </div>
  );
};
