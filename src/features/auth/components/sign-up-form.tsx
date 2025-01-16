"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../../convex/_generated/api";
import { useAuthLogger } from "../../../utils/auth-logger";

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

export const SignUpForm = () => {
  const { register, handleSubmit } = useForm<SignUpFormData>();
  const { signIn } = useAuthActions();
  const createUser = useMutation(api.user.create);
  const [error, setError] = useState("");
  const logger = useAuthLogger();

  const onSubmit = async (data: SignUpFormData) => {
    try {
      // Validate password length
      if (data.password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }

      // First sign up with auth provider
      await signIn("password", {
        email: data.email,
        password: data.password,
        flow: "signUp",
        options: {
          initialUser: {
            name: data.name
          }
        }
      });

      // Create user record with name and email
      await createUser({
        name: data.name,
        email: data.email,
      });

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      console.error("Sign up error:", err);
      let errorMessage = "Something went wrong";
      
      if (err instanceof Error) {
        if (err.message.includes("Invalid password")) {
          errorMessage = "Password must be at least 8 characters long";
        } else if (err.message.includes("already exists")) {
          errorMessage = "An account with this email already exists";
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          {...register("name", { required: true })}
          type="text"
          placeholder="Name"
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <input
          {...register("email", { 
            required: true,
            pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i 
          })}
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <input
          {...register("password", { 
            required: true,
            minLength: 8
          })}
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
        />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Sign Up
      </button>
    </form>
  );
}; 