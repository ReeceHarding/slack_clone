import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

import { DataModel } from "./_generated/dataModel";

console.log("=== Auth Configuration Debug Start ===");
console.log("Environment variables:");
console.log("- SITE_URL:", process.env.SITE_URL);
console.log("- AUTH_GOOGLE_ID:", process.env.AUTH_GOOGLE_ID);
console.log("- AUTH_GITHUB_ID:", process.env.AUTH_GITHUB_ID);
console.log("- CONVEX_AUTH_PRIVATE_KEY exists:", !!process.env.CONVEX_AUTH_PRIVATE_KEY);

const CustomPassword = Password<DataModel>({
  profile(params) {
    console.log("=== Password Profile Debug ===");
    console.log("Flow:", params.flow);
    console.log("Email:", params.email);
    console.log("Name:", params.name);
    console.log("Password provided:", !!params.password);
    console.log("All params:", JSON.stringify(params, null, 2));
    
    try {
      const profile = {
        email: params.email as string,
        name: params.name as string,
      };
      console.log("Generated profile:", JSON.stringify(profile, null, 2));
      return profile;
    } catch (error) {
      console.error("Error in profile generation:", error);
      throw error;
    }
  },
});

console.log("Initializing auth providers...");
const authConfig = convexAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    CustomPassword,
  ],
});
console.log("Auth providers initialized successfully");
console.log("=== Auth Configuration Debug End ===");

export const { auth, signIn, signOut, store } = authConfig;
