import { httpRouter } from "convex/server";
import { auth } from "./auth";

console.log("=== HTTP Router Debug Start ===");
const http = httpRouter();

console.log("Adding auth routes...");
try {
  auth.addHttpRoutes(http);
  console.log("Auth routes added successfully");
} catch (error) {
  console.error("Error adding auth routes:", error);
  throw error;
}

console.log("=== HTTP Router Debug End ===");
export default http;
