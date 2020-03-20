//#region Imports
import WebSocket, { Data } from 'ws'
import GatewayConfig from '../config/index'
import { EventEmitter } from 'events'
import { pack, unpack } from 'erlpack'
import { Inflate, Z_SYNC_FLUSH } from 'zlib-sync'
import { OpCodes } from './discord/payloads/OpCoders'
//#endregion

//#region Interfaces and objects
/**
 * @interface
 * Define all the available events in the client.
 */
export default interface DiscordSocket {
    on(event: 'log' | 'message', listener: (message: string) => void): this
    on(event: 'error' | 'disconnected' | 'internal', listener: (error: Error) => void): this
    on(event: 'event', listener: (event: any) => void): this
    on(event: 'sessionUpdated', listener: (state: DiscordSocketState) => void): this
    on(event: 'dispatch' | 'presenceUpdate' | 'voiceStateUpdate' | 'reconnect' | 'invalidSession' | 'heartbeatAck' | 'heartbeat' | 'connected' | 'session' | 'resume' | 'crash', listener: () => void): this

    emit(event: 
        'log'           |
        'message'       |
        'error'         |
        'disconnected'  |
        'internal'      |
        'event'         |
        'heartbeat'     |
        'connected'     |
        'session'       |
        'resume'        |
        'heartbeatAck'  |
        'crash'         |
        'sessionUpdated', ...args: any[]): boolean
}

/**
 * @class
 * Represents a socket state ( reset every time )
 */
export class DiscordConnectionState {
    public heartbeat?: NodeJS.Timeout
    public interval?: number
    public letency?: number
    public ack?: boolean
    public inflator?: Inflate
    public websocket?: WebSocket
}

/**
 * @class
 * Represents a session state, including the sequence and the resume token, can be synced with redis.
 */
export class DiscordSocketState {
    public sequence?: number
    public resume_token?: string
}
//#endregion


export default class DiscordSocket extends EventEmitter {

    //#region Fields
    private configuration: GatewayConfig
    
    private socketState: DiscordSocketState
    private connectionState: DiscordConnectionState
    
    private stateUpdated: boolean
    private didLastHeartbeat: boolean
    //#endregion

    //#region External methods
    /**
     * Constructs a gateway connector
     * @param configuration The configuration of the gateway
     * @param state The state of the socket session
     */
    public constructor(configuration : GatewayConfig, state: DiscordSocketState = new DiscordSocketState) {
        super()

        this.configuration = configuration
        // Even if this is a new socket state, we should persist it!    
        this.updateState(state)

        // Every x seconds, we send a sessionUpdated event if the value is changed!
        setInterval(() => {
            if(this.stateUpdated)
                this.emit('sessionUpdated', this.socketState)
            this.stateUpdated = false
        }, this.configuration.stateUpdateInterval)

        if(process.env.NODE_ENV !== 'production')  {
            this.on('log', console.log)
            this.on('error', console.error)
        }

        this.on('disconnected', () => this.destroy(configuration.reconnect))

        this.emit('log', `SocketState sytem started. Updating every ${this.configuration.stateUpdateInterval}ms`)
    }

    public start(restart: boolean = false): void {
        this.emit('log', `${restart ? 'Re-C' : 'C'}onnecting to the gateway.`)
        this.connectionState = new DiscordConnectionState
        this.connectionState.websocket = new WebSocket(this.configuration.getDiscordGatewayUrl())

        this.connectionState.inflator = new Inflate({
            chunkSize: 65535
        })

        this.connectionState.websocket.on('message', this.packetRecieve.bind(this))
        this.connectionState.websocket.on('close', this.disconnect.bind(this))
    }

    public stop(): void {
        this.destroy()
    }

    public destroy(restart?: boolean) : void {
        if(!this.connectionState) {
            this.emit('log', 'Can\'t destroy a non-existing state.')
            return
        }
        if(this.connectionState.websocket.readyState === WebSocket.OPEN) 
            this.connectionState.websocket.close()
        
        clearInterval(this.connectionState.heartbeat)

        if(restart)
            this.start()
    }

    //#endregion

    private disconnect(code: number, message: string, error?: Error): void {
        if(code === -1)
            this.emit('log', `Intentionally disconnected from the WebSocket ${message ? `because of ${message}` : `with error code ${code}`}`)
        if(error)
            this.emit('error', error)
        this.emit('disconnected', error)
    }

    private updateState(newState: DiscordSocketState): boolean {
        if(this.socketState === newState)
            return false
        this.socketState = newState
        return this.stateUpdated = true
    }

    private initialLogin() {
        let payload = {
            'token': this.configuration.token,
            ...( this.configuration.shard && this.configuration.shards ? {shard:[ this.configuration.shard, this.configuration.shards ]} : {} ),
            //'indents': this.configuration.indents,
            'properties': {
                '$os': process.platform,
                '$browser': 'HeroBot Raw Lib',
                '$device': 'HeroBot Raw Lib'
            },
            'guild_subscriptions': false,
            'v': 6,
            'compress': true
        }
        this.emit('log', 'Connection with a new session!')
        this.send(payload, OpCodes.IDENTIFY)
    }

    private resumeLogin() {
        let payload = {
            'token': this.configuration.token,
            'session_id': this.socketState.resume_token,
            'seq': this.socketState.sequence
        }
        this.emit('log', 'Resuming previous session!')
        this.send(payload, OpCodes.RESUME)
    }

    private login() {
        this.socketState.resume_token ? this.resumeLogin() : this.initialLogin()
    }

    private packetRecieve(data: WebSocket.Data): void {
        const payload: { op: number, s: number, d: any, t: string } = this.unpack(data as Buffer)

        if(!payload || payload.op === undefined) return

        if(payload.s)
            this.updateState({
                ...this.socketState,
                sequence: payload.s
            })

        switch(payload.op) {
            case OpCodes.HELLO:
                this.startHeartbeat(payload.d['heartbeat_interval'])
                this.login()
                break
            case OpCodes.HEARTBEAT_ACK:
                this.emit('heartbeatAck')
                break
            case OpCodes.DISPATCH:
                this.handleDispatch(payload.t, payload.d)
                break
            case OpCodes.RECONNECT:
                if(this.socketState.resume_token) {
                    this.updateState(new DiscordSocketState)
                    this.destroy(true)
                }
                break
            case OpCodes.INVALID_SESSION:
                if(this.socketState.resume_token) {
                    this.updateState(new DiscordSocketState)
                    this.destroy(true)
                }
                break
            default:
                // Unknown event!
        }
    }
    public handleDispatch(t: string, d: any) {
        if(t === 'READY') {
            this.updateState({
                ...this.socketState,
                resume_token: d.session_id
            })
            this.emit('log', `New connected as: ${d.user.username}#${d.user.discriminator}`)
            this.emit('log', 'Session saved! ', this.socketState.resume_token)
        }
    }

    private unpack(dataArray: Buffer | ArrayBuffer): any {
        {
            let data: Buffer
            {
                data = (dataArray instanceof ArrayBuffer ? new Uint8Array(dataArray) : dataArray) as Buffer
            }
            {
                // Check if the payload contains the suffix ( code from discord.js )
                const containsSuffix = data.length >= 4 && 
                    data[data.length - 4] === 0x00 &&
                    data[data.length - 3] === 0x00 &&
                    data[data.length - 2] === 0xff &&
                    data[data.length - 1] === 0xff
                this.connectionState
                    .inflator.push(data as Buffer, containsSuffix && Z_SYNC_FLUSH)
                if(!containsSuffix) {
                    this.disconnect(-1, 'Unable to find the suffix!')
                    return
                }
            }
            if(this.connectionState.inflator.err !== 0)  {
                this.disconnect(-1, `Unable to decode the data. Failed at inflate ${this.connectionState.inflator.err}:${this.connectionState.inflator.msg}`)
                return
            }
        }
        try {
            return unpack(this.connectionState.inflator.result as Buffer)
        } catch(e) { this.disconnect(-1, 'Can\'t unpack the data!', e) }
    }

    private send(d: {}, op: OpCodes): any {
        if(this.connectionState.websocket && this.connectionState.websocket.readyState === WebSocket.OPEN)
            this.connectionState.websocket.send(pack({ op, d }))
    }

    private doHeartbeat(): void {
        if(!this.didLastHeartbeat === undefined && !this.didLastHeartbeat) this.disconnect(-1, 'The gateway is not reponding :\'(')
        {
            const lastHeartbeat = new Date().getTime()
            this.didLastHeartbeat = false
            this.emit('heartbeat')
            this.once('heartbeatAck', () => {
                this.didLastHeartbeat = true
                this.connectionState.letency = new Date().getTime() - lastHeartbeat
                this.emit('log', `New latency ${this.connectionState.letency}`)
            })
        }
        this.send(this.socketState.sequence, OpCodes.HEARTBEAT)
    }

    private startHeartbeat(interval: number) {
        this.connectionState.interval = interval
        this.connectionState.heartbeat = setInterval(this.doHeartbeat.bind(this),interval)
    }
}