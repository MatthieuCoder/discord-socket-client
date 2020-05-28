/// <reference types="node" />
import { EventEmitter } from 'events';
import ClientOptions from './ClientOptions';
export default class DiscordClient extends EventEmitter {
    private restRateLimit;
    private webSocketLimit;
    private websocket;
    constructor(options: ClientOptions);
}
