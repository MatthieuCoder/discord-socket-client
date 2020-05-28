import {EventName, toFriendlyName} from './utils/RawEventNames'
import { EventEmitter } from 'events'
import ClientOptions from "./interfaces/ClientOptions";
import AbstractCacheProvider from "./interfaces/AbstractCacheProvider";
import WebSocketClient from "./client/websocket/WebSocketClient";

export default interface Client extends EventEmitter {
    on(event: EventName, listener: (...args: any[]) => any): this
    once(event: EventName, listener: (...args: any[]) => any): this
}

export default class Client extends EventEmitter implements Client {
    private readonly options: ClientOptions;

    private self: any

    private usersCache: AbstractCacheProvider;
    private guildsCache: AbstractCacheProvider;
    private membersCache: AbstractCacheProvider;
    private rolesCache: AbstractCacheProvider;
    private channelsCache: AbstractCacheProvider;

    private sessionCache: AbstractCacheProvider;

    private websocket: WebSocketClient;
    private application: any;

    constructor(options: ClientOptions) {
        super()
        this.options = options

        this.websocket = new WebSocketClient({
            guild_subscriptions: options.guild_subscriptions,
            sharding: options.sharding,
            indents: options.indents,
            token: options.token
        })
        this.websocket.onLogMessage = console.log
        this.websocket.onDispatch = this.onDispatch.bind(this)
        this.on('ready', (data) => {
            this.self = data.user;
            this.application = data.application;
        })

        this.on('guildCreate', (guild) => {
            this.guildsCache.set(
                guild.id,
                {
                    ...guild
                }
            )
        })
    }
    private onDispatch(event: { d: any, t: string }) {
        this.emit(toFriendlyName(event.t), event.d)
    }
    public start = () => this.websocket.start()
}