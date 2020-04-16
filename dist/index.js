"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var DiscordSocket_1 = __importDefault(require("./websocket/DiscordSocket"));
var config_1 = __importDefault(require("./config"));
exports["default"] = {
    DiscordSocket: DiscordSocket_1["default"],
    DiscordConfig: config_1["default"]
};
