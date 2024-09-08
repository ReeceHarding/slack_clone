"use client";

import { useGetChannel } from "@/features/channels/api/useGetChannel";
import { useChannelId } from "@/hooks/useChannelId";
import { AlertTriangle, Loader } from "lucide-react";
import { Header } from "./Header";

const ChannelPage = () => {
  const channeld = useChannelId();

  const getChannel = useGetChannel({ id: channeld });

  if (getChannel.isLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <Loader className="animate-spin size-5 text-muted-foreground" />
      </div>
    );
  }

  if (!getChannel.data) {
    return (
      <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
        <AlertTriangle className="size-5 text-muted-foreground" />
        <span className="text-muted-foreground text-sm">Channel not found</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title={getChannel.data.name} />
    </div>
  );
};

export default ChannelPage;
