import dayjs, { Dayjs } from "dayjs";
import dynamic from "next/dynamic";

import { Doc, Id } from "../../convex/_generated/dataModel";
import { Hint } from "./Hint";
import { Thumbnail } from "./Thumbnail";
import { Toolbar } from "./Toolbar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Renderer = dynamic(() => import("@/components/Renderer"), { ssr: false });

interface MessageProps {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;
  body: Doc<"messages">["body"];
  image?: string | null;
  createdAt: Doc<"messages">["_creationTime"];
  updatedAt: Doc<"messages">["updatedAt"];
  isEditing: boolean;
  isCompact?: boolean;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadTimestamp?: number;
  setEditingId: (id: Id<"messages"> | null) => void;
}

const formatFullTime = (date: Dayjs) => {
  if (date.isToday()) return "Today";
  else if (date.isYesterday()) return "Yesterday";
  return date.format("MMM D, YYYY") + " at " + date.format("h:mm:ss a");
};

export const Message = ({
  body,
  createdAt,
  id,
  isEditing,
  memberId,
  reactions,
  updatedAt,
  authorImage,
  authorName = "Member",
  hideThreadButton,
  image,
  isCompact,
  threadCount,
  threadImage,
  threadTimestamp,
  isAuthor,
  setEditingId,
}: MessageProps) => {
  if (isCompact) {
    return (
      <div className="flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative">
        <div className="flex items-start gap-2">
          <Hint label={formatFullTime(dayjs(createdAt))}>
            <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
              {dayjs(createdAt).format("hh:mm")}
            </button>
          </Hint>
          <div className="flex flex-col w-full">
            <Renderer value={body} />
            <Thumbnail url={image} />
            {updatedAt ? (
              <span className="text-xs text-muted-foreground">(edited)</span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative">
      <div className="flex items-start gap-2">
        <button>
          <Avatar>
            <AvatarImage src={authorImage} />
            <AvatarFallback>
              {authorName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
        <div className="flex flex-col w-full overflow-hidden">
          <div className="text-sm">
            <button
              className="font-bold text-primary hover:underline"
              onClick={() => null}
            >
              {authorName}
            </button>
            <span>&nbsp;&nbsp;</span>
            <Hint label={formatFullTime(dayjs(createdAt))}>
              <button className="text-xs text-muted-foreground hover:underline">
                {dayjs(createdAt).format("h:mm a")}
              </button>
            </Hint>
          </div>
          <Renderer value={body} />
          <Thumbnail url={image} />
          {updatedAt ? (
            <span className="text-xs text-muted-foreground">(edited)</span>
          ) : null}
        </div>
      </div>
      {!isEditing && (
        <Toolbar
          isAuthor={isAuthor}
          isPending={false}
          hideThreadButton={false}
          onEdit={() => setEditingId(id)}
          onThread={() => null}
          onDelete={() => null}
          onReaction={() => null}
        />
      )}
    </div>
  );
};
