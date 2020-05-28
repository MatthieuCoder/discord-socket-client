/**
 * @class
 * Represents a session state, including the sequence and the resume token, can be synced with redis.
 */
declare type DiscordSessionState = {
    sequence?: number;
    resume_token?: string;
};
export declare type WebSocketClientOptions = {
    token: string;
    indents?: number;
    guild_subscriptions?: boolean;
    sharding?: {
        thisShard: number;
        totalShards: number;
    };
};
export default class WebSocketClient {
    /**
     * Used to handle a dispatch (must be defined).
     */
    onDispatch: (event: {
        d: any;
        t: string;
    }) => void;
    /**
     * When the state should be updated in the cache.
     */
    onStateUpdate: (newState: DiscordSessionState) => void;
    /**
     * Callback for a log message.
     */
    onLogMessage: (message: string) => void;
    /**
     * the function that should be executed when a heartbeat ack is recevied.
     */
    private onHeartbeatAck;
    /**
     * The current state of the discord session
     */
    private sessionState;
    /**
     * The state of the current opened websocket connection.
     */
    private webSocketState;
    /**
     * The global configuration of the client.
     */
    private configuration;
    /**
     * Constructs the websocket client.
     * @param options The options applied to the client.
     * @param loadState The session to be loaded.
     */
    constructor(options: WebSocketClientOptions, loadState?: DiscordSessionState);
    /**
     * Called every time a heartbeat should be received.
     */
    private doHeartbeat;
    private internalDisconnect;
    private internalStart;
    private doLogin;
    private send;
    private handleData;
    start: () => void;
}
export {};
