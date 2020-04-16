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
//#region Imports
var ws_1 = __importDefault(require("ws"));
var events_1 = require("events");
var erlpack_1 = require("erlpack");
var zlib_sync_1 = require("zlib-sync");
var OpCoders_1 = require("./discord/payloads/OpCoders");
/**
 * @class
 * Represents a socket state ( reset every time )
 */
var DiscordConnectionState = /** @class */ (function () {
    function DiscordConnectionState() {
    }
    return DiscordConnectionState;
}());
exports.DiscordConnectionState = DiscordConnectionState;
/**
 * @class
 * Represents a session state, including the sequence and the resume token, can be synced with redis.
 */
var DiscordSocketState = /** @class */ (function () {
    function DiscordSocketState() {
    }
    return DiscordSocketState;
}());
exports.DiscordSocketState = DiscordSocketState;
//#endregion
var DiscordSocket = /** @class */ (function (_super) {
    __extends(DiscordSocket, _super);
    //#endregion
    //#region External methods
    /**
     * Constructs a gateway connector
     * @param configuration The configuration of the gateway
     * @param state The state of the socket session
     */
    function DiscordSocket(configuration, state) {
        if (state === void 0) { state = new DiscordSocketState; }
        var _this = _super.call(this) || this;
        _this.configuration = configuration;
        // Even if this is a new socket state, we should persist it!    
        _this.updateState(state);
        // Every x seconds, we send a sessionUpdated event if the value is changed!
        setInterval(function () {
            if (_this.stateUpdated)
                _this.emit('sessionUpdated', _this.socketState);
            _this.stateUpdated = false;
        }, _this.configuration.stateUpdateInterval);
        _this.on('disconnected', function () { return _this.destroy(configuration.reconnect); });
        _this.emit('log', "SocketState sytem started. Updating every " + _this.configuration.stateUpdateInterval + "ms");
        return _this;
    }
    DiscordSocket.prototype.start = function (restart) {
        if (restart === void 0) { restart = false; }
        this.emit('log', (restart ? 'Re-C' : 'C') + "onnecting to the gateway.");
        this.connectionState = new DiscordConnectionState;
        this.connectionState.websocket = new ws_1["default"](this.configuration.getDiscordGatewayUrl());
        this.connectionState.inflator = new zlib_sync_1.Inflate({
            chunkSize: 65535
        });
        this.connectionState.websocket.on('message', this.packetRecieve.bind(this));
        this.connectionState.websocket.on('close', this.disconnect.bind(this));
    };
    DiscordSocket.prototype.stop = function () {
        this.destroy();
    };
    DiscordSocket.prototype.destroy = function (restart) {
        if (!this.connectionState) {
            this.emit('log', 'Can\'t destroy a non-existing state.');
            return;
        }
        if (this.connectionState.websocket.readyState === ws_1["default"].OPEN)
            this.connectionState.websocket.close();
        clearInterval(this.connectionState.heartbeat);
        if (restart)
            this.start();
    };
    //#endregion
    DiscordSocket.prototype.disconnect = function (code, message, error) {
        if (code === -1)
            this.emit('log', "Intentionally disconnected from the WebSocket " + (message ? "because of " + message : "with error code " + code));
        if (error)
            this.emit('error', error);
        this.emit('disconnected', error);
    };
    DiscordSocket.prototype.updateState = function (newState) {
        if (this.socketState === newState)
            return false;
        this.socketState = newState;
        return this.stateUpdated = true;
    };
    DiscordSocket.prototype.initialLogin = function () {
        var payload = __assign(__assign({ 'token': this.configuration.token }, (this.configuration.shard && this.configuration.shards ? { shard: [this.configuration.shard, this.configuration.shards] } : {})), { 
            //'indents': this.configuration.indents,
            'properties': {
                '$os': process.platform,
                '$browser': 'HeroBot Raw Lib',
                '$device': 'HeroBot Raw Lib'
            }, 
            //'guild_subscriptions': false,
            'v': 6, 'compress': true });
        this.emit('log', 'Connection with a new session!');
        this.send(payload, OpCoders_1.OpCodes.IDENTIFY);
    };
    DiscordSocket.prototype.resumeLogin = function () {
        var payload = {
            'token': this.configuration.token,
            'session_id': this.socketState.resume_token,
            'seq': this.socketState.sequence
        };
        this.emit('log', 'Resuming previous session!');
        this.send(payload, OpCoders_1.OpCodes.RESUME);
    };
    DiscordSocket.prototype.login = function () {
        this.socketState.resume_token ? this.resumeLogin() : this.initialLogin();
    };
    DiscordSocket.prototype.packetRecieve = function (data) {
        var payload = this.unpack(data);
        if (!payload || payload.op === undefined)
            return;
        if (payload.s)
            this.updateState(__assign(__assign({}, this.socketState), { sequence: payload.s }));
        switch (payload.op) {
            case OpCoders_1.OpCodes.HELLO:
                this.startHeartbeat(payload.d['heartbeat_interval']);
                this.login();
                break;
            case OpCoders_1.OpCodes.HEARTBEAT_ACK:
                this.emit('heartbeatAck');
                break;
            case OpCoders_1.OpCodes.DISPATCH:
                this.handleDispatch(payload.t, payload.d);
                break;
            case OpCoders_1.OpCodes.RECONNECT:
                if (this.socketState.resume_token) {
                    this.updateState(new DiscordSocketState);
                    this.destroy(true);
                }
                break;
            case OpCoders_1.OpCodes.INVALID_SESSION:
                if (this.socketState.resume_token) {
                    this.updateState(new DiscordSocketState);
                    this.destroy(true);
                }
                break;
            default:
            // Unknown event!
        }
    };
    DiscordSocket.prototype.handleDispatch = function (t, d) {
        if (t === 'READY') {
            this.updateState(__assign(__assign({}, this.socketState), { resume_token: d.session_id }));
            this.emit('log', "New connected as: " + d.user.username + "#" + d.user.discriminator);
        }
        this.emit('event', { type: t, data: d });
    };
    //#region Unpack and encryption
    DiscordSocket.prototype.unpack = function (dataArray) {
        {
            var data = void 0;
            {
                data = (dataArray instanceof ArrayBuffer ? new Uint8Array(dataArray) : dataArray);
            }
            {
                // Check if the payload contains the suffix ( code from discord.js )
                var containsSuffix = data.length >= 4 &&
                    data[data.length - 4] === 0x00 &&
                    data[data.length - 3] === 0x00 &&
                    data[data.length - 2] === 0xff &&
                    data[data.length - 1] === 0xff;
                this.connectionState
                    .inflator.push(data, containsSuffix && zlib_sync_1.Z_SYNC_FLUSH);
                if (!containsSuffix) {
                    this.disconnect(-1, 'Unable to find the suffix!');
                    return;
                }
            }
            if (this.connectionState.inflator.err !== 0) {
                this.disconnect(-1, "Unable to decode the data. Failed at inflate " + this.connectionState.inflator.err + ":" + this.connectionState.inflator.msg);
                return;
            }
        }
        try {
            return erlpack_1.unpack(this.connectionState.inflator.result);
        }
        catch (e) {
            this.disconnect(-1, 'Can\'t unpack the data!', e);
        }
    };
    //#endregion
    DiscordSocket.prototype.send = function (d, op) {
        if (this.connectionState.websocket && this.connectionState.websocket.readyState === ws_1["default"].OPEN)
            this.connectionState.websocket.send(erlpack_1.pack({ op: op, d: d }));
    };
    DiscordSocket.prototype.doHeartbeat = function () {
        var _this = this;
        if (!this.didLastHeartbeat === undefined && !this.didLastHeartbeat)
            this.disconnect(-1, 'The gateway is not reponding :\'(');
        {
            var lastHeartbeat_1 = new Date().getTime();
            this.didLastHeartbeat = false;
            this.emit('heartbeat');
            this.once('heartbeatAck', function () {
                _this.didLastHeartbeat = true;
                _this.connectionState.letency = new Date().getTime() - lastHeartbeat_1;
                _this.emit('log', "Latency updated " + _this.connectionState.letency);
            });
        }
        this.send(this.socketState.sequence, OpCoders_1.OpCodes.HEARTBEAT);
    };
    DiscordSocket.prototype.startHeartbeat = function (interval) {
        this.connectionState.interval = interval;
        this.connectionState.heartbeat = setInterval(this.doHeartbeat.bind(this), interval);
        this.emit('log', 'Socket heartbeat started.');
    };
    return DiscordSocket;
}(events_1.EventEmitter));
exports["default"] = DiscordSocket;
