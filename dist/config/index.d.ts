export default class GatewayConfig {
    shard: number;
    shards: number;
    indents: number;
    token: string;
    stateUpdateInterval: number;
    reconnect: boolean;
    /**
     * getDiscordGatewayUrl - Gets the gateway uri to connect to the discord's realtime gateway.
     */
    getDiscordGatewayUrl(): string;
}
