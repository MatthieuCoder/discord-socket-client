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
var RawEventNames_1 = require("./utils/RawEventNames");
var events_1 = require("events");
var WebSocketClient_1 = __importDefault(require("./client/websocket/WebSocketClient"));
var Client = /** @class */ (function (_super) {
    __extends(Client, _super);
    function Client(options) {
        var _this = _super.call(this) || this;
        _this.start = function () { return _this.websocket.start(); };
        _this.options = options;
        _this.websocket = new WebSocketClient_1["default"]({
            guild_subscriptions: options.guild_subscriptions,
            sharding: options.sharding,
            indents: options.indents,
            token: options.token
        });
        _this.websocket.onLogMessage = console.log;
        _this.websocket.onDispatch = _this.onDispatch.bind(_this);
        _this.on('ready', function (data) {
            _this.self = data.user;
            _this.application = data.application;
        });
        return _this;
    }
    Client.prototype.onDispatch = function (event) {
        this.emit(RawEventNames_1.toFriendlyName(event.t), event.d);
    };
    Client.prototype.getSelfUser = function () {
        return this.self;
    };
    Client.prototype.getSelfApplication = function () {
        return this.application;
    };
    return Client;
}(events_1.EventEmitter));
exports["default"] = Client;
