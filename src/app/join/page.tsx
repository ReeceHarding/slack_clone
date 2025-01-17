"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const JoinPage = () => {
  const router = useRouter();
  const [workspaceId, setWorkspaceId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workspaceId) {
      toast.error("Please enter a workspace ID");
      return;
    }

    router.push(`/join/${workspaceId}`);
  };

  return (
    <div className="h-full flex flex-col gap-y-8 items-center justify-center bg-white p-8 rounded-lg shadow-sm">
      <Image src="/logo.svg" width={60} height={60} alt="Logo" />
      <div className="flex flex-col gap-y-4 items-center justify-center max-w-md">
        <div className="flex flex-col gap-y-2 items-center justify-center">
          <h1 className="text-2xl font-bold">Join a Workspace</h1>
          <p className="text-md text-muted-foreground">
            Enter the workspace ID to join. You can find this in the invite link shared with you.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-4 w-full">
          <Input
            placeholder="Workspace ID"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
          />
          <Button type="submit" size="lg">
            Continue
          </Button>
        </form>
      </div>
      <div className="flex gap-x-4">
        <Button size="lg" variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default JoinPage; 