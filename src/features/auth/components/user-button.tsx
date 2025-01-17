"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "../api/useCurrentUser";
import { Loader, LogOutIcon } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export const UserButton = () => {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <Loader className="size-4 animate-spin text-white" />;
  }

  if (!user) {
    return (
      <Button 
        variant="ghost" 
        className="text-white hover:text-white hover:bg-white/10"
        onClick={() => router.push("/auth")}
      >
        Sign in
      </Button>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative focus:ring-2 focus:ring-white/20 rounded-md">
        <Avatar className="rounded-md size-10 hover:opacity-90 transition border-2 border-transparent hover:border-white/20">
          <AvatarImage
            className="rounded-md"
            alt={user.name || "User"}
            src={user.image}
          />
          <AvatarFallback className="rounded-md bg-sky-500 text-white">
            {(user.name || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side="right" className="w-60">
        <DropdownMenuItem onClick={() => signOut()} className="h-10 cursor-pointer">
          <LogOutIcon className="size-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
