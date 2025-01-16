# Convex Schema Documentation

## Overview
This document outlines the database schema for our Slack clone application. The schema is defined using Convex's schema definition system.

## Tables

### 1. Users
Stores user information
```typescript
users: defineTable({
  name: v.string(),        // User's full name
  email: v.string(),       // User's email address
  tokenIdentifier: v.string(), // Auth token identifier
}).index("by_token", ["tokenIdentifier"])
  .index("by_email", ["email"])
```

### 2. Workspaces
Represents Slack workspaces
```typescript
workspaces: defineTable({
  name: v.string(),        // Workspace name
  userId: v.id("users"),   // Creator/owner ID
  joinCode: v.string(),    // Invite code for workspace
})
```

### 3. Members
Manages workspace membership
```typescript
members: defineTable({
  userId: v.id("users"),
  workspaceId: v.id("workspaces"),
  role: v.union(v.literal("admin"), v.literal("member")),
}).index("by_user_id", ["userId"])
  .index("by_workspace_id", ["workspaceId"])
  .index("by_workspace_id_user_id", ["workspaceId", "userId"])
```

### 4. Channels
Represents channels within workspaces
```typescript
channels: defineTable({
  name: v.string(),
  workspaceId: v.id("workspaces"),
}).index("by_workspace_id", ["workspaceId"])
```

### 5. Conversations
Manages direct messages between members
```typescript
conversations: defineTable({
  workspaceId: v.id("workspaces"),
  memberOneId: v.id("members"),
  memberTwoId: v.id("members"),
}).index("by_workspace_id", ["workspaceId"])
```

### 6. Messages
Stores all messages (channel messages, direct messages, and thread replies)
```typescript
messages: defineTable({
  body: v.string(),                           // Message content
  image: v.optional(v.id("_storage")),        // Optional attached image
  memberId: v.id("members"),                  // Sender
  workspaceId: v.id("workspaces"),           // Workspace context
  channelId: v.optional(v.id("channels")),    // Channel (if channel message)
  parentMessageId: v.optional(v.id("messages")), // Parent message (if thread reply)
  conversationId: v.optional(v.id("conversations")), // Conversation (if DM)
  updatedAt: v.optional(v.number()),          // Last edit timestamp
}).index("by_workspace_id", ["workspaceId"])
  .index("by_member_id", ["memberId"])
  .index("by_channel_id", ["channelId"])
  .index("by_conversation_id", ["conversationId"])
  .index("by_parent_message_id", ["parentMessageId"])
  .index("by_channel_id_parent_message_id_conversation_id", [
    "channelId",
    "parentMessageId",
    "conversationId",
  ])
```

### 7. Reactions
Stores message reactions
```typescript
reactions: defineTable({
  workspaceId: v.id("workspaces"),
  messageId: v.id("messages"),
  memberId: v.id("members"),
  value: v.string(),                          // Reaction emoji/value
}).index("by_workspace_id", ["workspaceId"])
  .index("by_message_id", ["messageId"])
  .index("by_member_id", ["memberId"])
```

### 8. Auth Tables
The schema includes authentication tables from `@convex-dev/auth`:
- `authAccounts`
- `authRateLimits`
- `authRefreshTokens`
- `authSessions`
- `authVerificationCodes`
- `authVerifiers`

## Relationships

1. **Workspace → User**
   - One-to-many: A workspace has one creator (userId) but a user can create multiple workspaces

2. **Member → User & Workspace**
   - Many-to-many: Users can be members of multiple workspaces, and workspaces can have multiple members
   - Includes role information (admin/member)

3. **Channel → Workspace**
   - One-to-many: A workspace can have multiple channels

4. **Conversation → Members**
   - Many-to-many: Links two members in a direct message conversation

5. **Message → Various**
   - Links to member (sender)
   - Links to workspace (context)
   - Optional links to:
     - Channel (for channel messages)
     - Parent message (for thread replies)
     - Conversation (for direct messages)

6. **Reaction → Message & Member**
   - Many-to-many: Members can react to messages, messages can have multiple reactions

## Indexes

The schema includes several indexes for efficient querying:

1. **Users**
   - `by_token`: Quick lookup by auth token
   - `by_email`: Email lookup

2. **Members**
   - `by_user_id`: Find memberships by user
   - `by_workspace_id`: Find members of a workspace
   - `by_workspace_id_user_id`: Quick membership verification

3. **Channels**
   - `by_workspace_id`: Find channels in a workspace

4. **Messages**
   - Multiple indexes for efficient message retrieval in different contexts
   - Complex index for thread/conversation lookups

5. **Reactions**
   - Indexes for finding reactions by workspace, message, or member

## Notes

1. The schema uses Convex's built-in ID system for relationships
2. Optional fields are used where appropriate (e.g., message attachments)
3. Timestamps are stored as numbers (updatedAt)
4. Auth tables are managed by the auth package
5. Proper indexing is implemented for common query patterns
