import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useGetNotifications } from "../api/useGetNotifications";
import { useMarkNotificationAsRead } from "../api/useMarkNotificationAsRead";
import { formatDistanceToNow } from "date-fns";
import { Doc } from "../../../../convex/_generated/dataModel";

export const NotificationsPopover = () => {
  const router = useRouter();
  const { data: notifications, isLoading } = useGetNotifications();
  const markAsRead = useMarkNotificationAsRead();

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  const handleNotificationClick = async (notification: Doc<"notifications">) => {
    try {
      // Mark as read
      await markAsRead.mutateAsync({ notificationId: notification._id });

      // Navigate to the message
      if (notification.channelId) {
        router.push(
          `/workspace/${notification.workspaceId}/channel/${notification.channelId}?messageId=${notification.messageId}`
        );
      } else if (notification.conversationId) {
        router.push(
          `/workspace/${notification.workspaceId}/conversation/${notification.conversationId}?messageId=${notification.messageId}`
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark notification as read");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:text-white hover:bg-white/10"
        >
          <Bell className="size-5 stroke-[1.5]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 size-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : !notifications?.length ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification._id}
              className="p-4 cursor-pointer"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex flex-col gap-1">
                <div className="text-sm">
                  You were mentioned in a message
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(notification.createdAt, {
                    addSuffix: true,
                  })}
                </div>
                {!notification.isRead && (
                  <div className="absolute top-2 right-2 size-2 bg-red-500 rounded-full" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 