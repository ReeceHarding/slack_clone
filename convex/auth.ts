import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      // Password provider will handle validation internally
      // and create the user document with the tokenIdentifier
    }),
  ],
});
