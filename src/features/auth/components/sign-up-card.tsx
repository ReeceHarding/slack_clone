import { useAuthActions } from "@convex-dev/auth/react";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SignInFlow } from "../types";

interface SignUpCardProps {
  setState: (state: SignInFlow) => void;
}

export const SignUpCard = ({ setState }: SignUpCardProps) => {
  const [signingUp, setSigningUp] = useState(false);
  const [error, setError] = useState("");
  const setUserName = useMutation(api.user.setUserName);
  const currentUser = useQuery(api.user.current);
  const { signIn } = useAuthActions();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Helper function to wait for user creation with timeout
  const waitForUser = async (timeoutMs = 10000): Promise<boolean> => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      // Check if user exists, has an ID, and has a name
      if (currentUser && currentUser._id && currentUser.name) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return false;
  };

  const handlePasswordSignUp = form.handleSubmit(
    async ({ name, email, password, confirmPassword }) => {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      
      setSigningUp(true);
      try {
        console.log("Starting signup process with:", { 
          hasName: !!name, 
          hasEmail: !!email 
        });
        
        // First, create the auth account with name in initialUser
        await signIn("password", { 
          email, 
          password, 
          flow: "signUp",
          options: {
            initialUser: {
              name
            }
          }
        });

        console.log("Auth signup successful, waiting for user creation...");

        // Wait for user to be created in Convex with name
        const userCreated = await waitForUser();
        if (!userCreated) {
          // If user creation times out, try setting the name directly
          console.log("User creation timed out, attempting to set name directly...");
          await setUserName({ name });
          
          // Check one more time if user exists with name
          const finalCheck = await waitForUser(5000);
          if (!finalCheck) {
            throw new Error("Failed to create user with name");
          }
        }

        console.log("User created successfully with name");
      } catch (err) {
        console.error("Sign up error:", err);
        let errorMessage = "Something went wrong!";
        
        if (err instanceof Error) {
          if (err.message.includes("Invalid password")) {
            errorMessage = "Password must be at least 8 characters long";
          } else if (err.message.includes("already exists")) {
            errorMessage = "An account with this email already exists";
          } else if (err.message.includes("Timeout")) {
            errorMessage = "Failed to create user account. Please try again.";
          } else {
            errorMessage = err.message;
          }
        }
        setError(errorMessage);
      } finally {
        setSigningUp(false);
      }
    }
  );

  const handleProviderSignUp = (value: "github" | "google") => async () => {
    console.log(`Starting ${value} sign up...`);
    setSigningUp(true);
    try {
      await signIn(value);
      console.log("Provider auth successful, waiting for user creation...");
      
      // Wait for user to be created with name from provider
      const userCreated = await waitForUser();
      if (!userCreated) {
        // If user creation times out, check if we have a user without a name
        if (currentUser && currentUser._id && !currentUser.name) {
          // Try to set a default name
          const defaultName = value === "google" ? "Google User" : "GitHub User";
          await setUserName({ name: defaultName });
          // Final check for user with name
          const finalCheck = await waitForUser(5000);
          if (!finalCheck) {
            throw new Error("Failed to set user name from provider");
          }
        }
        throw new Error("Failed to create user with provider");
      }
      
      console.log("Provider signup completed successfully");
    } catch (error) {
      console.error("Provider sign up error:", error);
      setError("Failed to sign up with provider. Please try again.");
    } finally {
      setSigningUp(false);
    }
  };

  return (
    <Card className="w-full h-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Sign up to continue</CardTitle>
        <CardDescription>
          Use your email or another service to continue
        </CardDescription>
      </CardHeader>
      {error && (
        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
          <TriangleAlert className="size-4" />
          <p>{error}</p>
        </div>
      )}
      <CardContent className="space-y-5 px-0 pb-0">
        <form className="space-y-2.5" onSubmit={handlePasswordSignUp}>
          <Input
            {...form.register("name", {
              required: true,
            })}
            disabled={signingUp}
            placeholder="Full name"
          />
          <Input
            {...form.register("email", {
              required: true,
            })}
            disabled={signingUp}
            placeholder="Email"
            type="email"
          />
          <Input
            {...form.register("password", {
              required: true,
            })}
            disabled={signingUp}
            placeholder="Password"
            type="password"
          />
          <Input
            {...form.register("confirmPassword", {
              required: true,
            })}
            disabled={signingUp}
            placeholder="Confirm password"
            type="password"
          />
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={signingUp}
          >
            Continue
          </Button>
        </form>
        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <Button
            disabled={signingUp}
            onClick={() => {
              console.log("Google button clicked");
              handleProviderSignUp("google")();
            }}
            variant="outline"
            size="lg"
            className="w-full relative"
          >
            <FcGoogle className="size-5 absolute top-3 left-2.5" />
            Continue with Google
          </Button>
          <Button
            disabled={signingUp}
            onClick={handleProviderSignUp("github")}
            variant="outline"
            size="lg"
            className="w-full relative"
          >
            <FaGithub className="size-5 absolute top-3 left-2.5" />
            Continue with Github
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <span
            className="text-sky-700 hover:underline cursor-pointer"
            onClick={() => setState("signIn")}
          >
            Sign in
          </span>
        </p>
      </CardContent>
    </Card>
  );
};
