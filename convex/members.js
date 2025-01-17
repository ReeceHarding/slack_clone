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
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.get = exports.getById = exports.current = void 0;
var server_1 = require("@convex-dev/auth/server");
var values_1 = require("convex/values");
var server_2 = require("./_generated/server");
var populateUser = function (ctx, userId) {
    return ctx.db.get(userId);
};
exports.current = (0, server_2.query)({
    args: {
        workspaceId: values_1.v.id("workspaces"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, member;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (userId === null) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, ctx.db
                            .query("members")
                            .withIndex("by_workspace_id_user_id", function (q) {
                            return q.eq("workspaceId", args.workspaceId).eq("userId", userId);
                        })
                            .unique()];
                case 2:
                    member = _a.sent();
                    if (!member) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, member];
            }
        });
    }); },
});
exports.getById = (0, server_2.query)({
    args: {
        id: values_1.v.id("members"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, member, currentMember, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (!userId)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, ctx.db.get(args.id)];
                case 2:
                    member = _a.sent();
                    if (!member)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, ctx.db
                            .query("members")
                            .withIndex("by_workspace_id_user_id", function (q) {
                            return q.eq("workspaceId", member.workspaceId).eq("userId", userId);
                        })
                            .unique()];
                case 3:
                    currentMember = _a.sent();
                    if (!currentMember)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, populateUser(ctx, member.userId)];
                case 4:
                    user = _a.sent();
                    if (!user)
                        return [2 /*return*/, null];
                    return [2 /*return*/, __assign(__assign({}, member), { user: user })];
            }
        });
    }); },
});
exports.get = (0, server_2.query)({
    args: {
        workspaceId: values_1.v.id("workspaces"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, member, data, members, _i, data_1, member_1, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (userId === null) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, ctx.db
                            .query("members")
                            .withIndex("by_workspace_id_user_id", function (q) {
                            return q.eq("workspaceId", args.workspaceId).eq("userId", userId);
                        })
                            .unique()];
                case 2:
                    member = _a.sent();
                    if (!member) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, ctx.db
                            .query("members")
                            .withIndex("by_workspace_id", function (q) {
                            return q.eq("workspaceId", args.workspaceId);
                        })
                            .collect()];
                case 3:
                    data = _a.sent();
                    members = [];
                    _i = 0, data_1 = data;
                    _a.label = 4;
                case 4:
                    if (!(_i < data_1.length)) return [3 /*break*/, 7];
                    member_1 = data_1[_i];
                    return [4 /*yield*/, populateUser(ctx, member_1.userId)];
                case 5:
                    user = _a.sent();
                    if (user) {
                        members.push(__assign(__assign({}, member_1), { user: user }));
                    }
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7: return [2 /*return*/, members];
            }
        });
    }); },
});
exports.update = (0, server_2.mutation)({
    args: {
        id: values_1.v.id("members"),
        role: values_1.v.union(values_1.v.literal("admin"), values_1.v.literal("member")),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, member, currentMember;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (userId === null) {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, ctx.db.get(args.id)];
                case 2:
                    member = _a.sent();
                    if (!member) {
                        throw new Error("Member not found");
                    }
                    return [4 /*yield*/, ctx.db
                            .query("members")
                            .withIndex("by_workspace_id_user_id", function (q) {
                            return q.eq("workspaceId", member.workspaceId).eq("userId", userId);
                        })
                            .unique()];
                case 3:
                    currentMember = _a.sent();
                    if (!currentMember || currentMember.role !== "admin") {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, ctx.db.patch(args.id, {
                            role: args.role,
                        })];
                case 4:
                    _a.sent();
                    return [2 /*return*/, args.id];
            }
        });
    }); },
});
exports.remove = (0, server_2.mutation)({
    args: {
        id: values_1.v.id("members"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, member, currentMember, _a, messages, reactions, conversations, _i, messages_1, message, _b, reactions_1, reaction, _c, conversations_1, conversation;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, (0, server_1.getAuthUserId)(ctx)];
                case 1:
                    userId = _d.sent();
                    if (userId === null) {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, ctx.db.get(args.id)];
                case 2:
                    member = _d.sent();
                    if (!member) {
                        throw new Error("Member not found");
                    }
                    return [4 /*yield*/, ctx.db
                            .query("members")
                            .withIndex("by_workspace_id_user_id", function (q) {
                            return q.eq("workspaceId", member.workspaceId).eq("userId", member.userId);
                        })
                            .unique()];
                case 3:
                    currentMember = _d.sent();
                    if (!currentMember) {
                        throw new Error("Unauthorized");
                    }
                    if (member.role === "admin") {
                        throw new Error("Admin cannot be removed");
                    }
                    if (currentMember._id === args.id && currentMember.role === "admin") {
                        throw new Error("Cannot remove yourself if you are an admin");
                    }
                    return [4 /*yield*/, Promise.all([
                            ctx.db
                                .query("messages")
                                .withIndex("by_member_id", function (q) { return q.eq("memberId", member._id); })
                                .collect(),
                            ctx.db
                                .query("reactions")
                                .withIndex("by_member_id", function (q) { return q.eq("memberId", member._id); })
                                .collect(),
                            ctx.db
                                .query("conversations")
                                .filter(function (q) {
                                return q.or(q.eq(q.field("memberOneId"), member._id), q.eq(q.field("memberTwoId"), member._id));
                            })
                                .collect(),
                        ])];
                case 4:
                    _a = _d.sent(), messages = _a[0], reactions = _a[1], conversations = _a[2];
                    _i = 0, messages_1 = messages;
                    _d.label = 5;
                case 5:
                    if (!(_i < messages_1.length)) return [3 /*break*/, 8];
                    message = messages_1[_i];
                    return [4 /*yield*/, ctx.db.delete(message._id)];
                case 6:
                    _d.sent();
                    _d.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    _b = 0, reactions_1 = reactions;
                    _d.label = 9;
                case 9:
                    if (!(_b < reactions_1.length)) return [3 /*break*/, 12];
                    reaction = reactions_1[_b];
                    return [4 /*yield*/, ctx.db.delete(reaction._id)];
                case 10:
                    _d.sent();
                    _d.label = 11;
                case 11:
                    _b++;
                    return [3 /*break*/, 9];
                case 12:
                    _c = 0, conversations_1 = conversations;
                    _d.label = 13;
                case 13:
                    if (!(_c < conversations_1.length)) return [3 /*break*/, 16];
                    conversation = conversations_1[_c];
                    return [4 /*yield*/, ctx.db.delete(conversation._id)];
                case 14:
                    _d.sent();
                    _d.label = 15;
                case 15:
                    _c++;
                    return [3 /*break*/, 13];
                case 16: return [4 /*yield*/, ctx.db.delete(args.id)];
                case 17:
                    _d.sent();
                    return [2 /*return*/, args.id];
            }
        });
    }); },
});
