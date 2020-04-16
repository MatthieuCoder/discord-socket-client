export default class GatewayConfig {

    // General gateway config
    public shard: number
    public shards: number
    public indents: number
    public token: string

    // Client settings
    public stateUpdateInterval: number

    public reconnect: boolean

    /**
     * getDiscordGatewayUrl - Gets the gateway uri to connect to the discord's realtime gateway.
     */
    public getDiscordGatewayUrl() {
        return `wss://gateway.discord.gg/?v=6&encoding=etf&compress=zlib-stream`
    }
}