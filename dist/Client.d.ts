/// <reference types="node" />
import { EventName } from './utils/RawEventNames';
import { EventEmitter } from 'events';
import ClientOptions from "./interfaces/ClientOptions";
export default interface Client extends EventEmitter {
    on(event: EventName, listener: (...args: any[]) => any): this;
    once(event: EventName, listener: (...args: any[]) => any): this;
}
export default class Client extends EventEmitter implements Client {
    private readonly options;
    private self;
    private usersCache;
    private guildsCache;
    private membersCache;
    private rolesCache;
    private channelsCache;
    private sessionCache;
    private websocket;
    private application;
    constructor(options: ClientOptions);
    private onDispatch;
    start: () => void;
}
