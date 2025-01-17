"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = exports.signOut = exports.signIn = exports.auth = void 0;
var Password_1 = require("@convex-dev/auth/providers/Password");
var server_1 = require("@convex-dev/auth/server");
exports.auth = (_a = (0, server_1.convexAuth)({
    providers: [Password_1.Password],
}), _a.auth), exports.signIn = _a.signIn, exports.signOut = _a.signOut, exports.store = _a.store;
