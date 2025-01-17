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
exports.createOrGet = void 0;
var server_1 = require("@convex-dev/auth/server");
var values_1 = require("convex/values");
var server_2 = require("./_generated/server");
exports.createOrGet = (0, server_2.mutation)({
    args: {
        workspaceId: values_1.v.id("workspaces"),
        memberId: values_1.v.id("members"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, currentMember, otherMember, existingConversation, conversationId;
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
                    currentMember = _a.sent();
                    return [4 /*yield*/, ctx.db.get(args.memberId)];
                case 3:
                    otherMember = _a.sent();
                    if (!currentMember || !otherMember) {
                        throw new Error("Member not found");
                    }
                    return [4 /*yield*/, ctx.db
                            .query("conversations")
                            .filter(function (q) { return q.eq(q.field("workspaceId"), args.workspaceId); })
                            .filter(function (q) {
                            return q.or(q.and(q.eq(q.field("memberOneId"), currentMember._id), q.eq(q.field("memberTwoId"), otherMember._id)), q.and(q.eq(q.field("memberOneId"), otherMember._id), q.eq(q.field("memberTwoId"), currentMember._id)));
                        })
                            .unique()];
                case 4:
                    existingConversation = _a.sent();
                    if (existingConversation) {
                        return [2 /*return*/, existingConversation._id];
                    }
                    return [4 /*yield*/, ctx.db.insert("conversations", {
                            workspaceId: args.workspaceId,
                            memberOneId: currentMember._id,
                            memberTwoId: args.memberId,
                        })];
                case 5:
                    conversationId = _a.sent();
                    return [2 /*return*/, conversationId];
            }
        });
    }); },
});
