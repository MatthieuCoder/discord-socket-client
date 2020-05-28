import WebSocket from 'ws'
import { pack, unpack } from 'erlpack'
import { OpCodes } from './typings/OpCodes'

/**
 * @class
 * Represents a socket state ( reset every time )
 */
type WebSocketState = {
    heartbeat?: NodeJS.Timeout,
    latency?: number,
    ack?: boolean,
    websocket?: WebSocket,
    startTime: Date
}

/**
 * @class
 * Represents a session state, including the sequence and the resume token, can be synced with redis.
 */
type DiscordSessionState = {
    sequence?: number
    resume_token?: string
}

export type WebSocketClientOptions = {
    token: string,
    indents?: number,
    guild_subscriptions?: boolean
    sharding?: { thisShard: number, totalShards: number }
}

export default class WebSocketClient {
    /**
     * Used to handle a dispatch (must be defined).
     */
    public onDispatch: (event: { d: any, t: string }) => void = () => {}

    /**
     * When the state should be updated in the cache.
     */
    public onStateUpdate: (newState: DiscordSessionState) => void = () => {}

    /**
     * Callback for a log message.
     */
    public onLogMessage: (message: string) => void = () => {}

    /**
     * the function that should be executed when a heartbeat ack is recevied.
     */
    private onHeartbeatAck: Function

    /**
     * The current state of the discord session
     */
    private sessionState: DiscordSessionState

    /**
     * The state of the current opened websocket connection.
     */
    private webSocketState: WebSocketState

    /**
     * The global configuration of the client.
     */
    private configuration: WebSocketClientOptions

    /**
     * Constructs the websocket client.
     * @param options The options applied to the client.
     * @param loadState The session to be loaded.
     */
    public constructor(options: WebSocketClientOptions, loadState: DiscordSessionState = {  }) {
        this.configuration = options
        this.sessionState = loadState
        // We send a session update to the listener
        this.onStateUpdate(loadState)
    }

    /**
     * Called every time a heartbeat should be received.
     */
    private doHeartbeat(): void {
        // If the server didn't send the last heartbeat ack.
        if (!this.webSocketState.ack || this.webSocketState.latency > 10000)
            this.internalDisconnect('The server missed the last ack.')
        // Get the current time in ms to calculate the latency.
        const sendHeartbeatTime = new Date().getTime()
        this.webSocketState.ack = false
        // Define the new handler for the heartbeat ack.
        this.onHeartbeatAck = () => {
            this.webSocketState.ack = true
            this.webSocketState.latency = new Date().getTime() - sendHeartbeatTime
        }
        this.send(this.sessionState.sequence, OpCodes.HEARTBEAT)
    }

    private internalDisconnect(message: string) {
        if (this.webSocketState?.websocket?.readyState === WebSocket.OPEN) {
            this.webSocketState.websocket.close()
            clearInterval(this.webSocketState.heartbeat)
            this.webSocketState = null
            this.internalStart()
            this.onLogMessage(`Disconnected because of '${message}'`)
        }
    }

    private internalStart() {
        if (!this.webSocketState) {
            this.webSocketState = {
                websocket: new WebSocket('wss://gateway.discord.gg/?v=6&encoding=etf'),
                startTime: new Date(),
                ack: true
            }
            this.webSocketState.websocket
                .on('message', this.handleData.bind(this))
                .on('close', () => this.internalDisconnect('The remote disconnected.'))
        }
    }

    private doLogin() {
        if (this.sessionState?.resume_token && this.sessionState?.sequence) {
            this.send({
                'token': this.configuration.token,
                'session_id': this.sessionState.resume_token,
                'seq': this.sessionState.sequence
            }, OpCodes.RESUME)
        } else {
            this.send({
                'token': this.configuration.token,
                ...( this.configuration.sharding ? { shard:[ this.configuration.sharding.thisShard, this.configuration.sharding.totalShards ]} : {} ),
                'indents': this.configuration.indents,
                'properties': {
                    '$os': process.platform,
                    '$browser': 'Matthieu\'s raw lib',
                    '$device': 'Matthieu\'s raw lib'
                },
                'guild_subscriptions': this.configuration.guild_subscriptions || true,
                'v': 6,
                'compress': false
            }, OpCodes.IDENTIFY)
        }
    }

    private send(d: {}, op: OpCodes): void {
        if(this.webSocketState.websocket && this.webSocketState.websocket.readyState === WebSocket.OPEN) {
            this.webSocketState.websocket.send(pack({ op, d }))
        }
    }

    private handleData(data: WebSocket.Data) {
        const payload: { op: number, s: number, d: any, t?: string } = unpack(data as Buffer)
        if (!payload || payload.op === undefined) this.internalDisconnect('The server sent an invalid payload.')
        if (payload.s !== undefined) {
            this.sessionState = { ...this.sessionState, sequence: payload.s }
            this.onStateUpdate(this.sessionState)
        }
        switch (payload.op) {
            case OpCodes.HELLO:
                this.webSocketState.heartbeat = setInterval(this.doHeartbeat.bind(this), payload.d.heartbeat_interval)
                this.webSocketState.latency = new Date().getTime() - this.webSocketState.startTime.getTime()
                this.doLogin()
                break

            case OpCodes.HEARTBEAT_ACK:
                this.onHeartbeatAck()
                break
            case OpCodes.DISPATCH:
                if (payload.t === 'READY') {
                    this.sessionState = {
                        ...this.sessionState,
                        resume_token: payload.d.session_id
                    }
                    this.onStateUpdate(this.sessionState)
                }
                this.onDispatch({ d: payload.d, t: payload.t })
                break
            case OpCodes.RECONNECT:
                this.sessionState = {}
                this.onStateUpdate(this.sessionState)
                this.internalDisconnect('The server requested a RECONNECT')
                break
            case OpCodes.INVALID_SESSION:
                this.sessionState = {}
                this.onStateUpdate(this.sessionState)
                this.internalDisconnect('The server invalidated the session.')
                break
        }
    }
    public start = this.internalStart
}