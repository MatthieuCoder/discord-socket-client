"use strict";
exports.__esModule = true;
var GatewayConfig = /** @class */ (function () {
    function GatewayConfig() {
    }
    /**
     * getDiscordGatewayUrl - Gets the gateway uri to connect to the discord's realtime gateway.
     */
    GatewayConfig.prototype.getDiscordGatewayUrl = function () {
        return "wss://gateway.discord.gg/?v=6&encoding=etf&compress=zlib-stream";
    };
    return GatewayConfig;
}());
exports["default"] = GatewayConfig;
