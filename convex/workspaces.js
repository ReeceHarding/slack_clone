"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.join = exports.newJoinCode = exports.remove = exports.update = exports.getById = exports.getInfoById = exports.get = exports.create = void 0;
var server_1 = require("@convex-dev/auth/server");
var values_1 = require("convex/values");
var server_2 = require("./_generated/server");
var generateCode = function () {
    var code = Array.from({ length: 6 }, function () { return "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]; }).join("");
    return code;
};
exports.create = (0, server_2.mutation)({
    args: {
        name: values_1.v.string(),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, joinCode, workspaceId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (!userId) {
                        throw new Error("Unauthorized");
                    }
                    joinCode = generateCode();
                    return [4 /*yield*/, ctx.db.insert("workspaces", {
                            name: args.name,
                            userId: userId,
                            joinCode: joinCode,
                        })];
                case 2:
                    workspaceId = _a.sent();
                    return [4 /*yield*/, ctx.db.insert("members", {
                            userId: userId,
                            workspaceId: workspaceId,
                            role: "admin",
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, ctx.db.insert("channels", {
                            name: "general",
                            workspaceId: workspaceId,
                        })];
                case 4:
                    _a.sent();
                    return [2 /*return*/, workspaceId];
            }
        });
    }); },
});
exports.get = (0, server_2.query)({
    args: {},
    handler: function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, members, workspaceIds, workspaces, _i, workspaceIds_1, workspaceId, workspace;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (!userId) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, ctx.db
                            .query("members")
                            .withIndex("by_user_id", function (q) { return q.eq("userId", userId); })
                            .collect()];
                case 2:
                    members = _a.sent();
                    workspaceIds = members.map(function (member) { return member.workspaceId; });
                    workspaces = [];
                    _i = 0, workspaceIds_1 = workspaceIds;
                    _a.label = 3;
                case 3:
                    if (!(_i < workspaceIds_1.length)) return [3 /*break*/, 6];
                    workspaceId = workspaceIds_1[_i];
                    return [4 /*yield*/, ctx.db.get(workspaceId)];
                case 4:
                    workspace = _a.sent();
                    if (workspace) {
                        workspaces.push(workspace);
                    }
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, workspaces];
            }
        });
    }); },
});
exports.getInfoById = (0, server_2.query)({
    args: {
        id: values_1.v.id("workspaces"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, member, workspace;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (!userId) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, ctx.db
                            .query("members")
                            .withIndex("by_workspace_id_user_id", function (q) {
                            return q.eq("workspaceId", args.id).eq("userId", userId);
                        })
                            .unique()];
                case 2:
                    member = _a.sent();
                    return [4 /*yield*/, ctx.db.get(args.id)];
                case 3:
                    workspace = _a.sent();
                    return [2 /*return*/, {
                            name: workspace === null || workspace === void 0 ? void 0 : workspace.name,
                            isMember: !!member,
                        }];
            }
        });
    }); },
});
exports.getById = (0, server_2.query)({
    args: {
        id: values_1.v.id("workspaces"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, member;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (!userId) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, ctx.db
                            .query("members")
                            .withIndex("by_workspace_id_user_id", function (q) {
                            return q.eq("workspaceId", args.id).eq("userId", userId);
                        })
                            .unique()];
                case 2:
                    member = _a.sent();
                    if (!member) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, ctx.db.get(args.id)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    }); },
});
exports.update = (0, server_2.mutation)({
    args: {
        id: values_1.v.id("workspaces"),
        name: values_1.v.string(),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, member;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (!userId) {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, ctx.db
                            .query("members")
                            .withIndex("by_workspace_id_user_id", function (q) {
                            return q.eq("workspaceId", args.id).eq("userId", userId);
                        })
                            .unique()];
                case 2:
                    member = _a.sent();
                    if (!member) {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, ctx.db.patch(args.id, {
                            name: args.name,
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, args.id];
            }
        });
    }); },
});
exports.remove = (0, server_2.mutation)({
    args: {
        id: values_1.v.id("workspaces"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, member, _a, members, channels, conversations, messages, reactions, _i, members_1, member_1, _b, channels_1, channel, _c, conversations_1, conversation, _d, messages_1, message, _e, reactions_1, reaction;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _f.sent();
                    if (!userId) {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, ctx.db
                            .query("members")
                            .withIndex("by_workspace_id_user_id", function (q) {
                            return q.eq("workspaceId", args.id).eq("userId", userId);
                        })
                            .unique()];
                case 2:
                    member = _f.sent();
                    if (!member) {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, ctx.db.delete(args.id)];
                case 3:
                    _f.sent();
                    return [4 /*yield*/, Promise.all([
                            ctx.db
                                .query("members")
                                .withIndex("by_workspace_id", function (q) { return q.eq("workspaceId", args.id); })
                                .collect(),
                            ctx.db
                                .query("channels")
                                .withIndex("by_workspace_id", function (q) { return q.eq("workspaceId", args.id); })
                                .collect(),
                            ctx.db
                                .query("conversations")
                                .withIndex("by_workspace_id", function (q) { return q.eq("workspaceId", args.id); })
                                .collect(),
                            ctx.db
                                .query("messages")
                                .withIndex("by_workspace_id", function (q) { return q.eq("workspaceId", args.id); })
                                .collect(),
                            ctx.db
                                .query("reactions")
                                .withIndex("by_workspace_id", function (q) { return q.eq("workspaceId", args.id); })
                                .collect(),
                        ])];
                case 4:
                    _a = _f.sent(), members = _a[0], channels = _a[1], conversations = _a[2], messages = _a[3], reactions = _a[4];
                    _i = 0, members_1 = members;
                    _f.label = 5;
                case 5:
                    if (!(_i < members_1.length)) return [3 /*break*/, 8];
                    member_1 = members_1[_i];
                    return [4 /*yield*/, ctx.db.delete(member_1._id)];
                case 6:
                    _f.sent();
                    _f.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    _b = 0, channels_1 = channels;
                    _f.label = 9;
                case 9:
                    if (!(_b < channels_1.length)) return [3 /*break*/, 12];
                    channel = channels_1[_b];
                    return [4 /*yield*/, ctx.db.delete(channel._id)];
                case 10:
                    _f.sent();
                    _f.label = 11;
                case 11:
                    _b++;
                    return [3 /*break*/, 9];
                case 12:
                    _c = 0, conversations_1 = conversations;
                    _f.label = 13;
                case 13:
                    if (!(_c < conversations_1.length)) return [3 /*break*/, 16];
                    conversation = conversations_1[_c];
                    return [4 /*yield*/, ctx.db.delete(conversation._id)];
                case 14:
                    _f.sent();
                    _f.label = 15;
                case 15:
                    _c++;
                    return [3 /*break*/, 13];
                case 16:
                    _d = 0, messages_1 = messages;
                    _f.label = 17;
                case 17:
                    if (!(_d < messages_1.length)) return [3 /*break*/, 20];
                    message = messages_1[_d];
                    return [4 /*yield*/, ctx.db.delete(message._id)];
                case 18:
                    _f.sent();
                    _f.label = 19;
                case 19:
                    _d++;
                    return [3 /*break*/, 17];
                case 20:
                    _e = 0, reactions_1 = reactions;
                    _f.label = 21;
                case 21:
                    if (!(_e < reactions_1.length)) return [3 /*break*/, 24];
                    reaction = reactions_1[_e];
                    return [4 /*yield*/, ctx.db.delete(reaction._id)];
                case 22:
                    _f.sent();
                    _f.label = 23;
                case 23:
                    _e++;
                    return [3 /*break*/, 21];
                case 24: return [2 /*return*/, args.id];
            }
        });
    }); },
});
exports.newJoinCode = (0, server_2.mutation)({
    args: {
        workspaceId: values_1.v.id("workspaces"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, member, joinCode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (!userId) {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, ctx.db
                            .query("members")
                            .withIndex("by_workspace_id_user_id", function (q) {
                            return q.eq("workspaceId", args.workspaceId).eq("userId", userId);
                        })
                            .unique()];
                case 2:
                    member = _a.sent();
                    if (!member || member.role !== "admin") {
                        throw new Error("Unauthorized");
                    }
                    joinCode = generateCode();
                    return [4 /*yield*/, ctx.db.patch(args.workspaceId, {
                            joinCode: joinCode,
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, args.workspaceId];
            }
        });
    }); },
});
exports.join = (0, server_2.mutation)({
    args: {
        joinCode: values_1.v.string(),
        workspaceId: values_1.v.id("workspaces"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, workspace, member;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (!userId) {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, ctx.db.get(args.workspaceId)];
                case 2:
                    workspace = _a.sent();
                    if (!workspace) {
                        throw new Error("Workspace not found");
                    }
                    if (workspace.joinCode !== args.joinCode.toLowerCase()) {
                        throw new Error("Invalid join code");
                    }
                    return [4 /*yield*/, ctx.db
                            .query("members")
                            .withIndex("by_workspace_id_user_id", function (q) {
                            return q.eq("workspaceId", args.workspaceId).eq("userId", userId);
                        })
                            .unique()];
                case 3:
                    member = _a.sent();
                    if (member) {
                        throw new Error("Already a member of this workspace");
                    }
                    return [4 /*yield*/, ctx.db.insert("members", {
                            userId: userId,
                            workspaceId: workspace._id,
                            role: "member",
                        })];
                case 4:
                    _a.sent();
                    return [2 /*return*/, workspace._id];
            }
        });
    }); },
});
