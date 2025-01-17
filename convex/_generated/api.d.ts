/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as auth from "../auth.js";
import type * as channels from "../channels.js";
import type * as channels from "../channels.js";
import type * as conversations from "../conversations.js";
import type * as conversations from "../conversations.js";
import type * as embeddings from "../embeddings.js";
import type * as embeddings from "../embeddings.js";
import type * as http from "../http.js";
import type * as http from "../http.js";
import type * as members from "../members.js";
import type * as members from "../members.js";
import type * as messages from "../messages.js";
import type * as messages from "../messages.js";
import type * as reactions from "../reactions.js";
import type * as reactions from "../reactions.js";
import type * as setup from "../setup.js";
import type * as setup from "../setup.js";
import type * as upload from "../upload.js";
import type * as upload from "../upload.js";
import type * as user from "../user.js";
import type * as user from "../user.js";
import type * as workspaces from "../workspaces.js";
import type * as workspaces from "../workspaces.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  auth: typeof auth;
  channels: typeof channels;
  channels: typeof channels;
  conversations: typeof conversations;
  conversations: typeof conversations;
  embeddings: typeof embeddings;
  embeddings: typeof embeddings;
  http: typeof http;
  http: typeof http;
  members: typeof members;
  members: typeof members;
  messages: typeof messages;
  messages: typeof messages;
  reactions: typeof reactions;
  reactions: typeof reactions;
  setup: typeof setup;
  setup: typeof setup;
  upload: typeof upload;
  upload: typeof upload;
  user: typeof user;
  user: typeof user;
  workspaces: typeof workspaces;
  workspaces: typeof workspaces;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
