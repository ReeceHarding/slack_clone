import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

const handler = convexAuthNextjsMiddleware();

export const GET = handler;
export const POST = handler; 