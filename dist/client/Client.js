"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var events_1 = require("events");
var Bucket_1 = __importDefault(require("./utils/Bucket"));
var DiscordClient = /** @class */ (function (_super) {
    __extends(DiscordClient, _super);
    function DiscordClient(options) {
        var _this = _super.call(this) || this;
        _this.restRateLimit = new Bucket_1["default"];
        _this.webSocketLimit = new Bucket_1["default"];
        return _this;
    }
    return DiscordClient;
}(events_1.EventEmitter));
exports["default"] = DiscordClient;
