"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("convex/server");
var auth_1 = require("./auth");
console.log("=== HTTP Router Debug Start ===");
var http = (0, server_1.httpRouter)();
console.log("Adding auth routes...");
try {
    auth_1.auth.addHttpRoutes(http);
    console.log("Auth routes added successfully");
}
catch (error) {
    console.error("Error adding auth routes:", error);
    throw error;
}
console.log("=== HTTP Router Debug End ===");
exports.default = http;
