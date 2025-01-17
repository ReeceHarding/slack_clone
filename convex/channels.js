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
exports.remove = exports.update = exports.getById = exports.create = exports.get = void 0;
var values_1 = require("convex/values");
var server_1 = require("./_generated/server");
var server_2 = require("@convex-dev/auth/server");
exports.get = (0, server_1.query)({
    args: {
        workspaceId: values_1.v.id("workspaces"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, member, channels;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_2.getAuthUserId)(ctx)];
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
                            .query("channels")
                            .withIndex("by_workspace_id", function (q) {
                            return q.eq("workspaceId", args.workspaceId);
                        })
                            .collect()];
                case 3:
                    channels = _a.sent();
                    return [2 /*return*/, channels];
            }
        });
    }); },
});
exports.create = (0, server_1.mutation)({
    args: {
        name: values_1.v.string(),
        workspaceId: values_1.v.id("workspaces"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, member, parsedName, channelId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_2.getAuthUserId)(ctx)];
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
                    parsedName = args.name.replace(/\s+/g, "-").toLowerCase();
                    return [4 /*yield*/, ctx.db.insert("channels", {
                            name: parsedName,
                            workspaceId: args.workspaceId,
                        })];
                case 3:
                    channelId = _a.sent();
                    return [2 /*return*/, channelId];
            }
        });
    }); },
});
exports.getById = (0, server_1.query)({
    args: {
        id: values_1.v.id("channels"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, channel, member;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_2.getAuthUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (!userId) {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, ctx.db.get(args.id)];
                case 2:
                    channel = _a.sent();
                    if (!channel) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, ctx.db
                            .query("members")
                            .withIndex("by_workspace_id_user_id", function (q) {
                            return q.eq("workspaceId", channel.workspaceId).eq("userId", userId);
                        })
                            .unique()];
                case 3:
                    member = _a.sent();
                    if (!member) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, channel];
            }
        });
    }); },
});
exports.update = (0, server_1.mutation)({
    args: {
        id: values_1.v.id("channels"),
        name: values_1.v.string(),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, channel, member, parsedName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_2.getAuthUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (!userId) {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, ctx.db.get(args.id)];
                case 2:
                    channel = _a.sent();
                    if (!channel) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, ctx.db
                            .query("members")
                            .withIndex("by_workspace_id_user_id", function (q) {
                            return q.eq("workspaceId", channel.workspaceId).eq("userId", userId);
                        })
                            .unique()];
                case 3:
                    member = _a.sent();
                    if (!member || member.role !== "admin") {
                        throw new Error("Unauthorized");
                    }
                    parsedName = args.name.replace(/\s+/g, "-").toLowerCase();
                    return [4 /*yield*/, ctx.db.patch(args.id, {
                            name: parsedName,
                        })];
                case 4:
                    _a.sent();
                    return [2 /*return*/, args.id];
            }
        });
    }); },
});
exports.remove = (0, server_1.mutation)({
    args: {
        id: values_1.v.id("channels"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, channel, member, messages, _i, messages_1, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_2.getAuthUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (!userId) {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, ctx.db.get(args.id)];
                case 2:
                    channel = _a.sent();
                    if (!channel) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, ctx.db
                            .query("members")
                            .withIndex("by_workspace_id_user_id", function (q) {
                            return q.eq("workspaceId", channel.workspaceId).eq("userId", userId);
                        })
                            .unique()];
                case 3:
                    member = _a.sent();
                    if (!member || member.role !== "admin") {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, Promise.all([
                            ctx.db
                                .query("messages")
                                .withIndex("by_channel_id", function (q) { return q.eq("channelId", args.id); })
                                .collect(),
                        ])];
                case 4:
                    messages = (_a.sent())[0];
                    _i = 0, messages_1 = messages;
                    _a.label = 5;
                case 5:
                    if (!(_i < messages_1.length)) return [3 /*break*/, 8];
                    message = messages_1[_i];
                    return [4 /*yield*/, ctx.db.delete(message._id)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8: return [4 /*yield*/, ctx.db.delete(args.id)];
                case 9:
                    _a.sent();
                    return [2 /*return*/, args.id];
            }
        });
    }); },
});
