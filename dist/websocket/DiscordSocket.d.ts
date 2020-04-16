/// <reference types="node" />
import WebSocket from 'ws';
import GatewayConfig from '../config/index';
import { EventEmitter } from 'events';
import { Inflate } from 'zlib-sync';
/**
 * @interface
 * Define all the available events in the client.
 */
export default interface DiscordSocket {
    on(event: 'log' | 'message', listener: (message: string) => void): this;
    on(event: 'error' | 'disconnected' | 'internal', listener: (error: Error) => void): this;
    on(event: 'event', listener: (event: any) => void): this;
    on(event: 'sessionUpdated', listener: (state: DiscordSocketState) => void): this;
    on(event: 'dispatch' | 'presenceUpdate' | 'voiceStateUpdate' | 'reconnect' | 'invalidSession' | 'heartbeatAck' | 'heartbeat' | 'connected' | 'session' | 'resume' | 'crash', listener: () => void): this;
    emit(event: 'log' | 'message' | 'error' | 'disconnected' | 'internal' | 'event' | 'heartbeat' | 'connected' | 'session' | 'resume' | 'heartbeatAck' | 'crash' | 'sessionUpdated', ...args: any[]): boolean;
}
/**
 * @class
 * Represents a socket state ( reset every time )
 */
export declare class DiscordConnectionState {
    heartbeat?: NodeJS.Timeout;
    interval?: number;
    letency?: number;
    ack?: boolean;
    inflator?: Inflate;
    websocket?: WebSocket;
}
/**
 * @class
 * Represents a session state, including the sequence and the resume token, can be synced with redis.
 */
export declare class DiscordSocketState {
    sequence?: number;
    resume_token?: string;
}
export default class DiscordSocket extends EventEmitter {
    private configuration;
    private socketState;
    private connectionState;
    private stateUpdated;
    private didLastHeartbeat;
    /**
     * Constructs a gateway connector
     * @param configuration The configuration of the gateway
     * @param state The state of the socket session
     */
    constructor(configuration: GatewayConfig, state?: DiscordSocketState);
    start(restart?: boolean): void;
    stop(): void;
    destroy(restart?: boolean): void;
    private disconnect;
    private updateState;
    private initialLogin;
    private resumeLogin;
    private login;
    private packetRecieve;
    handleDispatch(t: string, d: any): void;
    private unpack;
    private send;
    private doHeartbeat;
    private startHeartbeat;
}
