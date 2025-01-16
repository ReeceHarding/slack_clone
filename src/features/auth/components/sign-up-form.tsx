"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../../convex/_generated/api";

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

  const onSubmit = async (data: SignUpFormData) => {
    try {
      // First sign in with password auth
      await signIn("password", {
        email: data.email,
        password: data.password,
      });

      // Then create user profile
      await createUser({
        name: data.name,
        email: data.email,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          {...register("name")}
          type="text"
          placeholder="Name"
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <input
          {...register("password")}
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