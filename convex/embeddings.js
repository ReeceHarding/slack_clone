"use node";
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
exports.insertMessageToPinecone = void 0;
var values_1 = require("convex/values");
var server_1 = require("./_generated/server");
var pinecone_1 = require("@pinecone-database/pinecone");
// Use node: directive to run in Node.js environment
exports.insertMessageToPinecone = (0, server_1.action)({
    args: {
        messageId: values_1.v.id("messages"),
        messageBody: values_1.v.string(),
        channelId: values_1.v.optional(values_1.v.id("channels")),
        conversationId: values_1.v.optional(values_1.v.id("conversations")),
        workspaceId: values_1.v.id("workspaces"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var OpenAI, openai, pinecone, indexName, index, description, embeddingResponse, embedding, plainText, richText, metadata, e_1, error, error_1;
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _j.trys.push([0, 8, , 9]);
                    console.log("Starting insertMessageToPinecone action...");
                    // Dynamic imports inside the handler to work with Node.js environment
                    console.log("Importing dependencies...");
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("openai"); })];
                case 1:
                    OpenAI = (_j.sent()).OpenAI;
                    console.log("Dependencies imported successfully");
                    // Initialize OpenAI client
                    console.log("Initializing OpenAI client...");
                    openai = new OpenAI({
                        apiKey: (_a = process.env.OPENAI_API_KEY) !== null && _a !== void 0 ? _a : "",
                    });
                    console.log("OpenAI client initialized");
                    // Log all Pinecone configuration
                    console.log("Pinecone Configuration:");
                    console.log("API Key length:", (_c = (_b = process.env.PINECONE_API_KEY) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0);
                    console.log("API Key format valid:", (_e = (_d = process.env.PINECONE_API_KEY) === null || _d === void 0 ? void 0 : _d.startsWith("pcsk_")) !== null && _e !== void 0 ? _e : false);
                    console.log("Environment:", process.env.PINECONE_ENVIRONMENT);
                    console.log("Host:", process.env.PINECONE_HOST);
                    console.log("Index:", process.env.PINECONE_INDEX);
                    // Initialize Pinecone client
                    console.log("Initializing Pinecone client...");
                    if (!process.env.PINECONE_API_KEY) {
                        throw new Error("PINECONE_API_KEY is not set");
                    }
                    if (!process.env.PINECONE_INDEX) {
                        throw new Error("PINECONE_INDEX is not set");
                    }
                    pinecone = new pinecone_1.Pinecone({
                        apiKey: process.env.PINECONE_API_KEY
                    });
                    console.log("Pinecone client initialized");
                    _j.label = 2;
                case 2:
                    _j.trys.push([2, 6, , 7]);
                    console.log("Testing Pinecone connection...");
                    indexName = process.env.PINECONE_INDEX;
                    index = pinecone.index(indexName);
                    // Add more detailed error logging
                    console.log("Index object created, attempting to describe index...");
                    console.log("Index configuration:", {
                        name: indexName,
                        apiKeyValid: true
                    });
                    return [4 /*yield*/, pinecone.describeIndex(indexName)];
                case 3:
                    description = _j.sent();
                    console.log("Connection test successful. Index description:", JSON.stringify(description, null, 2));
                    // Get embeddings from OpenAI
                    console.log("Getting embeddings from OpenAI...");
                    return [4 /*yield*/, openai.embeddings.create({
                            model: "text-embedding-3-large", // This model outputs 3072 dimensions
                            input: args.messageBody,
                        })];
                case 4:
                    embeddingResponse = _j.sent();
                    console.log("Got embeddings from OpenAI");
                    embedding = embeddingResponse.data[0].embedding;
                    plainText = args.messageBody;
                    try {
                        richText = JSON.parse(args.messageBody);
                        plainText = ((_f = richText.ops) === null || _f === void 0 ? void 0 : _f.map(function (op) { return op.insert; }).join('')) || args.messageBody;
                    }
                    catch (e) {
                        // If parsing fails, use the original text
                        console.log("Failed to parse rich text, using original:", e);
                    }
                    metadata = {
                        text: plainText,
                        channelId: ((_g = args.channelId) === null || _g === void 0 ? void 0 : _g.toString()) || "",
                        conversationId: ((_h = args.conversationId) === null || _h === void 0 ? void 0 : _h.toString()) || "",
                        workspaceId: args.workspaceId.toString(),
                    };
                    // Upsert the vector to Pinecone
                    console.log("Upserting vector to Pinecone...");
                    console.log("Vector details:", {
                        id: args.messageId,
                        dimensions: embedding.length,
                        metadata: metadata
                    });
                    return [4 /*yield*/, index.upsert([{
                                id: args.messageId.toString(),
                                values: embedding,
                                metadata: metadata
                            }])];
                case 5:
                    _j.sent();
                    console.log("Vector upserted successfully");
                    return [2 /*return*/, { success: true }];
                case 6:
                    e_1 = _j.sent();
                    error = e_1;
                    console.error("Pinecone operation failed with error type:", error.constructor.name);
                    console.error("Error name:", error.name);
                    console.error("Error message:", error.message);
                    if (error.cause) {
                        console.error("Cause:", error.cause);
                        if (error.cause.cause) {
                            console.error("Root cause:", error.cause.cause);
                        }
                    }
                    throw error;
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_1 = _j.sent();
                    // Log detailed error information
                    console.error("Error in insertMessageToPinecone:");
                    console.error("Error message:", error_1.message);
                    console.error("Error stack:", error_1.stack);
                    console.error("Error details:", error_1);
                    // Check environment variables
                    console.log("Environment variables check:");
                    console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
                    console.log("PINECONE_API_KEY exists:", !!process.env.PINECONE_API_KEY);
                    console.log("PINECONE_INDEX exists:", !!process.env.PINECONE_INDEX);
                    console.log("PINECONE_ENVIRONMENT exists:", !!process.env.PINECONE_ENVIRONMENT);
                    return [2 /*return*/, {
                            success: false,
                            error: error_1.message,
                            stack: error_1.stack,
                        }];
                case 9: return [2 /*return*/];
            }
        });
    }); },
});
