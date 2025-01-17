// Top-level auth.ts with custom Password approach
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth, ConvexAuthConfig } from "@convex-dev/auth/server";
import { v } from "convex/values";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { DataModel } from "./_generated/dataModel";

/**
 * 1. Create a custom Password provider with a `profile` method that includes the user's name.
 * 2. Then pass that custom provider to `convexAuth()`.
 */

const CustomPassword = Password<DataModel>({
  profile(params) {
    // The shape of `params` is { email, password, name } for signUp flow
    return {
      email: params.email as string,
      name: params.name as string,
    };
  },
});

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    GitHub,
    Google,
    CustomPassword
  ],
} satisfies ConvexAuthConfig);

/**
 * The createUser mutation is called automatically during the signUp flow if
 * no user is found for the given tokenIdentifier. We expect the `name` field
 * to come in from the custom provider's `profile` method above.
 */
export const createUser = import("@convex-dev/auth/server").then(({ createUser }) => createUser);

export const addExtraUserFields = v.object({
  name: v.string(),
  email: v.string(),
  image: v.optional(v.string()),
});

export const storeUser = import("@convex-dev/auth/server").then(async (mod) => {
  // If you want to do something extra beyond createUser, you could
  // implement it here. For now, we rely on the built-in createUser logic.
  return mod.storeUser;
});