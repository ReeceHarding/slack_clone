import { ConvexHttpApi } from "@convex-dev/auth/next";
import { httpRouter } from "convex/server";

const http = httpRouter();

export const { GET, POST, HEAD } = ConvexHttpApi({
  router: http,
  path: "/api/auth",
}); 