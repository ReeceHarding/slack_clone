"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("convex/server");
var server_2 = require("@convex-dev/auth/server");
var values_1 = require("convex/values");
var schema = (0, server_1.defineSchema)(__assign(__assign({}, server_2.authTables), { workspaces: (0, server_1.defineTable)({
        name: values_1.v.string(),
        userId: values_1.v.id("users"),
        joinCode: values_1.v.string(),
    }), members: (0, server_1.defineTable)({
        userId: values_1.v.id("users"),
        workspaceId: values_1.v.id("workspaces"),
        role: values_1.v.union(values_1.v.literal("admin"), values_1.v.literal("member")),
    })
        .index("by_user_id", ["userId"])
        .index("by_workspace_id", ["workspaceId"])
        .index("by_workspace_id_user_id", ["workspaceId", "userId"]), channels: (0, server_1.defineTable)({
        name: values_1.v.string(),
        workspaceId: values_1.v.id("workspaces"),
    }).index("by_workspace_id", ["workspaceId"]), conversations: (0, server_1.defineTable)({
        workspaceId: values_1.v.id("workspaces"),
        memberOneId: values_1.v.id("members"),
        memberTwoId: values_1.v.id("members"),
    }).index("by_workspace_id", ["workspaceId"]), messages: (0, server_1.defineTable)({
        body: values_1.v.string(),
        image: values_1.v.optional(values_1.v.id("_storage")),
        memberId: values_1.v.id("members"),
        workspaceId: values_1.v.id("workspaces"),
        channelId: values_1.v.optional(values_1.v.id("channels")),
        parentMessageId: values_1.v.optional(values_1.v.id("messages")),
        conversationId: values_1.v.optional(values_1.v.id("conversations")),
        updatedAt: values_1.v.optional(values_1.v.number()),
    })
        .index("by_workspace_id", ["workspaceId"])
        .index("by_member_id", ["memberId"])
        .index("by_channel_id", ["channelId"])
        .index("by_conversation_id", ["conversationId"])
        .index("by_parent_message_id", ["parentMessageId"])
        .index("by_channel_id_parent_message_id_conversation_id", [
        "channelId",
        "parentMessageId",
        "conversationId",
    ]), reactions: (0, server_1.defineTable)({
        workspaceId: values_1.v.id("workspaces"),
        messageId: values_1.v.id("messages"),
        memberId: values_1.v.id("members"),
        value: values_1.v.string(),
    })
        .index("by_workspace_id", ["workspaceId"])
        .index("by_message_id", ["messageId"])
        .index("by_member_id", ["memberId"]) }));
exports.default = schema;
