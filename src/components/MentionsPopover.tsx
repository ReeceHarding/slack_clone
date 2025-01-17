import { useSearchMembers } from "@/features/members/api/useSearchMembers";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { cn } from "@/lib/utils";
import { CSSProperties, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface MentionsPopoverProps {
  isOpen: boolean;
  query: string;
  onSelect: (username: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const MentionsPopover = ({
  isOpen,
  query,
  onSelect,
  className,
  style
}: MentionsPopoverProps) => {
  const workspaceId = useWorkspaceId();
  const { data: members, isLoading } = useSearchMembers({ workspaceId, query });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !members?.length) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % members.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + members.length) % members.length);
          break;
        case "Enter":
          e.preventDefault();
          onSelect(members[selectedIndex].user.name);
          break;
        case "Escape":
          e.preventDefault();
          onSelect("");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, members, selectedIndex, onSelect]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[99998]" onClick={() => onSelect("")} />
      <div
        className={cn(
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[99999] min-w-[200px] max-w-[300px] max-h-[200px] bg-white rounded-md border border-gray-200 shadow-lg overflow-y-auto",
          className
        )}
        style={style}
      >
        {isLoading ? (
          <div className="p-2 text-sm text-gray-500">Loading...</div>
        ) : !members?.length ? (
          <div className="p-2 text-sm text-gray-500">No members found</div>
        ) : (
          <div className="py-1">
            {members.map((member, index) => (
              <button
                key={member._id}
                className={cn(
                  "w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-100/80 transition-colors",
                  selectedIndex === index && "bg-gray-100"
                )}
                onClick={() => onSelect(member.user.name)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <Avatar className="size-6 shrink-0">
                  <AvatarImage src={member.user.image} />
                  <AvatarFallback>
                    {member.user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm truncate">{member.user.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}; 