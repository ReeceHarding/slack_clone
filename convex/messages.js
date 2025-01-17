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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.getById = exports.get = exports.remove = exports.update = void 0;
var server_1 = require("@convex-dev/auth/server");
var server_2 = require("convex/server");
var values_1 = require("convex/values");
var server_3 = require("./_generated/server");
var api_1 = require("./_generated/api");
var populateThread = function (ctx, messageId) { return __awaiter(void 0, void 0, void 0, function () {
    var messages, lastMessage, lastMessageMember, lastMessageUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.db
                    .query("messages")
                    .withIndex("by_parent_message_id", function (q) {
                    return q.eq("parentMessageId", messageId);
                })
                    .collect()];
            case 1:
                messages = _a.sent();
                if (messages.length === 0) {
                    return [2 /*return*/, {
                            count: 0,
                            image: undefined,
                            timestamp: 0,
                            name: "",
                        }];
                }
                lastMessage = messages.at(-1);
                return [4 /*yield*/, populateMember(ctx, lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.memberId)];
            case 2:
                lastMessageMember = _a.sent();
                if (!lastMessageMember) {
                    return [2 /*return*/, {
                            count: messages.length,
                            image: undefined,
                            timestamp: 0,
                            name: "",
                        }];
                }
                return [4 /*yield*/, populateUser(ctx, lastMessageMember.userId)];
            case 3:
                lastMessageUser = _a.sent();
                return [2 /*return*/, {
                        count: messages.length,
                        image: lastMessageUser === null || lastMessageUser === void 0 ? void 0 : lastMessageUser.image,
                        timeStamp: lastMessage._creationTime,
                        name: lastMessageUser === null || lastMessageUser === void 0 ? void 0 : lastMessageUser.name,
                    }];
        }
    });
}); };
var populateReactions = function (ctx, messageId) {
    return ctx.db
        .query("reactions")
        .withIndex("by_message_id", function (q) { return q.eq("messageId", messageId); })
        .collect();
};
var populateUser = function (ctx, userId) {
    return ctx.db.get(userId);
};
var populateMember = function (ctx, memberId) {
    return ctx.db.get(memberId);
};
var getMember = function (ctx, workspaceId, userId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, ctx.db
                .query("members")
                .withIndex("by_workspace_id_user_id", function (q) {
                return q.eq("workspaceId", workspaceId).eq("userId", userId);
            })
                .unique()];
    });
}); };
exports.update = (0, server_3.mutation)({
    args: {
        id: values_1.v.id("messages"),
        body: values_1.v.string(),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, message, member;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (!userId) {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, ctx.db.get(args.id)];
                case 2:
                    message = _a.sent();
                    if (!message) {
                        throw new Error("Message not found");
                    }
                    return [4 /*yield*/, getMember(ctx, message.workspaceId, userId)];
                case 3:
                    member = _a.sent();
                    if (!member || member._id !== message.memberId) {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, ctx.db.patch(args.id, {
                            body: args.body,
                            updatedAt: Date.now(),
                        })];
                case 4:
                    _a.sent();
                    return [2 /*return*/, args.id];
            }
        });
    }); },
});
exports.remove = (0, server_3.mutation)({
    args: {
        id: values_1.v.id("messages"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, message, member;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (!userId) {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, ctx.db.get(args.id)];
                case 2:
                    message = _a.sent();
                    if (!message) {
                        throw new Error("Message not found");
                    }
                    return [4 /*yield*/, getMember(ctx, message.workspaceId, userId)];
                case 3:
                    member = _a.sent();
                    if (!member || member._id !== message.memberId) {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, ctx.db.delete(args.id)];
                case 4:
                    _a.sent();
                    return [2 /*return*/, args.id];
            }
        });
    }); },
});
exports.get = (0, server_3.query)({
    args: {
        channelId: values_1.v.optional(values_1.v.id("channels")),
        conversationId: values_1.v.optional(values_1.v.id("conversations")),
        parentMessageId: values_1.v.optional(values_1.v.id("messages")),
        paginationOpts: server_2.paginationOptsValidator,
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, _conversationId, parentMessage, result, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _c.sent();
                    if (!userId) {
                        throw new Error("Unauthorized");
                    }
                    _conversationId = args.conversationId;
                    if (!(!args.conversationId && !args.channelId && args.parentMessageId)) return [3 /*break*/, 3];
                    return [4 /*yield*/, ctx.db.get(args.parentMessageId)];
                case 2:
                    parentMessage = _c.sent();
                    if (!parentMessage) {
                        throw new Error("Parent message not found");
                    }
                    _conversationId = parentMessage.conversationId;
                    _c.label = 3;
                case 3: return [4 /*yield*/, ctx.db
                        .query("messages")
                        .withIndex("by_channel_id_parent_message_id_conversation_id", function (q) {
                        return q
                            .eq("channelId", args.channelId)
                            .eq("parentMessageId", args.parentMessageId)
                            .eq("conversationId", _conversationId);
                    })
                        .order("desc")
                        .paginate(args.paginationOpts)];
                case 4:
                    result = _c.sent();
                    _a = [__assign({}, result)];
                    _b = {};
                    return [4 /*yield*/, Promise.all(result.page.map(function (message) { return __awaiter(void 0, void 0, void 0, function () {
                            var member, user, _a, reactions, thread, image, _b, reactionsWithCounts, dedupedReactions, reactionsWithoutMemberId;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0: return [4 /*yield*/, populateMember(ctx, message.memberId)];
                                    case 1:
                                        member = _c.sent();
                                        if (!member) return [3 /*break*/, 3];
                                        return [4 /*yield*/, populateUser(ctx, member.userId)];
                                    case 2:
                                        _a = _c.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        _a = null;
                                        _c.label = 4;
                                    case 4:
                                        user = _a;
                                        if (!member || !user) {
                                            return [2 /*return*/, null];
                                        }
                                        return [4 /*yield*/, populateReactions(ctx, message._id)];
                                    case 5:
                                        reactions = _c.sent();
                                        return [4 /*yield*/, populateThread(ctx, message._id)];
                                    case 6:
                                        thread = _c.sent();
                                        if (!message.image) return [3 /*break*/, 8];
                                        return [4 /*yield*/, ctx.storage.getUrl(message.image)];
                                    case 7:
                                        _b = _c.sent();
                                        return [3 /*break*/, 9];
                                    case 8:
                                        _b = undefined;
                                        _c.label = 9;
                                    case 9:
                                        image = _b;
                                        reactionsWithCounts = reactions.map(function (reaction) {
                                            return __assign(__assign({}, reaction), { count: reactions.filter(function (r) { return r.value === reaction.value; })
                                                    .length });
                                        });
                                        dedupedReactions = reactionsWithCounts.reduce(function (acc, reaction) {
                                            var existingReaction = acc.find(function (r) { return r.value === reaction.value; });
                                            if (existingReaction) {
                                                existingReaction.memberIds = Array.from(new Set(__spreadArray(__spreadArray([], existingReaction.memberIds, true), [reaction.memberId], false)));
                                            }
                                            else {
                                                acc.push(__assign(__assign({}, reaction), { memberIds: [reaction.memberId] }));
                                            }
                                            return acc;
                                        }, []);
                                        reactionsWithoutMemberId = dedupedReactions.map(function (_a) {
                                            var memberId = _a.memberId, rest = __rest(_a, ["memberId"]);
                                            return rest;
                                        });
                                        return [2 /*return*/, __assign(__assign({}, message), { image: image, member: member, user: user, reactions: reactionsWithoutMemberId, threadCount: thread.count, threadImage: thread.image, threadTimestamp: thread.timeStamp, threadName: thread.name })];
                                }
                            });
                        }); }))];
                case 5: return [2 /*return*/, __assign.apply(void 0, _a.concat([(_b.page = (_c.sent()).filter(function (message) { return message !== null; }), _b)]))];
            }
        });
    }); },
});
exports.getById = (0, server_3.query)({
    args: {
        id: values_1.v.id("messages"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, message, currentMember, member, user, reactions, reactionsWithCounts, dedupedReactions, reactionsWithoutMemberId, _a, _b;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _d.sent();
                    if (!userId) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, ctx.db.get(args.id)];
                case 2:
                    message = _d.sent();
                    if (!message)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, getMember(ctx, message.workspaceId, userId)];
                case 3:
                    currentMember = _d.sent();
                    if (!currentMember) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, populateMember(ctx, message.memberId)];
                case 4:
                    member = _d.sent();
                    if (!member)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, populateUser(ctx, member.userId)];
                case 5:
                    user = _d.sent();
                    if (!user)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, populateReactions(ctx, args.id)];
                case 6:
                    reactions = _d.sent();
                    reactionsWithCounts = reactions.map(function (reaction) {
                        return __assign(__assign({}, reaction), { count: reactions.filter(function (r) { return r.value === reaction.value; }).length });
                    });
                    dedupedReactions = reactionsWithCounts.reduce(function (acc, reaction) {
                        var existingReaction = acc.find(function (r) { return r.value === reaction.value; });
                        if (existingReaction) {
                            existingReaction.memberIds = Array.from(new Set(__spreadArray(__spreadArray([], existingReaction.memberIds, true), [reaction.memberId], false)));
                        }
                        else {
                            acc.push(__assign(__assign({}, reaction), { memberIds: [reaction.memberId] }));
                        }
                        return acc;
                    }, []);
                    reactionsWithoutMemberId = dedupedReactions.map(function (_a) {
                        var memberId = _a.memberId, rest = __rest(_a, ["memberId"]);
                        return rest;
                    });
                    _a = [__assign({}, message)];
                    _c = {};
                    if (!message.image) return [3 /*break*/, 8];
                    return [4 /*yield*/, ctx.storage.getUrl(message.image)];
                case 7:
                    _b = _d.sent();
                    return [3 /*break*/, 9];
                case 8:
                    _b = undefined;
                    _d.label = 9;
                case 9: return [2 /*return*/, __assign.apply(void 0, _a.concat([(_c.image = _b, _c.user = user, _c.member = member, _c.reactions = reactionsWithoutMemberId, _c)]))];
            }
        });
    }); },
});
exports.create = (0, server_3.mutation)({
    args: {
        body: values_1.v.string(),
        image: values_1.v.optional(values_1.v.id("_storage")),
        workspaceId: values_1.v.id("workspaces"),
        channelId: values_1.v.optional(values_1.v.id("channels")),
        conversationId: values_1.v.optional(values_1.v.id("conversations")),
        parentMessageId: values_1.v.optional(values_1.v.id("messages")),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, member, _conversationId, parentMessage, messageId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (!userId) {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, getMember(ctx, args.workspaceId, userId)];
                case 2:
                    member = _a.sent();
                    if (!member) {
                        throw new Error("Unauthorized");
                    }
                    _conversationId = args.conversationId;
                    if (!(!args.conversationId && !args.channelId && args.parentMessageId)) return [3 /*break*/, 4];
                    return [4 /*yield*/, ctx.db.get(args.parentMessageId)];
                case 3:
                    parentMessage = _a.sent();
                    if (!parentMessage) {
                        throw new Error("Parent message not found");
                    }
                    _conversationId = parentMessage.conversationId;
                    _a.label = 4;
                case 4: return [4 /*yield*/, ctx.db.insert("messages", {
                        memberId: member._id,
                        body: args.body,
                        image: args.image,
                        channelId: args.channelId,
                        workspaceId: args.workspaceId,
                        parentMessageId: args.parentMessageId,
                        conversationId: _conversationId,
                    })];
                case 5:
                    messageId = _a.sent();
                    // Trigger embedding creation
                    return [4 /*yield*/, ctx.scheduler.runAfter(0, api_1.api.embeddings.insertMessageToPinecone, {
                            messageId: messageId,
                            messageBody: args.body,
                            channelId: args.channelId,
                            conversationId: _conversationId,
                            workspaceId: args.workspaceId,
                        })];
                case 6:
                    // Trigger embedding creation
                    _a.sent();
                    return [2 /*return*/, messageId];
            }
        });
    }); },
});
