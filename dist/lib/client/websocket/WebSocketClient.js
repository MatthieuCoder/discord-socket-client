"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var ws_1 = __importDefault(require("ws"));
var erlpack_1 = require("erlpack");
var OpCodes_1 = require("./typings/OpCodes");
var WebSocketClient = /** @class */ (function () {
    /**
     * Constructs the websocket client.
     * @param options The options applied to the client.
     * @param loadState The session to be loaded.
     */
    function WebSocketClient(options, loadState) {
        if (loadState === void 0) { loadState = {}; }
        /**
         * Used to handle a dispatch (must be defined).
         */
        this.onDispatch = function () { };
        /**
         * When the state should be updated in the cache.
         */
        this.onStateUpdate = function () { };
        /**
         * Callback for a log message.
         */
        this.onLogMessage = function () { };
        this.start = this.internalStart;
        this.configuration = options;
        this.sessionState = loadState;
        // We send a session update to the listener
        this.onStateUpdate(loadState);
    }
    /**
     * Called every time a heartbeat should be received.
     */
    WebSocketClient.prototype.doHeartbeat = function () {
        var _this = this;
        // If the server didn't send the last heartbeat ack.
        if (!this.webSocketState.ack || this.webSocketState.latency > 10000)
            this.internalDisconnect('The server missed the last ack.');
        // Get the current time in ms to calculate the latency.
        var sendHeartbeatTime = new Date().getTime();
        this.webSocketState.ack = false;
        // Define the new handler for the heartbeat ack.
        this.onHeartbeatAck = function () {
            _this.webSocketState.ack = true;
            _this.webSocketState.latency = new Date().getTime() - sendHeartbeatTime;
        };
        this.send(this.sessionState.sequence, OpCodes_1.OpCodes.HEARTBEAT);
    };
    WebSocketClient.prototype.internalDisconnect = function (message) {
        var _a, _b;
        if (((_b = (_a = this.webSocketState) === null || _a === void 0 ? void 0 : _a.websocket) === null || _b === void 0 ? void 0 : _b.readyState) === ws_1["default"].OPEN) {
            this.webSocketState.websocket.close();
            clearInterval(this.webSocketState.heartbeat);
            this.webSocketState = null;
            this.internalStart();
            this.onLogMessage("Disconnected because of '" + message + "'");
        }
    };
    WebSocketClient.prototype.internalStart = function () {
        var _this = this;
        if (!this.webSocketState) {
            this.webSocketState = {
                websocket: new ws_1["default"]('wss://gateway.discord.gg/?v=6&encoding=etf'),
                startTime: new Date(),
                ack: true
            };
            this.webSocketState.websocket
                .on('message', this.handleData.bind(this))
                .on('close', function () { return _this.internalDisconnect('The remote disconnected.'); });
        }
    };
    WebSocketClient.prototype.doLogin = function () {
        var _a, _b;
        if (((_a = this.sessionState) === null || _a === void 0 ? void 0 : _a.resume_token) && ((_b = this.sessionState) === null || _b === void 0 ? void 0 : _b.sequence)) {
            this.send({
                'token': this.configuration.token,
                'session_id': this.sessionState.resume_token,
                'seq': this.sessionState.sequence
            }, OpCodes_1.OpCodes.RESUME);
        }
        else {
            this.send(__assign(__assign({ 'token': this.configuration.token }, (this.configuration.sharding ? { shard: [this.configuration.sharding.thisShard, this.configuration.sharding.totalShards] } : {})), { 'indents': this.configuration.indents, 'properties': {
                    '$os': process.platform,
                    '$browser': 'Matthieu\'s raw lib',
                    '$device': 'Matthieu\'s raw lib'
                }, 'guild_subscriptions': this.configuration.guild_subscriptions || true, 'v': 6, 'compress': false }), OpCodes_1.OpCodes.IDENTIFY);
        }
    };
    WebSocketClient.prototype.send = function (d, op) {
        if (this.webSocketState.websocket && this.webSocketState.websocket.readyState === ws_1["default"].OPEN) {
            this.webSocketState.websocket.send(erlpack_1.pack({ op: op, d: d }));
        }
    };
    WebSocketClient.prototype.handleData = function (data) {
        var payload = erlpack_1.unpack(data);
        if (!payload || payload.op === undefined)
            this.internalDisconnect('The server sent an invalid payload.');
        if (payload.s !== undefined) {
            this.sessionState = __assign(__assign({}, this.sessionState), { sequence: payload.s });
            this.onStateUpdate(this.sessionState);
        }
        switch (payload.op) {
            case OpCodes_1.OpCodes.HELLO:
                this.webSocketState.heartbeat = setInterval(this.doHeartbeat.bind(this), payload.d.heartbeat_interval);
                this.webSocketState.latency = new Date().getTime() - this.webSocketState.startTime.getTime();
                this.doLogin();
                break;
            case OpCodes_1.OpCodes.HEARTBEAT_ACK:
                this.onHeartbeatAck();
                break;
            case OpCodes_1.OpCodes.DISPATCH:
                if (payload.t === 'READY') {
                    this.sessionState = __assign(__assign({}, this.sessionState), { resume_token: payload.d.session_id });
                    this.onStateUpdate(this.sessionState);
                }
                this.onDispatch({ d: payload.d, t: payload.t });
                break;
            case OpCodes_1.OpCodes.RECONNECT:
                this.sessionState = {};
                this.onStateUpdate(this.sessionState);
                this.internalDisconnect('The server requested a RECONNECT');
                break;
            case OpCodes_1.OpCodes.INVALID_SESSION:
                this.sessionState = {};
                this.onStateUpdate(this.sessionState);
                this.internalDisconnect('The server invalidated the session.');
                break;
        }
    };
    return WebSocketClient;
}());
exports["default"] = WebSocketClient;
