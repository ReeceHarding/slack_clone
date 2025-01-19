import { QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Batch load users by IDs
export async function batchLoadUsers(
  ctx: QueryCtx,
  userIds: Id<"users">[]
): Promise<Map<Id<"users">, Doc<"users">>> {
  const uniqueIds = Array.from(new Set(userIds));
  const users = await Promise.all(
    uniqueIds.map((id) => ctx.db.get(id))
  );
  
  return new Map(
    users
      .filter((user): user is Doc<"users"> => user !== null)
      .map(user => [user._id, user])
  );
}

// Batch load members by workspace
export async function batchLoadMembers(
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  userIds: Id<"users">[]
): Promise<Map<Id<"users">, Doc<"members">>> {
  if (userIds.length === 0) return new Map();
  
  const members = await ctx.db
    .query("members")
    .withIndex("by_workspace_id_user_id", (q) =>
      q.eq("workspaceId", workspaceId)
    )
    .filter((q) => 
      userIds.length === 1 
        ? q.eq(q.field("userId"), userIds[0])
        : q.or(...userIds.map(userId => q.eq(q.field("userId"), userId)))
    )
    .collect();

  return new Map(
    members.map(member => [member.userId, member])
  );
}

// Batch load reactions by message IDs
export async function batchLoadReactions(
  ctx: QueryCtx,
  messageIds: Id<"messages">[]
): Promise<Map<Id<"messages">, Doc<"reactions">[]>> {
  if (messageIds.length === 0) return new Map();
  
  const reactions = await ctx.db
    .query("reactions")
    .withIndex("by_message_id")
    .filter((q) => 
      messageIds.length === 1
        ? q.eq(q.field("messageId"), messageIds[0])
        : q.or(...messageIds.map(msgId => q.eq(q.field("messageId"), msgId)))
    )
    .collect();

  const reactionsByMessage = new Map<Id<"messages">, Doc<"reactions">[]>();
  
  for (const reaction of reactions) {
    const existing = reactionsByMessage.get(reaction.messageId) || [];
    existing.push(reaction);
    reactionsByMessage.set(reaction.messageId, existing);
  }

  return reactionsByMessage;
}

// Process reactions with counts and deduplication
export function processReactions(reactions: Doc<"reactions">[]) {
  const reactionsWithCounts = reactions.map((reaction) => ({
    ...reaction,
    count: reactions.filter((r) => r.value === reaction.value).length,
  }));

  const dedupedReactions = reactionsWithCounts.reduce(
    (acc, reaction) => {
      const existingReaction = acc.find((r) => r.value === reaction.value);

      if (existingReaction) {
        existingReaction.memberIds = Array.from(
          new Set([...existingReaction.memberIds, reaction.memberId])
        );
      } else {
        acc.push({ ...reaction, memberIds: [reaction.memberId] });
      }
      return acc;
    },
    [] as (Doc<"reactions"> & {
      count: number;
      memberIds: Id<"members">[];
    })[]
  );

  return dedupedReactions.map(({ memberId, ...rest }) => rest);
}

// Get cursor-based pagination parameters
export function getPaginationParams(cursor?: string, limit: number = 50) {
  return {
    cursor: cursor || null,
    limit,
    numItems: limit
  };
} 