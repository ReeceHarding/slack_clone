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
var browser_1 = require("convex/browser");
var dotenv = require("dotenv");
var api_1 = require("../convex/_generated/api");
dotenv.config({ path: '.env.local' });
var client = new browser_1.ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
var testMessages = [
    "Hey team! Just finished the new feature implementation. Looking great!",
    "Can someone review my PR? It's for the authentication flow updates.",
    "The latest deployment went smoothly. All tests are passing.",
    "Heads up - we're seeing some increased latency in the API endpoints.",
    "Just pushed a fix for the mobile navigation bug.",
    "Great work everyone on hitting our sprint goals!",
    "Anyone available for a quick pair programming session?",
    "Documentation has been updated with the new API changes.",
    "The user feedback from the beta test is really positive!",
    "Remember we have our team retrospective tomorrow at 2 PM.",
    "I've optimized the database queries, seeing 40% better performance.",
    "New design system components are now available in Storybook.",
    "Security patch has been applied to all production servers.",
    "The analytics dashboard is showing some interesting user patterns.",
    "Just merged the localization support for 5 new languages."
];
function insertTestMessages() {
    return __awaiter(this, void 0, void 0, function () {
        var workspaceId, channelId, _i, testMessages_1, messageText, messageBody, messageId, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    console.log("Starting to insert test messages...");
                    return [4 /*yield*/, client.mutation(api_1.api.workspaces.create, {
                            name: "Test Workspace"
                        })];
                case 1:
                    workspaceId = _a.sent();
                    console.log("Created workspace:", workspaceId);
                    return [4 /*yield*/, client.mutation(api_1.api.channels.create, {
                            name: "test-channel",
                            workspaceId: workspaceId
                        })];
                case 2:
                    channelId = _a.sent();
                    console.log("Created channel:", channelId);
                    _i = 0, testMessages_1 = testMessages;
                    _a.label = 3;
                case 3:
                    if (!(_i < testMessages_1.length)) return [3 /*break*/, 7];
                    messageText = testMessages_1[_i];
                    messageBody = JSON.stringify({
                        ops: [{ insert: messageText + "\n" }]
                    });
                    return [4 /*yield*/, client.mutation(api_1.api.messages.create, {
                            body: messageBody,
                            workspaceId: workspaceId,
                            channelId: channelId
                        })];
                case 4:
                    messageId = _a.sent();
                    console.log("Inserted message:", messageId);
                    // Wait a bit between messages to not overwhelm the API
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 5:
                    // Wait a bit between messages to not overwhelm the API
                    _a.sent();
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7:
                    console.log("All test messages inserted successfully!");
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _a.sent();
                    console.error("Error inserting test messages:", error_1);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
insertTestMessages();
