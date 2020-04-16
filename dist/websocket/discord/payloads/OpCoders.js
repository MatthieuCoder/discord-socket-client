"use strict";
exports.__esModule = true;
var OpCodes;
(function (OpCodes) {
    OpCodes[OpCodes["DISPATCH"] = 0] = "DISPATCH";
    OpCodes[OpCodes["HEARTBEAT"] = 1] = "HEARTBEAT";
    OpCodes[OpCodes["IDENTIFY"] = 2] = "IDENTIFY";
    OpCodes[OpCodes["STATUS_UPDATE"] = 3] = "STATUS_UPDATE";
    OpCodes[OpCodes["VOICE_SERVER_UPDATE"] = 4] = "VOICE_SERVER_UPDATE";
    OpCodes[OpCodes["RESUME"] = 6] = "RESUME";
    OpCodes[OpCodes["RECONNECT"] = 7] = "RECONNECT";
    OpCodes[OpCodes["REQUEST_GUILD_MEMBERS"] = 8] = "REQUEST_GUILD_MEMBERS";
    OpCodes[OpCodes["INVALID_SESSION"] = 9] = "INVALID_SESSION";
    OpCodes[OpCodes["HELLO"] = 10] = "HELLO";
    OpCodes[OpCodes["HEARTBEAT_ACK"] = 11] = "HEARTBEAT_ACK";
})(OpCodes = exports.OpCodes || (exports.OpCodes = {}));
